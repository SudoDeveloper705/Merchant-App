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
 * Example: GET /transactions
 * 
 * Protected route that requires:
 * - Valid JWT access token (requireAuth)
 * - Merchant user type (requireMerchant)
 * - Any merchant role can view transactions
 * 
 * Usage: GET /api/transactions
 * Headers: Authorization: Bearer <access_token>
 */
router.get('/',
  requireAuth,
  requireMerchant,
  requireRole('merchant_owner', 'merchant_manager', 'merchant_accountant'),
  async (req: Request, res: Response) => {
    try {
      const merchantId = req.user!.merchantId!;
      const { page = 1, limit = 20, status, type } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT id, merchant_id, client_id, external_id, transaction_type, status,
               subtotal_cents, sales_tax_cents, total_cents, fees_cents, net_cents,
               currency, description, metadata, transaction_date, created_at, updated_at
        FROM transactions
        WHERE merchant_id = $1
      `;
      const params: any[] = [merchantId];

      if (status) {
        query += ' AND status = $' + (params.length + 1);
        params.push(status);
      }

      if (type) {
        query += ' AND transaction_type = $' + (params.length + 1);
        params.push(type);
      }

      query += ' ORDER BY transaction_date DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
      params.push(Number(limit), offset);

      const result = await db.query(query, params);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.rows.length,
        },
      });
    } catch (error: any) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch transactions',
      });
    }
  }
);

/**
 * Example: POST /transactions
 * 
 * Only merchant_owner or merchant_manager can create transactions
 * 
 * Usage: POST /api/transactions
 * Headers: Authorization: Bearer <access_token>
 */
router.post('/',
  requireMerchantRole(MerchantRole.MERCHANT_OWNER, MerchantRole.MERCHANT_MANAGER),
  async (req: Request, res: Response) => {
    try {
      const merchantId = req.user!.merchantId!;
      const {
        client_id,
        external_id,
        transaction_type,
        subtotal_cents,
        sales_tax_cents,
        total_cents,
        fees_cents,
        net_cents,
        currency,
        description,
        transaction_date,
      } = req.body;

      // Validation
      if (!transaction_type || !total_cents) {
        return res.status(400).json({
          success: false,
          error: 'transaction_type and total_cents are required',
        });
      }

      const result = await db.query(
        `INSERT INTO transactions (
          merchant_id, client_id, external_id, transaction_type,
          subtotal_cents, sales_tax_cents, total_cents, fees_cents, net_cents,
          currency, description, transaction_date, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'completed')
        RETURNING id, merchant_id, transaction_type, total_cents, status, created_at`,
        [
          merchantId,
          client_id,
          external_id,
          transaction_type,
          subtotal_cents,
          sales_tax_cents,
          total_cents,
          fees_cents,
          net_cents,
          currency || 'USD',
          description,
          transaction_date || new Date(),
        ]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error('Create transaction error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create transaction',
      });
    }
  }
);

/**
 * Example: GET /transactions/:id
 * 
 * All merchant roles can view individual transactions
 * 
 * Usage: GET /api/transactions/:id
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
        `SELECT id, merchant_id, client_id, external_id, transaction_type, status,
                subtotal_cents, sales_tax_cents, total_cents, fees_cents, net_cents,
                currency, description, metadata, transaction_date, created_at, updated_at
         FROM transactions
         WHERE id = $1 AND merchant_id = $2`,
        [id, merchantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found',
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error('Get transaction error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch transaction',
      });
    }
  }
);

/**
 * Example: PUT /transactions/:id
 * 
 * Only merchant_owner or merchant_manager can update transactions
 * 
 * Usage: PUT /api/transactions/:id
 */
router.put('/:id',
  requireMerchantRole(MerchantRole.MERCHANT_OWNER, MerchantRole.MERCHANT_MANAGER),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const merchantId = req.user!.merchantId!;
      const { status, description } = req.body;

      const result = await db.query(
        `UPDATE transactions
         SET status = COALESCE($1, status),
             description = COALESCE($2, description),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3 AND merchant_id = $4
         RETURNING id, status, description, updated_at`,
        [status, description, id, merchantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found',
        });
      }

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error('Update transaction error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update transaction',
      });
    }
  }
);

/**
 * Example: DELETE /transactions/:id
 * 
 * Only merchant_owner can delete transactions
 * 
 * Usage: DELETE /api/transactions/:id
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
        `DELETE FROM transactions
         WHERE id = $1 AND merchant_id = $2
         RETURNING id`,
        [id, merchantId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found',
        });
      }

      res.json({
        success: true,
        message: 'Transaction deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete transaction error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete transaction',
      });
    }
  }
);

export default router;

