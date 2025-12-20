import { Router, Request, Response } from 'express';
import { requireAuth, requireMerchant, requireMerchantAuth } from '../middleware/auth.middleware';
import { db } from '../config/database';

const router = Router();

/**
 * Example: GET /merchant/me
 * 
 * Protected route that requires:
 * - Valid JWT access token (requireAuth)
 * - Merchant user type (requireMerchant)
 * 
 * Usage: GET /api/merchant/me
 * Headers: Authorization: Bearer <access_token>
 */
router.get('/me', requireAuth, requireMerchant, async (req: Request, res: Response) => {
  try {
    // req.user is guaranteed to be a merchant user at this point
    const merchantId = req.user!.merchantId!;

    const result = await db.query(
      `SELECT id, name, business_name, email, phone, address, city, state, country, 
              postal_code, tax_id, is_active, created_at, updated_at
       FROM merchants 
       WHERE id = $1 AND is_active = true`,
      [merchantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error('Get merchant error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch merchant',
    });
  }
});

/**
 * Alternative: Using combined middleware
 * 
 * requireMerchantAuth = requireAuth + requireMerchant
 */
router.get('/profile', requireMerchantAuth, async (req: Request, res: Response) => {
  try {
    const merchantId = req.user!.merchantId!;

    // Get merchant with user info
    const merchantResult = await db.query(
      `SELECT m.*, u.email as user_email, u.first_name, u.last_name, u.role
       FROM merchants m
       INNER JOIN users u ON u.merchant_id = m.id
       WHERE m.id = $1 AND m.is_active = true AND u.id = $2`,
      [merchantId, req.user!.userId]
    );

    if (merchantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found',
      });
    }

    res.json({
      success: true,
      data: merchantResult.rows[0],
    });
  } catch (error: any) {
    console.error('Get merchant profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch merchant profile',
    });
  }
});

export default router;

