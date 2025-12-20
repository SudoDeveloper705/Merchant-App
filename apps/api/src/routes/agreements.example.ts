import { Router, Request, Response } from 'express';
import { 
  requireAuth, 
  requireMerchant, 
  requireRole,
  requireMerchantRole 
} from '../middleware/auth.middleware';
import { MerchantRole } from '@merchant-app/shared';
import { db } from '../config/database';

const router = Router();

/**
 * Example: GET /agreements
 * 
 * Protected route that requires:
 * - Valid JWT access token (requireAuth)
 * - Merchant user type (requireMerchant)
 * - Specific role: merchant_owner OR merchant_manager (requireRole)
 * 
 * Usage: GET /api/agreements
 * Headers: Authorization: Bearer <access_token>
 */
router.get('/', 
  requireAuth, 
  requireMerchant, 
  requireRole('merchant_owner', 'merchant_manager'),
  async (req: Request, res: Response) => {
    try {
      const merchantId = req.user!.merchantId!;

      const result = await db.query(
        `SELECT id, merchant_id, partner_id, client_id, agreement_type, 
                percentage_rate, minimum_guarantee_cents, start_date, end_date,
                is_active, created_at, updated_at
         FROM agreements
         WHERE merchant_id = $1 AND is_active = true
         ORDER BY created_at DESC`,
        [merchantId]
      );

      res.json({
        success: true,
        data: result.rows,
      });
    } catch (error: any) {
      console.error('Get agreements error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agreements',
      });
    }
  }
);

/**
 * Example: POST /agreements
 * 
 * Protected route using combined middleware (requireMerchantRole)
 * 
 * Only merchant_owner or merchant_manager can create agreements
 * 
 * Usage: POST /api/agreements
 * Headers: Authorization: Bearer <access_token>
 */
router.post('/', 
  requireMerchantRole(MerchantRole.MERCHANT_OWNER, MerchantRole.MERCHANT_MANAGER),
  async (req: Request, res: Response) => {
    try {
      const merchantId = req.user!.merchantId!;
      const { partner_id, client_id, agreement_type, percentage_rate, minimum_guarantee_cents, start_date, end_date } = req.body;

      // Validation
      if (!partner_id || !agreement_type) {
        return res.status(400).json({
          success: false,
          error: 'partner_id and agreement_type are required',
        });
      }

      const result = await db.query(
        `INSERT INTO agreements (
          merchant_id, partner_id, client_id, agreement_type,
          percentage_rate, minimum_guarantee_cents, start_date, end_date, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
        RETURNING id, merchant_id, partner_id, agreement_type, created_at`,
        [merchantId, partner_id, client_id, agreement_type, percentage_rate, minimum_guarantee_cents, start_date, end_date]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error('Create agreement error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create agreement',
      });
    }
  }
);

/**
 * Example: GET /agreements/:id
 * 
 * All merchant roles can view agreements (merchant_owner, merchant_manager, merchant_accountant)
 * 
 * Usage: GET /api/agreements/:id
 */
router.get('/:id',
  requireAuth,
  requireMerchant,
  requireRole('merchant_owner', 'merchant_manager', 'merchant_accountant'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const merchantId = req.user!.merchantId!;

      const result = await db.query(
        `SELECT id, merchant_id, partner_id, client_id, agreement_type,
                percentage_rate, minimum_guarantee_cents, start_date, end_date,
                is_active, created_at, updated_at
         FROM agreements
         WHERE id = $1 AND merchant_id = $2 AND is_active = true`,
        [id, merchantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Agreement not found',
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error('Get agreement error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch agreement',
      });
    }
  }
);

/**
 * Example: DELETE /agreements/:id
 * 
 * Only merchant_owner can delete agreements
 * 
 * Usage: DELETE /api/agreements/:id
 */
router.delete('/:id',
  requireAuth,
  requireMerchant,
  requireRole('merchant_owner'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const merchantId = req.user!.merchantId!;

      const result = await db.query(
        `UPDATE agreements 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND merchant_id = $2 AND is_active = true
         RETURNING id`,
        [id, merchantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Agreement not found',
        });
      }

      res.json({
        success: true,
        message: 'Agreement deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete agreement error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete agreement',
      });
    }
  }
);

export default router;

