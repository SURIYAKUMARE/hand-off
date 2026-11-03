export type UserRole = 'ADMIN' | 'TECHNICIAN' | 'EMPLOYEE';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type TechnicianStatus = 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';

export type TechnicianSpecialization =
  | 'HARDWARE'
  | 'NETWORK'
  | 'SOFTWARE'
  | 'ACCOUNT_ACCESS'
  | 'GENERAL_IT';

export type TicketCategory = 'HARDWARE' | 'NETWORK' | 'SOFTWARE' | 'ACCOUNT_ACCESS';

export type TicketPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

export type AssetType = 'LAPTOP' | 'DESKTOP' | 'PRINTER' | 'MONITOR' | 'ROUTER' | 'OTHER';

export type AssetStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';

export type NotificationType =
  | 'TICKET_CREATED'
  | 'TICKET_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'NEW_COMMENT'
  | 'SLA_WARNING'
  | 'SLA_BREACH'
  | 'ESCALATED';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  employeeId?: string | null;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentSummary {
  id: string;
  name: string;
  code?: string;
  description?: string | null;
  isActive: boolean;
  userCount?: number;
  ticketCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TechnicianProfileSummary {
  id: string;
  userId: string;
  specialization: TechnicianSpecialization;
  status: TechnicianStatus;
  maxActiveTickets: number;
}

export interface TechnicianWorkloadItem {
  technicianId: string;
  name: string;
  email: string;
  specialization: TechnicianSpecialization;
  status: TechnicianStatus;
  assigned: number;
  inProgress: number;
  resolved: number;
  overdue: number;
}

export interface AttachmentItem {
  id: string;
  fileName: string;
  filename?: string;
  fileSize: number;
  size?: number;
  mimeType: string;
  mimetype?: string;
  storagePath?: string;
  ticketId: string;
  commentId?: string | null;
  uploaderId: string;
  uploader?: {
    id: string;
    name: string;
  };
  createdAt: string;
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
  departmentId?: string | null;
  assetId?: string | null;
  slaDeadline?: string | null;
  firstResponseDeadline?: string | null;
  firstResponseAt?: string | null;
  resolvedAt?: string | null;
  isEscalated?: boolean;
  createdAt: string;
  updatedAt: string;
  reporter: {
    id: string;
    name: string;
    email: string;
    department?: {
      id: string;
      name: string;
    } | null;
  };
  assignedTechnician: {
    id: string;
    name: string;
    email: string;
    technicianProfile?: TechnicianProfileSummary | null;
  } | null;
  department?: {
    id: string;
    name: string;
  } | null;
  asset?: {
    id: string;
    assetTag: string;
    name: string;
    type: AssetType;
  } | null;
  attachments?: AttachmentItem[];
  _count?: {
    comments: number;
    attachments?: number;
  };
}

export interface TicketDetail extends TicketSummary {
  comments: CommentItem[];
  statusHistory: StatusHistoryItem[];
  events: TicketEventItem[];
  feedback?: TicketFeedbackItem | null;
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
  eventType: 'CREATED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'COMMENTED' | 'ESCALATED';
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
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    role: UserRole;
  };
  attachments?: AttachmentItem[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface DuplicateTicketMatch {
  id: string;
  ticketNumber: string;
  title: string;
  status: TicketStatus;
  category: TicketCategory;
}

export interface SlaPolicyItem {
  id: string;
  priority: TicketPriority;
  firstResponseMinutes?: number;
  resolutionMinutes?: number;
  firstResponseHours?: number;
  resolutionHours?: number;
  escalationHours?: number;
  businessHoursOnly?: boolean;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeArticleItem {
  id: string;
  title: string;
  category: TicketCategory;
  summary?: string | null;
  content: string;
  tags?: string[];
  isPublished: boolean;
  authorId: string;
  author: {
    id: string;
    name: string;
  };
  views?: number;
  viewCount?: number;
  helpfulCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AssetItem {
  id: string;
  assetTag: string;
  name: string;
  type: AssetType;
  model?: string | null;
  serialNumber?: string | null;
  assignedUserId?: string | null;
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
  } | null;
  status: AssetStatus;
  activeTicketCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketFeedbackItem {
  id: string;
  ticketId: string;
  employeeId: string;
  employee?: {
    id: string;
    name: string;
  };
  rating: number; // 1 to 5
  comment?: string | null;
  createdAt: string;
}

export interface AutomationRuleItem {
  id: string;
  name: string;
  description?: string | null;
  trigger?: string;
  conditions?: string;
  actions?: string;
  eventType: string;
  actionType: string;
  isEnabled?: boolean;
  isActive?: boolean;
  configJson?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId?: string | null;
  actor?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  user?: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  action: string;
  targetType: string;
  entityType?: string;
  targetId?: string | null;
  details?: string | null;
  metadataJson?: string | null;
  ipAddress?: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  openIssues: number;
  urgentRequests: number;
  inProgress: number;
  completed: number;
}

export interface AdminDashboardMetrics {
  totalUsers: number;
  activeEmployees: number;
  availableTechnicians: number;
  totalTickets: number;
  openTickets: number;
  urgentTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  slaBreaches: number;
  unassignedTickets: number;
  ticketsByStatus: StatusDistributionItem[];
  ticketsByPriority: PriorityDistributionItem[];
  departmentIssues: Array<{ name: string; ticketCount: number }>;
  technicianWorkload: TechnicianWorkloadItem[];
  monthlyVolume: MonthlyTicketVolumeItem[];
  resolutionTimeTrends: Array<{ month: string; avgHours: number }>;
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

export interface DepartmentDistributionItem {
  departmentId: string;
  departmentName: string;
  ticketCount: number;
}

export interface MonthlyTicketVolumeItem {
  month: string;
  created: number;
  resolved: number;
}

export interface ResolutionTrendItem {
  period: string;
  avgHours: number;
}

export interface ActivityFeedItem {
  id: string;
  ticketId: string;
  ticketNumber: string;
  ticketTitle: string;
  eventType: 'CREATED' | 'ASSIGNED' | 'STATUS_CHANGED' | 'COMMENTED' | 'ESCALATED';
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
