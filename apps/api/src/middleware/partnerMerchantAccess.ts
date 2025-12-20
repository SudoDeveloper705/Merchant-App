import { Request, Response, NextFunction } from 'express';
import { db } from '../config/database';

/**
 * Middleware to validate that a partner user has access to a specific merchant
 * 
 * This middleware checks that:
 * 1. User is authenticated (must be used after requireAuth)
 * 2. User is a partner (must be used after requirePartner)
 * 3. merchantId is provided (from query, params, or body)
 * 4. Partner is linked to the merchant via merchant_partner_links
 * 
 * Rejects with 403 if merchant is not linked.
 * 
 * @example
 * router.get('/partner/transactions',
 *   requireAuth,
 *   requirePartner,
 *   requirePartnerMerchantAccess,
 *   (req, res) => {
 *     // req.user.partnerId and merchantId are validated
 *   }
 * );
 */
export async function requirePartnerMerchantAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
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

    // Get merchantId from query, params, or body
    const merchantId = req.query.merchantId as string || 
                      req.params.merchantId || 
                      req.body.merchantId;

    if (!merchantId) {
      return res.status(400).json({
        success: false,
        error: 'merchantId is required',
      });
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(merchantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid merchantId format',
      });
    }

    // Verify merchant is linked to this partner
    const linkResult = await db.query(
      `SELECT id 
       FROM merchant_partner_links 
       WHERE merchant_id = $1 
         AND partner_id = $2 
         AND is_active = true`,
      [merchantId, req.user.partnerId]
    );

    if (linkResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Merchant not linked to your partner account',
      });
    }

    // Attach merchantId to request for use in route handlers
    (req as any).merchantId = merchantId;

    next();
  } catch (error: any) {
    console.error('Partner merchant access validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to validate merchant access',
    });
  }
}

/**
 * Helper function to verify merchant access (for use in services)
 * 
 * @param merchantId - UUID of the merchant
 * @param partnerId - UUID of the partner
 * @returns Promise<boolean> - true if linked, false otherwise
 */
export async function verifyPartnerMerchantLink(
  merchantId: string,
  partnerId: string
): Promise<boolean> {
  try {
    const result = await db.query(
      `SELECT id 
       FROM merchant_partner_links 
       WHERE merchant_id = $1 
         AND partner_id = $2 
         AND is_active = true`,
      [merchantId, partnerId]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Verify partner merchant link error:', error);
    return false;
  }
}

