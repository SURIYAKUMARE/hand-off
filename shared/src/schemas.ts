import { z } from 'zod';

export const RoleEnum = z.enum(['ADMIN', 'TECHNICIAN', 'EMPLOYEE']);
export const AccountStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export const TechnicianStatusEnum = z.enum(['AVAILABLE', 'BUSY', 'UNAVAILABLE']);
export const TechnicianSpecializationEnum = z.enum([
  'HARDWARE',
  'NETWORK',
  'SOFTWARE',
  'ACCOUNT_ACCESS',
  'GENERAL_IT',
]);

export const CategoryEnum = z.enum(['HARDWARE', 'NETWORK', 'SOFTWARE', 'ACCOUNT_ACCESS']);
export const PriorityEnum = z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']);
export const StatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);
export const AssetTypeEnum = z.enum(['LAPTOP', 'DESKTOP', 'PRINTER', 'MONITOR', 'ROUTER', 'OTHER']);
export const AssetStatusEnum = z.enum(['ACTIVE', 'MAINTENANCE', 'RETIRED']);

export const LoginSchema = z.object({
  email: z.string().trim().email({ message: 'Enter a valid email address.' }),
  password: z.string().min(1, { message: 'Enter your password.' }),
  rememberMe: z.boolean().optional(),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const CreateUserSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().trim().email({ message: 'Enter a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  role: RoleEnum,
  status: AccountStatusEnum.default('ACTIVE'),
  departmentId: z.string().nullable().optional(),
  employeeId: z.string().trim().nullable().optional(),
  specialization: TechnicianSpecializationEnum.optional(),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters.' }).optional(),
  email: z.string().trim().email({ message: 'Enter a valid email address.' }).optional(),
  role: RoleEnum.optional(),
  status: AccountStatusEnum.optional(),
  departmentId: z.string().nullable().optional(),
  employeeId: z.string().trim().nullable().optional(),
  specialization: TechnicianSpecializationEnum.optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const ResetPasswordSchema = z.object({
  newPassword: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const CreateDepartmentSchema = z.object({
  name: z.string().trim().min(2, { message: 'Department name must be at least 2 characters.' }),
  description: z.string().trim().optional(),
});
export type CreateDepartmentInput = z.infer<typeof CreateDepartmentSchema>;

export const UpdateDepartmentSchema = z.object({
  name: z.string().trim().min(2, { message: 'Department name must be at least 2 characters.' }).optional(),
  description: z.string().trim().optional(),
  isActive: z.boolean().optional(),
});
export type UpdateDepartmentInput = z.infer<typeof UpdateDepartmentSchema>;

export const UpdateTechnicianProfileSchema = z.object({
  specialization: TechnicianSpecializationEnum.optional(),
  status: TechnicianStatusEnum.optional(),
  maxActiveTickets: z.number().int().min(1).max(20).optional(),
});
export type UpdateTechnicianProfileInput = z.infer<typeof UpdateTechnicianProfileSchema>;

export const CreateTicketSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'Enter a ticket title (at least 3 characters).' })
    .max(120, { message: 'Title must be 120 characters or fewer.' }),
  description: z
    .string()
    .trim()
    .min(10, { message: 'Describe the issue (at least 10 characters).' })
    .max(2000, { message: 'Description cannot exceed 2000 characters.' }),
  category: CategoryEnum,
  priority: PriorityEnum,
  departmentId: z.string().nullable().optional(),
  assetId: z.string().nullable().optional(),
});
export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

export const AssignTicketSchema = z.object({
  assignedTechnicianId: z.string().nullable(),
});
export type AssignTicketInput = z.infer<typeof AssignTicketSchema>;

export const UpdateStatusSchema = z.object({
  status: StatusEnum,
});
export type UpdateStatusInput = z.infer<typeof UpdateStatusSchema>;

export const CreateCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, { message: 'Comment content cannot be empty.' })
    .max(2000, { message: 'Comment must be 2000 characters or fewer.' }),
  isInternal: z.boolean().optional().default(false),
});
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

export const SlaPolicySchema = z.object({
  firstResponseMinutes: z.number().int().min(5).max(10080),
  resolutionMinutes: z.number().int().min(15).max(43200),
  businessHoursOnly: z.boolean().optional(),
});
export type SlaPolicyInput = z.infer<typeof SlaPolicySchema>;

export const CreateArticleSchema = z.object({
  title: z.string().trim().min(3, { message: 'Title must be at least 3 characters.' }),
  category: CategoryEnum,
  content: z.string().trim().min(10, { message: 'Content must be at least 10 characters.' }),
  isPublished: z.boolean().default(true),
});
export type CreateArticleInput = z.infer<typeof CreateArticleSchema>;

export const CreateAssetSchema = z.object({
  assetTag: z.string().trim().min(2, { message: 'Asset tag required (e.g. LAP-001).' }),
  name: z.string().trim().min(2, { message: 'Asset name required.' }),
  type: AssetTypeEnum,
  serialNumber: z.string().trim().optional(),
  assignedUserId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  status: AssetStatusEnum.default('ACTIVE'),
});
export type CreateAssetInput = z.infer<typeof CreateAssetSchema>;

export const SubmitFeedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackSchema>;

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, { message: 'Name must be at least 2 characters.' }),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'Enter your current password.' }),
  newPassword: z.string().min(8, { message: 'New password must be at least 8 characters.' }),
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const TicketFilterSchema = z.object({
  search: z.string().optional(),
  status: StatusEnum.optional(),
  priority: PriorityEnum.optional(),
  category: CategoryEnum.optional(),
  assigneeId: z.string().optional(),
  departmentId: z.string().optional(),
  slaStatus: z.enum(['ALL', 'BREACHED', 'WARNING', 'OK']).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type TicketFilterInput = z.infer<typeof TicketFilterSchema>;
