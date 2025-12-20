import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireMerchantAccess, requirePartnerAccess } from '../middleware/accessGuard';
import { requireMerchantRole } from '../middleware/roleGuard';
import { MerchantRole } from '@merchant-app/shared';
import { getPartnerSettlementReport, getTransactionsForExport, getPayoutsForExport } from '../services/reports';
import { transactionsToCsv, payoutsToCsv, settlementReportToCsv } from '../utils/csvExport';
import { getCanViewClientNames } from '../utils/partnerClientAccess';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get monthly partner settlement report
 * GET /api/reports/settlement
 */
router.get(
  '/settlement',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { merchantId, partnerId, year, month, format } = req.query;

      if (!year || !month) {
        return res.status(400).json({
          success: false,
          error: 'Year and month are required',
        });
      }

      let effectiveMerchantId: string;
      let effectivePartnerId: string;

      // Determine merchant and partner based on user type
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
        const { db } = await import('../config/database');
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

      const report = await getPartnerSettlementReport(
        effectiveMerchantId,
        effectivePartnerId,
        Number(year),
        Number(month)
      );

      // Return CSV if requested
      if (format === 'csv') {
        const csv = settlementReportToCsv(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="settlement-report-${year}-${month}.csv"`);
        return res.send(csv);
      }

      res.json({
        success: true,
        data: report,
      });
    } catch (error: any) {
      console.error('Get settlement report error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get settlement report',
      });
    }
  }
);

/**
 * Export transactions (CSV)
 * GET /api/reports/transactions/export
 */
router.get(
  '/transactions/export',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, partnerId, format } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Start date and end date are required',
        });
      }

      let effectiveMerchantId: string;
      let effectivePartnerId: string | null = null;

      if (req.user?.userType === 'merchant') {
        if (!req.user.merchantId) {
          return res.status(403).json({
            success: false,
            error: 'Merchant ID required',
          });
        }
        effectiveMerchantId = req.user.merchantId;
        effectivePartnerId = partnerId as string | null;
      } else if (req.user?.userType === 'partner') {
        if (!req.user.partnerId) {
          return res.status(403).json({
            success: false,
            error: 'Partner ID required',
          });
        }
        effectivePartnerId = req.user.partnerId;

        // Partner must specify merchant
        const merchantId = req.query.merchantId as string;
        if (!merchantId) {
          return res.status(400).json({
            success: false,
            error: 'Merchant ID is required for partner users',
          });
        }

        // Verify merchant is linked
        const { db } = await import('../config/database');
        const linkCheck = await db.query(
          `SELECT id FROM merchant_partner_links 
           WHERE merchant_id = $1 AND partner_id = $2 AND is_active = true`,
          [merchantId, effectivePartnerId]
        );

        if (linkCheck.rows.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'Merchant is not linked to your partner account',
          });
        }

        effectiveMerchantId = merchantId;
      } else {
        return res.status(403).json({
          success: false,
          error: 'Invalid user type',
        });
      }

      // Check if partner can view client names
      let canViewClientNames = true; // Default for merchant users
      if (req.user?.userType === 'partner' && effectivePartnerId && effectiveMerchantId) {
        canViewClientNames = await getCanViewClientNames(effectiveMerchantId, effectivePartnerId);
      }

      const transactions = await getTransactionsForExport(
        effectiveMerchantId,
        effectivePartnerId,
        new Date(startDate as string),
        new Date(endDate as string),
        canViewClientNames
      );

      // Return CSV
      const csv = transactionsToCsv(transactions);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transactions-${startDate}-${endDate}.csv"`);
      res.send(csv);
    } catch (error: any) {
      console.error('Export transactions error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to export transactions',
      });
    }
  }
);

/**
 * Export payouts (CSV)
 * GET /api/reports/payouts/export
 */
router.get(
  '/payouts/export',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, partnerId, format } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          error: 'Start date and end date are required',
        });
      }

      let effectiveMerchantId: string;
      let effectivePartnerId: string | null = null;

      if (req.user?.userType === 'merchant') {
        if (!req.user.merchantId) {
          return res.status(403).json({
            success: false,
            error: 'Merchant ID required',
          });
        }
        effectiveMerchantId = req.user.merchantId;
        effectivePartnerId = partnerId as string | null;
      } else if (req.user?.userType === 'partner') {
        if (!req.user.partnerId) {
          return res.status(403).json({
            success: false,
            error: 'Partner ID required',
          });
        }
        effectivePartnerId = req.user.partnerId;

        // Partner must specify merchant
        const merchantId = req.query.merchantId as string;
        if (!merchantId) {
          return res.status(400).json({
            success: false,
            error: 'Merchant ID is required for partner users',
          });
        }

        // Verify merchant is linked
        const { db } = await import('../config/database');
        const linkCheck = await db.query(
          `SELECT id FROM merchant_partner_links 
           WHERE merchant_id = $1 AND partner_id = $2 AND is_active = true`,
          [merchantId, effectivePartnerId]
        );

        if (linkCheck.rows.length === 0) {
          return res.status(403).json({
            success: false,
            error: 'Merchant is not linked to your partner account',
          });
        }

        effectiveMerchantId = merchantId;
      } else {
        return res.status(403).json({
          success: false,
          error: 'Invalid user type',
        });
      }

      const payouts = await getPayoutsForExport(
        effectiveMerchantId,
        effectivePartnerId,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      // Return CSV
      const csv = payoutsToCsv(payouts);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="payouts-${startDate}-${endDate}.csv"`);
      res.send(csv);
    } catch (error: any) {
      console.error('Export payouts error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to export payouts',
      });
    }
  }
);

export default router;

