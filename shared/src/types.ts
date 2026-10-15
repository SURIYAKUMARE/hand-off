export type UserRole = 'EMPLOYEE' | 'TECHNICIAN';

export type TicketCategory = 'HARDWARE' | 'NETWORK' | 'SOFTWARE' | 'ACCOUNT_ACCESS';

export type TicketPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface TicketSummary {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  reporterId: string;
  assignedTechnicianId: string | null;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
  };
  assignedTechnician: {
    id: string;
    name: string;
    email: string;
  } | null;
  _count?: {
    comments: number;
  };
}

export interface TicketDetail extends TicketSummary {
  comments: CommentItem[];
  statusHistory: StatusHistoryItem[];
  events: TicketEventItem[];
}

export interface StatusHistoryItem {
  id: string;
  ticketId: string;
  previousStatus: TicketStatus;
  newStatus: TicketStatus;
  changedBy: string;
  changedAt: string;
  changer: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export interface TicketEventItem {
  id: string;
  ticketId: string;
  eventType: 'CREATED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'COMMENTED';
  actorId: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export interface CommentItem {
  id: string;
  ticketId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    role: UserRole;
  };
}

export interface DashboardSummary {
  openIssues: number;
  urgentRequests: number;
  inProgress: number;
  completed: number;
}

export interface StatusDistributionItem {
  status: TicketStatus;
  label: string;
  count: number;
  color: string;
}

export interface PriorityDistributionItem {
  priority: TicketPriority;
  label: string;
  count: number;
  color: string;
}

export interface TechnicianWorkloadItem {
  technicianId: string;
  name: string;
  email: string;
  assigned: number;
  inProgress: number;
  resolved: number;
}

export interface ActivityFeedItem {
  id: string;
  ticketId: string;
  ticketNumber: string;
  ticketTitle: string;
  eventType: 'CREATED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'COMMENTED';
  actorName: string;
  actorRole: UserRole;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  summary: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SLAStatus {
  ageMinutes: number;
  ageFormatted: string;
  slaLimitHours: number;
  hoursRemaining: number;
  isBreached: boolean;
  isApproaching: boolean;
}
