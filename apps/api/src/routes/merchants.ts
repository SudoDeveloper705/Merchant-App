import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireMerchantAccess, requireMerchantAccessById } from '../middleware/accessGuard';
import { requireMerchantRole } from '../middleware/roleGuard';
import { MerchantRole } from '@merchant-app/shared';
import { db } from '../config/database';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get merchant's own data (merchant users only)
 */
router.get('/me', requireMerchantAccess, async (req: Request, res: Response) => {
  try {
    if (!req.user?.merchantId) {
      return res.status(403).json({
        success: false,
        error: 'Merchant ID required',
      });
    }

    const result = await db.query(
      `SELECT id, name, business_name, email, phone, address, city, state, country, 
              postal_code, tax_id, is_active, created_at, updated_at
       FROM merchants WHERE id = $1`,
      [req.user.merchantId]
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
 * Get merchant by ID (with access control)
 * - Merchant users: can only access their own merchant
 * - Partner users: can only access linked merchants
 */
router.get('/:merchantId', requireMerchantAccessById(), async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;

    const result = await db.query(
      `SELECT id, name, business_name, email, phone, address, city, state, country, 
              postal_code, tax_id, is_active, created_at, updated_at
       FROM merchants WHERE id = $1 AND is_active = true`,
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
 * Update merchant (merchant owner/manager only)
 */
router.put('/me', 
  requireMerchantAccess,
  requireMerchantRole(MerchantRole.MERCHANT_OWNER, MerchantRole.MERCHANT_MANAGER),
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.merchantId) {
        return res.status(403).json({
          success: false,
          error: 'Merchant ID required',
        });
      }

      const { name, businessName, phone, address, city, state, country, postalCode } = req.body;

      const result = await db.query(
        `UPDATE merchants 
         SET name = COALESCE($1, name),
             business_name = COALESCE($2, business_name),
             phone = COALESCE($3, phone),
             address = COALESCE($4, address),
             city = COALESCE($5, city),
             state = COALESCE($6, state),
             country = COALESCE($7, country),
             postal_code = COALESCE($8, postal_code),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9
         RETURNING id, name, business_name, email, phone, address, city, state, country, 
                   postal_code, tax_id, is_active, created_at, updated_at`,
        [name, businessName, phone, address, city, state, country, postalCode, req.user.merchantId]
      );

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error('Update merchant error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update merchant',
      });
    }
  }
);

export default router;

