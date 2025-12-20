import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { JWTPayload, MerchantRole, PartnerRole } from '@merchant-app/shared';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * requireAuth - Verify JWT access token from Authorization header
 * 
 * Extracts Bearer token from Authorization header, verifies it,
 * and attaches decoded user payload to req.user
 * 
 * Rejects requests with:
 * - No Authorization header
 * - Invalid token format
 * - Expired tokens
 * - Invalid tokens
 * 
 * @example
 * router.get('/protected', requireAuth, (req, res) => {
 *   // req.user is available here
 *   res.json({ user: req.user });
 * });
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required',
      });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Invalid authorization format. Expected: Bearer <token>',
      });
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token not provided',
      });
    }

    try {
      // Verify and decode token
      const payload = verifyAccessToken(token);
      
      // Attach decoded user to request
      req.user = payload;
      
      next();
    } catch (error: any) {
      // Handle token verification errors
      if (error.message === 'Token expired') {
        return res.status(401).json({
          success: false,
          error: 'Token expired',
        });
      }

      if (error.message === 'Invalid token') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
        });
      }

      return res.status(401).json({
        success: false,
        error: error.message || 'Token verification failed',
      });
    }
  } catch (error: any) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
}

/**
 * requireMerchant - Ensure user is a merchant user
 * 
 * Must be used after requireAuth middleware.
 * Rejects non-merchant users (partners, etc.)
 * 
 * @example
 * router.get('/merchant/me', requireAuth, requireMerchant, (req, res) => {
 *   // req.user.userType === 'merchant'
 *   // req.user.merchantId is available
 * });
 */
export function requireMerchant(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  // Check if user is a merchant
  if (req.user.userType !== 'merchant') {
    return res.status(403).json({
      success: false,
      error: 'Merchant user required',
    });
  }

  // Check if merchantId is present
  if (!req.user.merchantId) {
    return res.status(403).json({
      success: false,
      error: 'Merchant ID not found in token',
    });
  }

  next();
}

/**
 * requireRole - Ensure user has one of the specified roles
 * 
 * Must be used after requireAuth middleware.
 * Rejects users who don't have any of the allowed roles.
 * 
 * @param roles - Array of allowed roles
 * @returns Middleware function
 * 
 * @example
 * // Require merchant owner or manager
 * router.post('/agreements', 
 *   requireAuth, 
 *   requireMerchant, 
 *   requireRole('merchant_owner', 'merchant_manager'),
 *   (req, res) => { ... }
 * );
 * 
 * @example
 * // Require only merchant owner
 * router.delete('/agreements/:id',
 *   requireAuth,
 *   requireMerchant,
 *   requireRole('merchant_owner'),
 *   (req, res) => { ... }
 * );
 */
export function requireRole(...roles: (MerchantRole | PartnerRole | string)[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    // Check if user has one of the required roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required role: ${roles.join(' or ')}`,
      });
    }

    next();
  };
}

/**
 * Combined middleware: requireAuth + requireMerchant
 * Convenience function for merchant-only routes
 * 
 * @example
 * router.get('/merchant/me', requireMerchantAuth, (req, res) => {
 *   // req.user is authenticated merchant user
 * });
 */
export function requireMerchantAuth(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    requireMerchant(req, res, next);
  });
}

/**
 * requirePartner - Ensure user is a partner user
 * 
 * Must be used after requireAuth middleware.
 * Rejects non-partner users (merchants, etc.)
 * 
 * @example
 * router.get('/partner/me', requireAuth, requirePartner, (req, res) => {
 *   // req.user.userType === 'partner'
 *   // req.user.partnerId is available
 * });
 */
export function requirePartner(req: Request, res: Response, next: NextFunction) {
  // Check if user is authenticated
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
  }

  // Check if user is a partner
  if (req.user.userType !== 'partner') {
    return res.status(403).json({
      success: false,
      error: 'Partner user required',
    });
  }

  // Check if partnerId is present
  if (!req.user.partnerId) {
    return res.status(403).json({
      success: false,
      error: 'Partner ID not found in token',
    });
  }

  next();
}

/**
 * Combined middleware: requireAuth + requireMerchant + requireRole
 * Convenience function for role-protected merchant routes
 * 
 * @param roles - Array of allowed roles
 * @returns Middleware function
 * 
 * @example
 * router.post('/transactions',
 *   requireMerchantRole('merchant_owner', 'merchant_manager'),
 *   (req, res) => { ... }
 * );
 */
export function requireMerchantRole(...roles: MerchantRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      requireMerchant(req, res, () => {
        requireRole(...roles)(req, res, next);
      });
    });
  };
}

/**
 * Combined middleware: requireAuth + requirePartner
 * Convenience function for partner-only routes
 * 
 * @example
 * router.get('/partner/me', requirePartnerAuth, (req, res) => {
 *   // req.user is authenticated partner user
 * });
 */
export function requirePartnerAuth(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    requirePartner(req, res, next);
  });
}

