import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireMerchantAccess, requirePartnerAccess } from '../middleware/accessGuard';
import { requireMerchantRole } from '../middleware/roleGuard';
import { MerchantRole } from '@merchant-app/shared';
import { db } from '../config/database';
import { calculateOutstandingBalance, getOutstandingBalanceHistory } from '../services/outstandingBalance';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Create payout (merchant users only)
 * POST /api/payouts
 */
router.post(
  '/',
  requireMerchantAccess,
  requireMerchantRole(MerchantRole.MERCHANT_OWNER, MerchantRole.MERCHANT_MANAGER, MerchantRole.MERCHANT_ACCOUNTANT),
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.merchantId) {
        return res.status(403).json({
          success: false,
          error: 'Merchant ID required',
        });
      }

      const {
        partnerId,
        amountCents,
        currency,
        payoutMethod,
        payoutReference,
        description,
        scheduledDate,
        agreementId,
        metadata,
      } = req.body;

      // Validation
      if (!partnerId || !amountCents || !payoutMethod) {
        return res.status(400).json({
          success: false,
          error: 'Partner ID, amount, and payout method are required',
        });
      }

      // Validate payout method
      const validMethods = ['BANK_TRANSFER', 'STRIPE', 'PAYPAL', 'WIRE', 'WISE'];
      if (!validMethods.includes(payoutMethod)) {
        return res.status(400).json({
          success: false,
          error: `Invalid payout method. Must be one of: ${validMethods.join(', ')}`,
        });
      }

      // Verify partner is linked to merchant
      const linkCheck = await db.query(
        `SELECT id FROM merchant_partner_links 
         WHERE merchant_id = $1 AND partner_id = $2 AND is_active = true`,
        [req.user.merchantId, partnerId]
      );

      if (linkCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Partner is not linked to this merchant',
        });
      }

      // If agreementId is provided, verify it exists and matches merchant/partner
      if (agreementId) {
        const agreementCheck = await db.query(
          `SELECT id FROM agreements 
           WHERE id = $1 AND merchant_id = $2 AND partner_id = $3 AND is_active = true`,
          [agreementId, req.user.merchantId, partnerId]
        );

        if (agreementCheck.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: 'Agreement not found or inactive',
          });
        }
      }

      // Create payout
      const metadataJson = metadata
        ? JSON.stringify({ ...metadata, agreement_id: agreementId || null })
        : JSON.stringify({ agreement_id: agreementId || null });

      const result = await db.query(
        `INSERT INTO payouts 
         (merchant_id, partner_id, amount_cents, currency, payout_method, 
          payout_reference, description, scheduled_date, status, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', $9::jsonb)
         RETURNING *`,
        [
          req.user.merchantId,
          partnerId,
          amountCents,
          currency || 'USD',
          payoutMethod,
          payoutReference || null,
          description || null,
          scheduledDate ? new Date(scheduledDate) : new Date(),
          metadataJson,
        ]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error('Create payout error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create payout',
      });
    }
  }
);

/**
 * Update payout status (merchant users only)
 * PUT /api/payouts/:payoutId
 */
router.put(
  '/:payoutId',
  requireMerchantAccess,
  requireMerchantRole(MerchantRole.MERCHANT_OWNER, MerchantRole.MERCHANT_MANAGER, MerchantRole.MERCHANT_ACCOUNTANT),
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.merchantId) {
        return res.status(403).json({
          success: false,
          error: 'Merchant ID required',
        });
      }

      const { payoutId } = req.params;
      const { status, processedAt, payoutReference, description } = req.body;

      // Verify payout belongs to merchant
      const payoutCheck = await db.query(
        `SELECT id FROM payouts WHERE id = $1 AND merchant_id = $2`,
        [payoutId, req.user.merchantId]
      );

      if (payoutCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Payout not found',
        });
      }

      // Validate status if provided
      if (status) {
        const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          });
        }
      }

      // Build update query
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (status) {
        updates.push(`status = $${paramIndex}`);
        params.push(status);
        paramIndex++;
      }

      if (processedAt !== undefined) {
        updates.push(`processed_at = $${paramIndex}`);
        params.push(processedAt ? new Date(processedAt) : null);
        paramIndex++;
      }

      if (payoutReference !== undefined) {
        updates.push(`payout_reference = $${paramIndex}`);
        params.push(payoutReference);
        paramIndex++;
      }

      if (description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        params.push(description);
        paramIndex++;
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields to update',
        });
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      params.push(payoutId, req.user.merchantId);

      const result = await db.query(
        `UPDATE payouts 
         SET ${updates.join(', ')}
         WHERE id = $${paramIndex} AND merchant_id = $${paramIndex + 1}
         RETURNING *`,
        params
      );

      res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error('Update payout error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update payout',
      });
    }
  }
);

