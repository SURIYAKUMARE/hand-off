import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@helpdesk360/shared';
import { AppError } from './errorHandler';

export function requireRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You don't have permission to view this resource or perform this action.", 403)
      );
    }

    next();
  };
}
