import { TicketCategory, TicketPriority, TicketStatus } from './types';

export const VALID_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS'],
  IN_PROGRESS: ['RESOLVED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
};

export function canTransitionStatus(current: TicketStatus, target: TicketStatus): boolean {
  return VALID_STATUS_TRANSITIONS[current]?.includes(target) ?? false;
}

export function getNextPermittedStatus(current: TicketStatus): TicketStatus | null {
  const next = VALID_STATUS_TRANSITIONS[current];
  return next && next.length > 0 ? next[0] : null;
}

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  HARDWARE: 'Hardware',
  NETWORK: 'Network',
  SOFTWARE: 'Software',
  ACCOUNT_ACCESS: 'Account access',
};

export const TECHNICIAN_SPECIALIZATION_LABELS = {
  HARDWARE: 'Hardware',
  NETWORK: 'Network',
  SOFTWARE: 'Software',
  ACCOUNT_ACCESS: 'Account Access',
  GENERAL_IT: 'General IT Support',
} as const;

export const SPECIALIZATION_CONFIG = {
  HARDWARE: { label: 'Hardware', color: '#B54708', bgColor: '#FFFAEB', borderColor: '#FEDF89' },
  NETWORK: { label: 'Network', color: '#175CD3', bgColor: '#EFF8FF', borderColor: '#B2DDFF' },
  SOFTWARE: { label: 'Software', color: '#6941C6', bgColor: '#F9F5FF', borderColor: '#E9D7FE' },
  ACCOUNT_ACCESS: { label: 'Account Access', color: '#C01048', bgColor: '#FFF1F3', borderColor: '#FECDCA' },
  GENERAL_IT: { label: 'General IT', color: '#344054', bgColor: '#F8F9FC', borderColor: '#EAECF0' },
} as const;

export const TECHNICIAN_STATUS_CONFIG = {
  AVAILABLE: { label: 'Available', color: '#12B76A', bg: '#ECFDF3', bgColor: '#ECFDF3', border: '#A6F4C5' },
  BUSY: { label: 'Busy', color: '#F79009', bg: '#FEF0C7', bgColor: '#FEF0C7', border: '#FEDF89' },
  UNAVAILABLE: { label: 'Unavailable', color: '#667085', bg: '#F2F4F7', bgColor: '#F2F4F7', border: '#D0D5DD' },
} as const;

export const ACCOUNT_STATUS_CONFIG = {
  ACTIVE: { label: 'Active', color: '#027A48', bg: '#ECFDF3', border: '#A6F4C5' },
  INACTIVE: { label: 'Inactive', color: '#475467', bg: '#F2F4F7', border: '#D0D5DD' },
  SUSPENDED: { label: 'Suspended', color: '#B42318', bg: '#FEF3F2', border: '#FECDCA' },
} as const;

export const ASSET_TYPE_LABELS = {
  LAPTOP: 'Laptop',
  DESKTOP: 'Desktop',
  PRINTER: 'Printer',
  MONITOR: 'Monitor',
  ROUTER: 'Router',
  OTHER: 'Other Equipment',
} as const;

export const ASSET_STATUS_CONFIG = {
  ACTIVE: { label: 'In Use', color: '#027A48', bgColor: '#ECFDF3', bg: '#ECFDF3' },
  IN_USE: { label: 'In Use', color: '#027A48', bgColor: '#ECFDF3', bg: '#ECFDF3' },
  IN_STORAGE: { label: 'In Storage', color: '#175CD3', bgColor: '#EFF8FF', bg: '#EFF8FF' },
  UNDER_REPAIR: { label: 'Under Repair', color: '#B54708', bgColor: '#FFFAEB', bg: '#FFFAEB' },
  MAINTENANCE: { label: 'Under Repair', color: '#B54708', bgColor: '#FFFAEB', bg: '#FFFAEB' },
  RETIRED: { label: 'Retired', color: '#667085', bgColor: '#F2F4F7', bg: '#F2F4F7' },
} as const;