/**
 * Get payouts for merchant (merchant users only)
 * GET /api/payouts/merchant
 */
router.get(
  '/merchant',
  requireMerchantAccess,
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.merchantId) {
        return res.status(403).json({
          success: false,
          error: 'Merchant ID required',
        });
      }

      const { page = 1, limit = 20, partnerId, status, payoutMethod, year, month } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = `
        SELECT id, merchant_id, partner_id, amount_cents, currency, status,
               payout_method, payout_reference, description, scheduled_date,
               processed_at, metadata, created_at, updated_at
        FROM payouts
        WHERE merchant_id = $1
      `;
      const params: any[] = [req.user.merchantId];

      if (partnerId) {
        query += ` AND partner_id = $${params.length + 1}`;
        params.push(partnerId);
      }

      if (status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(status);
      }

      if (payoutMethod) {
        query += ` AND payout_method = $${params.length + 1}`;
        params.push(payoutMethod);
      }

      if (year && month) {
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
        query += ` AND scheduled_date >= $${params.length + 1} AND scheduled_date <= $${params.length + 2}`;
        params.push(startDate, endDate);
      }

      query += ` ORDER BY scheduled_date DESC, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(Number(limit), offset);

      const result = await db.query(query, params);

      // Get total count
      let countQuery = `SELECT COUNT(*) FROM payouts WHERE merchant_id = $1`;
      const countParams: any[] = [req.user.merchantId];

      if (partnerId) {
        countQuery += ` AND partner_id = $2`;
        countParams.push(partnerId);
      }

      if (status) {
        countQuery += ` AND status = $${countParams.length + 1}`;
        countParams.push(status);
      }

      const countResult = await db.query(countQuery, countParams);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: parseInt(countResult.rows[0].count),
          totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Get payouts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payouts',
      });
    }
  }
);

/**
 * Get payouts for partner (partner users - READ ONLY)
 * GET /api/payouts/partner
 */
router.get(
  '/partner',
  requirePartnerAccess,
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.partnerId) {
        return res.status(403).json({
          success: false,
          error: 'Partner ID required',
        });
      }

      const { page = 1, limit = 20, merchantId, status, payoutMethod, year, month } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      // Build query with merchant access check
      let query = `
        SELECT p.id, p.merchant_id, p.partner_id, p.amount_cents, p.currency, p.status,
               p.payout_method, p.payout_reference, p.description, p.scheduled_date,
               p.processed_at, p.metadata, p.created_at, p.updated_at
        FROM payouts p
        INNER JOIN merchant_partner_links mpl ON mpl.merchant_id = p.merchant_id AND mpl.partner_id = p.partner_id
        WHERE p.partner_id = $1
          AND mpl.is_active = true
      `;
      const params: any[] = [req.user.partnerId];

      if (merchantId) {
        // Verify merchant is linked
        query += ` AND p.merchant_id = $${params.length + 1} AND mpl.merchant_id = $${params.length + 1}`;
        params.push(merchantId);
      }

      if (status) {
        query += ` AND p.status = $${params.length + 1}`;
        params.push(status);
      }

      if (payoutMethod) {
        query += ` AND p.payout_method = $${params.length + 1}`;
        params.push(payoutMethod);
      }

      if (year && month) {
        const startDate = new Date(Number(year), Number(month) - 1, 1);
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
        query += ` AND p.scheduled_date >= $${params.length + 1} AND p.scheduled_date <= $${params.length + 2}`;
        params.push(startDate, endDate);
      }

      query += ` ORDER BY p.scheduled_date DESC, p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(Number(limit), offset);

      const result = await db.query(query, params);

      // Get total count
      let countQuery = `
        SELECT COUNT(*)
        FROM payouts p
        INNER JOIN merchant_partner_links mpl ON mpl.merchant_id = p.merchant_id AND mpl.partner_id = p.partner_id
        WHERE p.partner_id = $1 AND mpl.is_active = true
      `;
      const countParams: any[] = [req.user.partnerId];

      if (merchantId) {
        countQuery += ` AND p.merchant_id = $2`;
        countParams.push(merchantId);
      }

      const countResult = await db.query(countQuery, countParams);

      res.json({
        success: true,
        data: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: parseInt(countResult.rows[0].count),
          totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit)),
        },
      });
    } catch (error: any) {
      console.error('Get partner payouts error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payouts',
      });
    }
  }
);

