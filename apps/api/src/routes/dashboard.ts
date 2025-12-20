import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireMerchantAccess, requirePartnerAccess } from '../middleware/accessGuard';
import { requirePartnerMerchantAccess } from '../middleware/partnerMerchantAccess';
import { requireAuth, requirePartner } from '../middleware/auth.middleware';
import { getMerchantDashboardMetrics, getPartnerDashboardMetrics, getPartnerDashboardMetricsAll } from '../services/dashboard';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get merchant dashboard metrics
 * GET /api/dashboard/merchant
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

      const { startDate, endDate, period } = req.query;

      let start: Date;
      let end: Date;

      if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);
      } else if (period === 'month' || !period) {
        // Default to current month
        const now = new Date();
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      } else if (period === 'year') {
        const now = new Date();
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid period. Use "month", "year", or provide startDate and endDate',
        });
      }

      const metrics = await getMerchantDashboardMetrics(
        req.user.merchantId,
        start,
        end
      );

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      console.error('Get merchant dashboard error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get dashboard metrics',
      });
    }
  }
);

/**
 * Get partner dashboard metrics for a specific merchant
 * GET /api/dashboard/partner/:merchantId
 * 
 * Requires:
 * - Partner authentication
 * - Valid merchant-partner link (validated by requirePartnerMerchantAccess)
 */
router.get(
  '/partner/:merchantId',
  requireAuth,
  requirePartner,
  requirePartnerMerchantAccess,
  async (req: Request, res: Response) => {
    try {
      if (!req.user?.partnerId) {
        return res.status(403).json({
          success: false,
          error: 'Partner ID required',
        });
      }

      const { merchantId } = req.params;
      const { startDate, endDate, period } = req.query;

      let start: Date;
      let end: Date;

      if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);
      } else if (period === 'month' || !period) {
        const now = new Date();
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      } else if (period === 'year') {
        const now = new Date();
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid period. Use "month", "year", or provide startDate and endDate',
        });
      }

      const metrics = await getPartnerDashboardMetrics(
        req.user.partnerId,
        merchantId,
        start,
        end
      );

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      console.error('Get partner dashboard error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get dashboard metrics',
      });
    }
  }
);

/**
 * Get partner dashboard metrics across all linked merchants
 * GET /api/dashboard/partner
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

      const { startDate, endDate, period } = req.query;

      let start: Date;
      let end: Date;

      if (startDate && endDate) {
        start = new Date(startDate as string);
        end = new Date(endDate as string);
      } else if (period === 'month' || !period) {
        const now = new Date();
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      } else if (period === 'year') {
        const now = new Date();
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid period. Use "month", "year", or provide startDate and endDate',
        });
      }

      const metrics = await getPartnerDashboardMetricsAll(
        req.user.partnerId,
        start,
        end
      );

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error: any) {
      console.error('Get partner dashboard error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get dashboard metrics',
      });
    }
  }
);

export default router;

