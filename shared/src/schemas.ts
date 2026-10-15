import { z } from 'zod';

export const RoleEnum = z.enum(['EMPLOYEE', 'TECHNICIAN']);
export const CategoryEnum = z.enum(['HARDWARE', 'NETWORK', 'SOFTWARE', 'ACCOUNT_ACCESS']);
export const PriorityEnum = z.enum(['URGENT', 'HIGH', 'MEDIUM', 'LOW']);
export const StatusEnum = z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']);

export const LoginSchema = z.object({
  email: z.string().trim().email({ message: 'Enter a valid email address.' }),
  password: z.string().min(1, { message: 'Enter your password.' }),
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

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
    .max(1000, { message: 'Comment must be 1000 characters or fewer.' }),
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

export const TicketFilterSchema = z.object({
  search: z.string().optional(),
  status: StatusEnum.optional(),
  priority: PriorityEnum.optional(),
  category: CategoryEnum.optional(),
  assigneeId: z.string().optional(),
  sort: z.enum(['createdAt', 'updatedAt', 'priority', 'ticketNumber', 'title']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type TicketFilterInput = z.infer<typeof TicketFilterSchema>;
