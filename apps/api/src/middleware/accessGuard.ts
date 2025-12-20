import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';

/**
 * Merchant access guard - ensures merchant users can only access their merchant's data
 */
export function requireMerchantAccess(req: Request, res: Response, next: NextFunction) {
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

  if (!req.user.merchantId) {
    return res.status(403).json({
      success: false,
      error: 'Merchant ID not found in token',
    });
  }

  // Allow merchant to access their own data
  next();
}

/**
 * Partner access guard - ensures partner users can only access linked merchants
 * Also enforces restrictions: no bank accounts, expenses, or other partners' data
 */
export async function requirePartnerAccess(req: Request, res: Response, next: NextFunction) {
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

  if (!req.user.partnerId) {
    return res.status(403).json({
      success: false,
      error: 'Partner ID not found in token',
    });
  }

  // Check if accessing a merchant - must be linked
  const merchantId = req.params.merchantId || req.body.merchantId || req.query.merchantId;

  if (merchantId) {
    // Verify merchant is linked to this partner
    const linkResult = await db.query(
      `SELECT id FROM merchant_partner_links 
       WHERE merchant_id = $1 AND partner_id = $2 AND is_active = true`,
      [merchantId, req.user.partnerId]
    );

    if (linkResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Merchant not linked to your partner account',
      });
    }
  }

  // Block access to restricted resources
  const path = req.path.toLowerCase();
  const restrictedPaths = ['/bank-accounts', '/expenses', '/partners'];
  
  if (restrictedPaths.some(restricted => path.includes(restricted))) {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Partner users cannot access this resource',
    });
  }

  next();
}

/**
 * Verify merchant access for a specific merchant ID
 */
export async function verifyMerchantAccess(merchantId: string, userId: string, userType: string): Promise<boolean> {
  if (userType === 'merchant') {
    // For merchant users, check if they belong to this merchant
    const result = await db.query(
      `SELECT id FROM users WHERE id = $1 AND merchant_id = $2 AND is_active = true`,
      [userId, merchantId]
    );
    return result.rows.length > 0;
  }

  if (userType === 'partner') {
    // For partner users, check if merchant is linked
    const partnerResult = await db.query(
      `SELECT pu.partner_id 
       FROM partner_users pu
       WHERE pu.id = $1 AND pu.is_active = true`,
      [userId]
    );

    if (partnerResult.rows.length === 0) {
      return false;
    }

    const partnerId = partnerResult.rows[0].partner_id;
    const linkResult = await db.query(
      `SELECT id FROM merchant_partner_links 
       WHERE merchant_id = $1 AND partner_id = $2 AND is_active = true`,
      [merchantId, partnerId]
    );

    return linkResult.rows.length > 0;
  }

  return false;
}

/**
 * Middleware to verify merchant access from request
 */
export function requireMerchantAccessById(paramName: string = 'merchantId') {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const merchantId = req.params[paramName] || req.body[paramName] || req.query[paramName];

    if (!merchantId) {
      return res.status(400).json({
        success: false,
        error: 'Merchant ID required',
      });
    }

    const hasAccess = await verifyMerchantAccess(
      merchantId,
      req.user.userId,
      req.user.userType
    );

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: You do not have access to this merchant',
      });
    }

    next();
  };
}