/**
 * Get outstanding balance (merchant users)
 * GET /api/payouts/outstanding-balance
 */
router.get(
  '/outstanding-balance',
  requireMerchantAccess,
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.merchantId) {
        return res.status(403).json({
          success: false,
          error: 'Merchant ID required',
        });
      }

      const { partnerId, year, month, agreementId } = req.query;

      if (!partnerId) {
        return res.status(400).json({
          success: false,
          error: 'Partner ID is required',
        });
      }

      const now = new Date();
      const balanceYear = year ? Number(year) : now.getFullYear();
      const balanceMonth = month ? Number(month) : now.getMonth() + 1;

      const balance = await calculateOutstandingBalance(
        req.user.merchantId,
        partnerId as string,
        balanceYear,
        balanceMonth,
        agreementId as string | undefined
      );

      res.json({
        success: true,
        data: balance,
      });
    } catch (error: any) {
      console.error('Get outstanding balance error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to calculate outstanding balance',
      });
    }
  }
);

/**
 * Get outstanding balance (partner users - READ ONLY)
 * GET /api/payouts/outstanding-balance/partner
 */
router.get(
  '/outstanding-balance/partner',
  requirePartnerAccess,
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.partnerId) {
        return res.status(403).json({
          success: false,
          error: 'Partner ID required',
        });
      }

      const { merchantId, year, month, agreementId } = req.query;

      if (!merchantId) {
        return res.status(400).json({
          success: false,
          error: 'Merchant ID is required',
        });
      }

      // Verify merchant is linked
      const linkCheck = await db.query(
        `SELECT id FROM merchant_partner_links 
         WHERE merchant_id = $1 AND partner_id = $2 AND is_active = true`,
        [merchantId, req.user.partnerId]
      );

      if (linkCheck.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Merchant is not linked to your partner account',
        });
      }

      const now = new Date();
      const balanceYear = year ? Number(year) : now.getFullYear();
      const balanceMonth = month ? Number(month) : now.getMonth() + 1;

      const balance = await calculateOutstandingBalance(
        merchantId as string,
        req.user.partnerId,
        balanceYear,
        balanceMonth,
        agreementId as string | undefined
      );

      res.json({
        success: true,
        data: balance,
      });
    } catch (error: any) {
      console.error('Get partner outstanding balance error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to calculate outstanding balance',
      });
    }
  }
);

/**
 * Get outstanding balance history
 * GET /api/payouts/outstanding-balance/history
 */
router.get(
  '/outstanding-balance/history',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { partnerId, merchantId, limit } = req.query;

      let effectiveMerchantId: string;
      let effectivePartnerId: string;

      if (req.user?.userType === 'merchant') {
        if (!req.user.merchantId) {
          return res.status(403).json({
            success: false,
            error: 'Merchant ID required',
          });
        }
        effectiveMerchantId = req.user.merchantId;
        effectivePartnerId = partnerId as string;

        if (!effectivePartnerId) {
          return res.status(400).json({
            success: false,
            error: 'Partner ID is required',
          });
        }
      } else if (req.user?.userType === 'partner') {
        if (!req.user.partnerId) {
          return res.status(403).json({
            success: false,
            error: 'Partner ID required',
          });
        }
        effectivePartnerId = req.user.partnerId;
        effectiveMerchantId = merchantId as string;

        if (!effectiveMerchantId) {
          return res.status(400).json({
            success: false,
            error: 'Merchant ID is required',
          });
        }

        // Verify merchant is linked
        const linkCheck = await db.query(
          `SELECT id FROM merchant_partner_links 
           WHERE merchant_id = $1 AND partner_id = $2 AND is_active = true`,
          [effectiveMerchantId, effectivePartnerId]
        );

        if (linkCheck.rows.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'Merchant is not linked to your partner account',
          });
        }
      } else {
        return res.status(403).json({
          success: false,
          error: 'Invalid user type',
        });
      }

      const history = await getOutstandingBalanceHistory(
        effectiveMerchantId,
        effectivePartnerId,
        limit ? Number(limit) : 12
      );

      res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('Get outstanding balance history error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get outstanding balance history',
      });
    }
  }
);

export default router;

