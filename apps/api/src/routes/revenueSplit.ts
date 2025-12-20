import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireMerchantAccess, requireMerchantAccessById } from '../middleware/accessGuard';
import { requireMerchantRole } from '../middleware/roleGuard';
import { MerchantRole } from '@merchant-app/shared';
import { db } from '../config/database';
import { processMonthlySettlement, processAllMonthlySettlements, getSettlementHistory } from '../services/settlement';
import { recalculateTransactionRevenueSplit, bulkRecalculateRevenueSplits } from '../services/revenueSplitEdgeCases';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Process monthly settlement for an agreement
 * POST /api/revenue-split/settlement/:agreementId
 */
router.post(
  '/settlement/:agreementId',
  authenticate,
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

      const { agreementId } = req.params;
      const { year, month } = req.body;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          error: 'Year and month are required',
        });
      }

      // Verify agreement belongs to merchant
      const agreementCheck = await db.query(
        `SELECT id FROM agreements WHERE id = $1 AND merchant_id = $2`,
        [agreementId, req.user.merchantId]
      );

      if (agreementCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Agreement not found',
        });
      }

      const result = await processMonthlySettlement(agreementId, parseInt(year), parseInt(month));

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Settlement error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process settlement',
      });
    }
  }
);

/**
 * Process monthly settlement for all agreements
 * POST /api/revenue-split/settlement/all
 */
router.post(
  '/settlement/all',
  authenticate,
  requireMerchantAccess,
  requireMerchantRole(MerchantRole.MERCHANT_OWNER),
  async (req: Request, res: Response) => {
    try {
      const { year, month } = req.body;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          error: 'Year and month are required',
        });
      }

      const results = await processAllMonthlySettlements(parseInt(year), parseInt(month));

      res.json({
        success: true,
        data: {
          processed: results.length,
          settlements: results,
        },
      });
    } catch (error: any) {
      console.error('Bulk settlement error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to process settlements',
      });
    }
  }
);

/**
 * Get settlement history for an agreement
 * GET /api/revenue-split/settlement/:agreementId/history
 */
router.get(
  '/settlement/:agreementId/history',
  authenticate,
  requireMerchantAccess,
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.merchantId) {
        return res.status(403).json({
          success: false,
          error: 'Merchant ID required',
        });
      }

      const { agreementId } = req.params;
      const limit = parseInt(req.query.limit as string) || 12;

      // Verify agreement belongs to merchant
      const agreementCheck = await db.query(
        `SELECT id FROM agreements WHERE id = $1 AND merchant_id = $2`,
        [agreementId, req.user.merchantId]
      );

      if (agreementCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Agreement not found',
        });
      }

      const history = await getSettlementHistory(agreementId, limit);

      res.json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      console.error('Get settlement history error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get settlement history',
      });
    }
  }
);

/**
 * Recalculate revenue split for a transaction
 * POST /api/revenue-split/recalculate/:transactionId
 */
router.post(
  '/recalculate/:transactionId',
  authenticate,
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

      const { transactionId } = req.params;

      // Verify transaction belongs to merchant
      const transactionCheck = await db.query(
        `SELECT id FROM transactions WHERE id = $1 AND merchant_id = $2`,
        [transactionId, req.user.merchantId]
      );

      if (transactionCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Transaction not found',
        });
      }

      await recalculateTransactionRevenueSplit(transactionId);

      res.json({
        success: true,
        message: 'Revenue split recalculated',
      });
    } catch (error: any) {
      console.error('Recalculate error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to recalculate revenue split',
      });
    }
  }
);

/**
 * Bulk recalculate revenue splits for a date range
 * POST /api/revenue-split/recalculate/bulk
 */
router.post(
  '/recalculate/bulk',
  authenticate,
  requireMerchantAccess,
  requireMerchantRole(MerchantRole.MERCHANT_OWNER),
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.merchantId) {
        return res.status(403).json({
          success: false,
          error: 'Merchant ID required',
        });
      }

      const { startDate, endDate } = req.body;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Start date and end date are required',
        });
      }

      const result = await bulkRecalculateRevenueSplits(
        req.user.merchantId,
        new Date(startDate),
        new Date(endDate)
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Bulk recalculate error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to bulk recalculate revenue splits',
      });
    }
  }
);

export default router;

