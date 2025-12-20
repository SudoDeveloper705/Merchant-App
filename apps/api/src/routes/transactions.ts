import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireMerchantAccess, requireMerchantAccessById } from '../middleware/accessGuard';
import { requireMerchantRole } from '../middleware/roleGuard';
import { MerchantRole } from '@merchant-app/shared';
import { db } from '../config/database';
import { processTransactionRevenueSplit } from '../services/revenueSplit';
import { handleTransactionStatusChange } from '../services/revenueSplitEdgeCases';
import { getCanViewClientNames, redactClientName } from '../utils/partnerClientAccess';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * Get transactions for merchant's own data (merchant users)
 */
router.get('/merchant', requireMerchantAccess, async (req: Request, res: Response) => {
  try {
    if (!req.user?.merchantId) {
      return res.status(403).json({
        success: false,
        error: 'Merchant ID required',
      });
    }

    const { page = 1, limit = 20, status, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT id, merchant_id, client_id, external_id, transaction_type, status,
             subtotal_cents, sales_tax_cents, total_cents, fees_cents, net_cents,
             currency, description, metadata, transaction_date, created_at, updated_at
      FROM transactions
      WHERE merchant_id = $1
    `;
    const params: any[] = [req.user.merchantId];

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

    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) FROM transactions WHERE merchant_id = $1',
      [req.user.merchantId]
    );

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
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
    });
  }
});

/**
 * Get transactions for a specific merchant (partner users can access linked merchants)
 */
router.get('/merchant/:merchantId', requireMerchantAccessById(), async (req: Request, res: Response) => {
  try {
    const { merchantId } = req.params;
    const { page = 1, limit = 20, status, type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Check if user is a partner and get canViewClientNames flag
    let canViewClientNames = true; // Default for merchant users
    if (req.user?.userType === 'partner' && req.user.partnerId) {
      canViewClientNames = await getCanViewClientNames(merchantId, req.user.partnerId);
    }

    // Join with clients table to get client names if needed
    let query = `
      SELECT 
        t.id, 
        t.merchant_id, 
        t.client_id, 
        ${canViewClientNames ? 'c.name as client_name,' : ''}
        t.external_id, 
        t.transaction_type, 
        t.status,
        t.subtotal_cents, 
        t.sales_tax_cents, 
        t.total_cents, 
        t.fees_cents, 
        t.net_cents,
        t.currency, 
        t.description, 
        t.metadata, 
        t.transaction_date, 
        t.created_at, 
        t.updated_at
      FROM transactions t
      ${canViewClientNames ? 'LEFT JOIN clients c ON t.client_id = c.id' : ''}
      WHERE t.merchant_id = $1
    `;
    const params: any[] = [merchantId];

    if (status) {
      query += ' AND t.status = $' + (params.length + 1);
      params.push(status);
    }

    if (type) {
      query += ' AND t.transaction_type = $' + (params.length + 1);
      params.push(type);
    }

    query += ' ORDER BY t.transaction_date DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(Number(limit), offset);

    const result = await db.query(query, params);

    const countResult = await db.query(
      'SELECT COUNT(*) FROM transactions WHERE merchant_id = $1',
      [merchantId]
    );

    // Redact client names if not allowed
    const transactions = result.rows.map((row) => {
      const transaction: any = {
        id: row.id,
        merchant_id: row.merchant_id,
        client_id: row.client_id,
        external_id: row.external_id,
        transaction_type: row.transaction_type,
        status: row.status,
        subtotal_cents: row.subtotal_cents,
        sales_tax_cents: row.sales_tax_cents,
        total_cents: row.total_cents,
        fees_cents: row.fees_cents,
        net_cents: row.net_cents,
        currency: row.currency,
        description: row.description,
        metadata: row.metadata,
        transaction_date: row.transaction_date,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };

      // Add client_name only if allowed
      if (canViewClientNames) {
        transaction.client_name = row.client_name || null;
      } else {
        transaction.client_name = null; // Redacted
      }

      return transaction;
    });

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transactions',
    });
  }
});

/**
 * Create transaction (merchant users only, owner/manager/accountant)
 */
router.post('/',
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
        clientId,
        externalId,
        transactionType,
        subtotalCents,
        salesTaxCents,
        totalCents,
        feesCents,
        netCents,
        currency,
        description,
        metadata,
      } = req.body;

      if (!subtotalCents || !totalCents || !netCents) {
        return res.status(400).json({
          success: false,
          error: 'Missing required transaction fields',
        });
      }

      const result = await db.query(
        `INSERT INTO transactions 
         (merchant_id, client_id, external_id, transaction_type, status,
          subtotal_cents, sales_tax_cents, total_cents, fees_cents, net_cents,
          currency, description, metadata, transaction_date)
         VALUES ($1, $2, $3, $4, 'PENDING', $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          req.user.merchantId,
          clientId || null,
          externalId || null,
          transactionType || 'PAYMENT',
          subtotalCents,
          salesTaxCents || 0,
          totalCents,
          feesCents || 0,
          netCents,
          currency || 'USD',
          description || null,
          metadata ? JSON.stringify(metadata) : null,
          new Date(),
        ]
      );

      const transaction = result.rows[0];

      // Process revenue split if transaction is COMPLETED
      if (transaction.status === 'COMPLETED') {
        try {
          await processTransactionRevenueSplit(
            transaction.id,
            transaction.merchant_id,
            transaction.subtotal_cents,
            transaction.transaction_date,
            transaction.transaction_type,
            transaction.client_id
          );
        } catch (error: any) {
          console.error('Revenue split processing error:', error);
          // Don't fail transaction creation if revenue split fails
        }
      }

      res.status(201).json({
        success: true,
        data: transaction,
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

export default router;

