import { Request, Response, NextFunction } from 'express';
import { MerchantRole, PartnerRole, AppRole } from '@merchant-app/shared';

/**
 * Role guard middleware - checks if user has required role(s)
 */
export function requireRole(...allowedRoles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(req.user.role as AppRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
}

/**
 * Require merchant user role
 */
export function requireMerchantRole(...allowedRoles: MerchantRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (req.user.userType !== 'merchant') {
      return res.status(403).json({
        success: false,
        error: 'Merchant user required',
      });
    }

    if (!allowedRoles.includes(req.user.role as MerchantRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
}

/**
 * Require partner user role
 */
export function requirePartnerRole(...allowedRoles: PartnerRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    if (req.user.userType !== 'partner') {
      return res.status(403).json({
        success: false,
        error: 'Partner user required',
      });
    }

    if (!allowedRoles.includes(req.user.role as PartnerRole)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
}

