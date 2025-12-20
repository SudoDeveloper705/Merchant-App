import { Router, Request, Response } from 'express';
import express from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth';
import { requireMerchantAccess } from '../middleware/accessGuard';
import { requireMerchantRole } from '../middleware/roleGuard';
import { MerchantRole } from '@merchant-app/shared';
import { db } from '../config/database';
import { encrypt } from '../utils/encryption';
import { syncStripeTransactions, syncStripeTransactionFromWebhook } from '../services/stripeSync';
import { getStripeClient, getStripeAccount } from '../services/stripe';

const router = Router();

/**
 * Connect Stripe account (store credentials)
 * POST /api/stripe/connect
 */
router.post(
  '/connect',
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

      const { apiKey, webhookSecret, processorAccountId, isDefault } = req.body;

      if (!apiKey || !processorAccountId) {
        return res.status(400).json({
          success: false,
          error: 'API key and processor account ID are required',
        });
      }

      // Verify the API key by making a test request
      try {
        const testStripe = new Stripe(apiKey, {
          apiVersion: '2024-11-20.acacia',
        });
        await testStripe.accounts.retrieve();
      } catch (error: any) {
        return res.status(400).json({
          success: false,
          error: `Invalid Stripe API key: ${error.message}`,
        });
      }

      // Encrypt credentials
      const encryptedApiKey = encrypt(apiKey);
      const encryptedWebhookSecret = webhookSecret ? encrypt(webhookSecret) : null;

      // Check if connection already exists
      const existing = await db.query(
        `SELECT id FROM merchant_payment_processors 
         WHERE merchant_id = $1 AND processor_type = 'STRIPE' AND processor_account_id = $2`,
        [req.user.merchantId, processorAccountId]
      );

      if (existing.rows.length > 0) {
        // Update existing connection
        await db.query(
          `UPDATE merchant_payment_processors 
           SET api_key_encrypted = $1,
               webhook_secret_encrypted = COALESCE($2, webhook_secret_encrypted),
               is_default = COALESCE($3, is_default),
               updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [encryptedApiKey, encryptedWebhookSecret, isDefault || false, existing.rows[0].id]
        );

        return res.json({
          success: true,
          data: { id: existing.rows[0].id, message: 'Stripe connection updated' },
        });
      }

      // If this is set as default, unset other defaults
      if (isDefault) {
        await db.query(
          `UPDATE merchant_payment_processors 
           SET is_default = false 
           WHERE merchant_id = $1 AND processor_type = 'STRIPE'`,
          [req.user.merchantId]
        );
      }

      // Create new connection
      const result = await db.query(
        `INSERT INTO merchant_payment_processors 
         (merchant_id, processor_type, processor_account_id, api_key_encrypted, 
          webhook_secret_encrypted, is_active, is_default)
         VALUES ($1, 'STRIPE', $2, $3, $4, true, $5)
         RETURNING id, processor_account_id, is_default, connected_at`,
        [
          req.user.merchantId,
          processorAccountId,
          encryptedApiKey,
          encryptedWebhookSecret,
          isDefault || false,
        ]
      );

      res.status(201).json({
        success: true,
        data: result.rows[0],
      });
    } catch (error: any) {
      console.error('Stripe connect error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to connect Stripe account',
      });
    }
  }
);

/**
 * Get Stripe account info
 * GET /api/stripe/account
 */
router.get(
  '/account',
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

      const stripe = await getStripeClient(req.user.merchantId);
      const account = await getStripeAccount(stripe);

      res.json({
        success: true,
        data: {
          id: account.id,
          email: account.email,
          country: account.country,
          default_currency: account.default_currency,
          type: account.type,
        },
      });
    } catch (error: any) {
      console.error('Get Stripe account error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch Stripe account',
      });
    }
  }
);

/**
 * Manual sync transactions
 * POST /api/stripe/sync
 */
router.post(
  '/sync',
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

      const { startDate, endDate, limit, processorId } = req.body;

      const syncResult = await syncStripeTransactions(req.user.merchantId, {
        processorId,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit || 100,
      });

      res.json({
        success: true,
        data: syncResult,
      });
    } catch (error: any) {
      console.error('Stripe sync error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to sync Stripe transactions',
      });
    }
  }
);

/**
 * Webhook endpoint (no auth required - uses signature verification)
 * POST /api/stripe/webhook
 * 
 * Note: Raw body is handled at the app level for this route
 */
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  if (!sig) {
    return res.status(400).json({
      success: false,
      error: 'Missing stripe-signature header',
    });
  }

  try {
    // Get webhook secret from database
    // We need to find which merchant this webhook is for
    // In production, you might use webhook endpoint IDs or account IDs
    
    // For MVP, we'll try to find the merchant by checking all active Stripe connections
    // This is not ideal for production - consider using webhook endpoint IDs
    const processors = await db.query(
      `SELECT merchant_id, webhook_secret_encrypted, id
       FROM merchant_payment_processors
       WHERE processor_type = 'STRIPE' AND is_active = true AND webhook_secret_encrypted IS NOT NULL`
    );

    let verifiedEvent: Stripe.Event | null = null;
    let merchantId: string | null = null;

    // Try to verify with each webhook secret until one works
    for (const processor of processors.rows) {
      try {
        const { decrypt } = await import('../utils/encryption');
        const webhookSecret = decrypt(processor.webhook_secret_encrypted);
        
        const stripe = new Stripe('', {
          apiVersion: '2024-11-20.acacia',
        });

        // req.body is a Buffer when using raw body parser
        const body = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
        
        verifiedEvent = stripe.webhooks.constructEvent(
          body,
          sig,
          webhookSecret
        ) as Stripe.Event;

        merchantId = processor.merchant_id;
        break;
      } catch (error) {
        // Try next processor
        continue;
      }
    }

    if (!verifiedEvent || !merchantId) {
      return res.status(400).json({
        success: false,
        error: 'Webhook signature verification failed',
      });
    }

    // Process the webhook event
    try {
      await syncStripeTransactionFromWebhook(merchantId, verifiedEvent);
      
      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      // Still return 200 to Stripe to prevent retries
      res.status(200).json({
        received: true,
        error: error.message,
      });
    }
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      error: `Webhook error: ${error.message}`,
    });
  }
});

/**
 * Get sync status
 * GET /api/stripe/sync/status
 */
router.get(
  '/sync/status',
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

      // Get latest sync info from transactions
      const latestSync = await db.query(
        `SELECT MAX(created_at) as last_sync, COUNT(*) as total_transactions
         FROM transactions
         WHERE merchant_id = $1 AND metadata->>'source' = 'stripe'`,
        [req.user.merchantId]
      );

      const processorInfo = await db.query(
        `SELECT id, processor_account_id, is_default, connected_at
         FROM merchant_payment_processors
         WHERE merchant_id = $1 AND processor_type = 'STRIPE' AND is_active = true`,
        [req.user.merchantId]
      );

      res.json({
        success: true,
        data: {
          lastSync: latestSync.rows[0]?.last_sync || null,
          totalTransactions: parseInt(latestSync.rows[0]?.total_transactions || '0'),
          processors: processorInfo.rows,
        },
      });
    } catch (error: any) {
      console.error('Get sync status error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sync status',
      });
    }
  }
);

export default router;

