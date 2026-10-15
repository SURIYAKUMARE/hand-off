import { api } from '../api/client';
import { CreateTicketInput, TicketSummary, CommentItem } from '@helpdesk360/shared';

export interface OutboxItem {
  id: string;
  type: 'CREATE_TICKET' | 'ADD_COMMENT' | 'UPDATE_STATUS' | 'ASSIGN_TECHNICIAN';
  payload: any;
  createdAt: string;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  error?: string;
  optimisticId?: string;
}

const OUTBOX_STORAGE_KEY = 'helpdesk360_sync_outbox';
const OFFLINE_TICKETS_KEY = 'helpdesk360_offline_tickets';

// 1. Get All Items in Outbox
export function getOutboxItems(): OutboxItem[] {
  try {
    const raw = localStorage.getItem(OUTBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

// 2. Save Outbox Items
function saveOutboxItems(items: OutboxItem[]) {
  try {
    localStorage.setItem(OUTBOX_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('helpdesk360_outbox_updated', { detail: { count: items.length } }));
  } catch (err) {
    console.error('Failed to save outbox items', err);
  }
}

// 3. Queue an Offline Ticket Creation
export function queueOfflineTicket(
  input: CreateTicketInput,
  reporter: { id: string; name: string; email: string }
): TicketSummary & { isPendingSync: boolean } {
  const optimisticId = 'opt-' + Math.random().toString(36).substring(2, 9);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const ticketNumber = `HD-PENDING-${randomSuffix}`;

  const optimisticTicket: TicketSummary & { isPendingSync: boolean } = {
    id: optimisticId,
    ticketNumber,
    title: input.title,
    description: input.description,
    category: input.category,
    priority: input.priority,
    status: 'OPEN',
    reporterId: reporter.id,
    assignedTechnicianId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    reporter: {
      id: reporter.id,
      name: reporter.name,
      email: reporter.email,
    },
    assignedTechnician: null,
    isPendingSync: true,
  };

  const item: OutboxItem = {
    id: 'outbox-' + Math.random().toString(36).substring(2, 9),
    type: 'CREATE_TICKET',
    payload: input,
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    optimisticId,
  };

  const currentOutbox = getOutboxItems();
  currentOutbox.push(item);
  saveOutboxItems(currentOutbox);

  // Store in offline tickets cache so it immediately displays in views
  const offlineTickets = getCachedOfflineTickets();
  offlineTickets.unshift(optimisticTicket);
  saveCachedOfflineTickets(offlineTickets);

  return optimisticTicket;
}

// 4. Queue an Offline Comment
export function queueOfflineComment(
  ticketId: string,
  content: string,
  author: { id: string; name: string; role: any }
): CommentItem & { isPendingSync: boolean } {
  const optimisticComment: CommentItem & { isPendingSync: boolean } = {
    id: 'opt-c-' + Math.random().toString(36).substring(2, 9),
    ticketId,
    authorId: author.id,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    author: {
      id: author.id,
      name: author.name,
      role: author.role,
    },
    isPendingSync: true,
  };

  const item: OutboxItem = {
    id: 'outbox-' + Math.random().toString(36).substring(2, 9),
    type: 'ADD_COMMENT',
    payload: { ticketId, content },
    createdAt: new Date().toISOString(),
    status: 'PENDING',
    optimisticId: optimisticComment.id,
  };

  const currentOutbox = getOutboxItems();
  currentOutbox.push(item);
  saveOutboxItems(currentOutbox);

  return optimisticComment;
}

// 4b. Queue Offline Status Update
export function queueOfflineStatus(ticketId: string, status: any) {
  const item: OutboxItem = {
    id: 'outbox-' + Math.random().toString(36).substring(2, 9),
    type: 'UPDATE_STATUS',
    payload: { ticketId, status },
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  };

  const currentOutbox = getOutboxItems();
  currentOutbox.push(item);
  saveOutboxItems(currentOutbox);
}

// 4c. Queue Offline Assignment
export function queueOfflineAssignment(ticketId: string, assignedTechnicianId: string | null) {
  const item: OutboxItem = {
    id: 'outbox-' + Math.random().toString(36).substring(2, 9),
    type: 'ASSIGN_TECHNICIAN',
    payload: { ticketId, assignedTechnicianId },
    createdAt: new Date().toISOString(),
    status: 'PENDING',
  };

  const currentOutbox = getOutboxItems();
  currentOutbox.push(item);
  saveOutboxItems(currentOutbox);
}

// 5. Offline Tickets Cache
export function getCachedOfflineTickets(): Array<TicketSummary & { isPendingSync?: boolean }> {
  try {
    const raw = localStorage.getItem(OFFLINE_TICKETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveCachedOfflineTickets(tickets: Array<TicketSummary & { isPendingSync?: boolean }>) {
  try {
    localStorage.setItem(OFFLINE_TICKETS_KEY, JSON.stringify(tickets));
  } catch (err) {
    console.error('Failed to cache offline tickets', err);
  }
}

// 6. Flush / Sync Outbox to Backend Server
export async function syncOutbox(): Promise<{ syncedCount: number; errors: number }> {
  const outbox = getOutboxItems();
  if (outbox.length === 0) {
    return { syncedCount: 0, errors: 0 };
  }

  let syncedCount = 0;
  let errors = 0;
  const remainingOutbox: OutboxItem[] = [];

  for (const item of outbox) {
    try {
      if (item.type === 'CREATE_TICKET') {
        const res = await api.post<{ success: boolean; ticket: TicketSummary }>('/tickets', item.payload);
        if (res.success && res.ticket) {
          syncedCount++;
          // Replace optimistic ticket in offline cache with confirmed ticket
          const cached = getCachedOfflineTickets();
          const updated = cached.map((t) => (t.id === item.optimisticId ? res.ticket : t));
          saveCachedOfflineTickets(updated);
          continue;
        }
      } else if (item.type === 'ADD_COMMENT') {
        const res = await api.post<{ success: boolean }>(`/tickets/${item.payload.ticketId}/comments`, {
          content: item.payload.content,
        });
        if (res.success) {
          syncedCount++;
          continue;
        }
      } else if (item.type === 'UPDATE_STATUS') {
        const res = await api.patch<{ success: boolean }>(`/tickets/${item.payload.ticketId}/status`, {
          status: item.payload.status,
        });
        if (res.success) {
          syncedCount++;
          continue;
        }
      } else if (item.type === 'ASSIGN_TECHNICIAN') {
        const res = await api.patch<{ success: boolean }>(`/tickets/${item.payload.ticketId}/assign`, {
          assignedTechnicianId: item.payload.assignedTechnicianId,
        });
        if (res.success) {
          syncedCount++;
          continue;
        }
      }

      // If action did not succeed, retain for next sync attempt
      remainingOutbox.push(item);
      errors++;
    } catch (err: any) {
      console.warn('Sync failed for outbox item', item.id, err);
      item.status = 'FAILED';
      item.error = err?.message || 'Network sync error';
      remainingOutbox.push(item);
      errors++;
    }
  }

  saveOutboxItems(remainingOutbox);
  return { syncedCount, errors };
}