export const PRIORITY_CONFIG: Record<
  TicketPriority,
  {
    label: string;
    description: string;
    color: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    slaHours: number;
    warningHours: number;
  }
> = {
  URGENT: {
    label: 'Urgent',
    description: 'System completely down or critical business operation halted',
    color: '#D92D20',
    badgeBg: '#FEF3F2',
    badgeBorder: '#FECDCA',
    badgeText: '#B42318',
    slaHours: 4,
    warningHours: 3,
  },
  HIGH: {
    label: 'High',
    description: 'Significant business degradation with no immediate workaround',
    color: '#F79009',
    badgeBg: '#FFFAEB',
    badgeBorder: '#FEDF89',
    badgeText: '#B54708',
    slaHours: 8,
    warningHours: 6,
  },
  MEDIUM: {
    label: 'Medium',
    description: 'Non-critical problem impacting standard productivity',
    color: '#2E90FA',
    badgeBg: '#EFF8FF',
    badgeBorder: '#B2DDFF',
    badgeText: '#175CD3',
    slaHours: 24,
    warningHours: 18,
  },
  LOW: {
    label: 'Low',
    description: 'Minor issue, informational query, or routine configuration request',
    color: '#667085',
    badgeBg: '#F8F9FC',
    badgeBorder: '#EAECF0',
    badgeText: '#344054',
    slaHours: 48,
    warningHours: 36,
  },
};

export const STATUS_CONFIG: Record<
  TicketStatus,
  {
    label: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    indicatorColor: string;
  }
> = {
  OPEN: {
    label: 'Open',
    badgeBg: '#EFF8FF',
    badgeBorder: '#B2DDFF',
    badgeText: '#175CD3',
    indicatorColor: '#2E90FA',
  },
  IN_PROGRESS: {
    label: 'In progress',
    badgeBg: '#FEF0C7',
    badgeBorder: '#FEDF89',
    badgeText: '#B54708',
    indicatorColor: '#F79009',
  },
  RESOLVED: {
    label: 'Resolved',
    badgeBg: '#ECFDF3',
    badgeBorder: '#A6F4C5',
    badgeText: '#027A48',
    indicatorColor: '#12B76A',
  },
  CLOSED: {
    label: 'Closed',
    badgeBg: '#F2F4F7',
    badgeBorder: '#D0D5DD',
    badgeText: '#344054',
    indicatorColor: '#667085',
  },
};

/**
 * Calculates human-readable age and real SLA status from a creation timestamp and priority
 */
export function calculateSLA(createdAt: string | Date, priority: TicketPriority, status: TicketStatus) {
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - created);
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = diffMinutes / 60;

  let ageFormatted = '';
  if (diffMinutes < 60) {
    ageFormatted = `${diffMinutes} min`;
  } else if (diffHours < 24) {
    ageFormatted = `${Math.floor(diffHours)} hr`;
  } else {
    const days = Math.floor(diffHours / 24);
    ageFormatted = `${days} ${days === 1 ? 'day' : 'days'}`;
  }

  const { slaHours, warningHours } = PRIORITY_CONFIG[priority];

  // If already resolved or closed, SLA is halted
  if (status === 'RESOLVED' || status === 'CLOSED') {
    return {
      ageMinutes: diffMinutes,
      ageFormatted,
      slaLimitHours: slaHours,
      hoursRemaining: Math.max(0, slaHours - diffHours),
      isBreached: false,
      isApproaching: false,
    };
  }

  const isBreached = diffHours >= slaHours;
  const isApproaching = !isBreached && diffHours >= warningHours;

  return {
    ageMinutes: diffMinutes,
    ageFormatted,
    slaLimitHours: slaHours,
    hoursRemaining: Math.max(0, slaHours - diffHours),
    isBreached,
    isApproaching,
  };
}

export const METRIC_DEFINITIONS = {
  openIssues: 'Tickets with status Open.',
  urgentRequests: 'Active tickets (not Closed) with priority Urgent.',
  inProgress: 'Tickets with status In progress.',
  completed: 'Tickets with status Resolved or Closed.',
};
