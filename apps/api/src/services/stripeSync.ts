import { db } from '../config/database';
import { getStripeClient, fetchStripePayments, fetchStripeCharges, fetchStripePayouts } from './stripe';
import { normalizePaymentIntent, normalizeCharge, normalizePayout } from './stripeNormalizer';
import { processTransactionRevenueSplit } from './revenueSplit';

/**
 * Sync Stripe transactions for a merchant
 * This function is idempotent and safe to run multiple times
 */
export async function syncStripeTransactions(
  merchantId: string,
  options: {
    processorId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  } = {}
): Promise<{
  transactionsCreated: number;
  transactionsUpdated: number;
  payoutsCreated: number;
  payoutsUpdated: number;
  errors: string[];
}> {
  const result = {
    transactionsCreated: 0,
    transactionsUpdated: 0,
    payoutsCreated: 0,
    payoutsUpdated: 0,
    errors: [] as string[],
  };

  try {
    const stripe = await getStripeClient(merchantId, options.processorId);

    // Sync charges (more detailed than payment intents)
    const createdFilter: any = {};
    if (options.startDate) {
      createdFilter.gte = Math.floor(options.startDate.getTime() / 1000);
    }
    if (options.endDate) {
      createdFilter.lte = Math.floor(options.endDate.getTime() / 1000);
    }

    // Fetch charges
    let hasMore = true;
    let startingAfter: string | undefined;

    while (hasMore) {
      const charges = await fetchStripeCharges(stripe, {
        limit: options.limit || 100,
        startingAfter,
        created: Object.keys(createdFilter).length > 0 ? createdFilter : undefined,
      });

      for (const charge of charges) {
        try {
          const normalized = normalizeCharge(charge);
          const transaction = await upsertTransaction(merchantId, normalized);
          
          // Process revenue split if transaction is COMPLETED
          if (transaction && normalized.status === 'COMPLETED') {
            try {
              await processTransactionRevenueSplit(
                transaction.id,
                merchantId,
                normalized.subtotal_cents,
                normalized.transaction_date,
                normalized.transaction_type,
                transaction.client_id || null
              );
            } catch (splitError: any) {
              console.error(`Revenue split error for transaction ${transaction.id}:`, splitError);
              // Don't fail sync if revenue split fails
            }
          }
          
          result.transactionsCreated++;
        } catch (error: any) {
          result.errors.push(`Error syncing charge ${charge.id}: ${error.message}`);
        }
      }

      hasMore = charges.length === (options.limit || 100);
      if (hasMore && charges.length > 0) {
        startingAfter = charges[charges.length - 1].id;
      } else {
        hasMore = false;
      }
    }

    // Sync payouts
    hasMore = true;
    startingAfter = undefined;

    while (hasMore) {
      const payouts = await fetchStripePayouts(stripe, {
        limit: options.limit || 100,
        startingAfter,
        created: Object.keys(createdFilter).length > 0 ? createdFilter : undefined,
      });

      for (const payout of payouts) {
        try {
          const normalized = normalizePayout(payout);
          await upsertPayout(merchantId, normalized);
          result.payoutsCreated++;
        } catch (error: any) {
          result.errors.push(`Error syncing payout ${payout.id}: ${error.message}`);
        }
      }

      hasMore = payouts.length === (options.limit || 100);
      if (hasMore && payouts.length > 0) {
        startingAfter = payouts[payouts.length - 1].id;
      } else {
        hasMore = false;
      }
    }
  } catch (error: any) {
    result.errors.push(`Sync error: ${error.message}`);
  }

  return result;
}

/**
 * Upsert a transaction (insert or update if exists)
 * Returns the transaction ID if created/updated
 */
async function upsertTransaction(
  merchantId: string,
  normalized: ReturnType<typeof normalizeCharge>
): Promise<{ id: string; client_id: string | null } | null> {
  // Check if transaction already exists
  const existing = await db.query(
    `SELECT id FROM transactions WHERE external_id = $1 AND merchant_id = $2`,
    [normalized.external_id, merchantId]
  );

  const metadataJson = JSON.stringify({
    ...normalized.metadata,
    source: 'stripe',
    raw_stripe_data: normalized.raw_stripe_data,
  });

  if (existing.rows.length > 0) {
    // Update existing transaction
    const updateResult = await db.query(
      `UPDATE transactions 
       SET status = $1,
           subtotal_cents = $2,
           sales_tax_cents = $3,
           total_cents = $4,
           fees_cents = $5,
           net_cents = $6,
           description = $7,
           metadata = $8::jsonb,
           transaction_date = $9,
           source = 'STRIPE',
           updated_at = CURRENT_TIMESTAMP
       WHERE external_id = $10 AND merchant_id = $11
       RETURNING id, client_id`,
      [
        normalized.status,
        normalized.subtotal_cents,
        normalized.sales_tax_cents,
        normalized.total_cents,
        normalized.fees_cents,
        normalized.net_cents,
        normalized.description,
        metadataJson,
        normalized.transaction_date,
        normalized.external_id,
        merchantId,
      ]
    );
    return updateResult.rows[0] || null;
  } else {
    // Insert new transaction
    const insertResult = await db.query(
      `INSERT INTO transactions 
       (merchant_id, external_id, transaction_type, status,
        subtotal_cents, sales_tax_cents, total_cents, fees_cents, net_cents,
        currency, description, metadata, transaction_date, source)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, 'STRIPE')
       RETURNING id, client_id`,
      [
        merchantId,
        normalized.external_id,
        normalized.transaction_type,
        normalized.status,
        normalized.subtotal_cents,
        normalized.sales_tax_cents,
        normalized.total_cents,
        normalized.fees_cents,
        normalized.net_cents,
        normalized.currency,
        normalized.description,
        metadataJson,
        normalized.transaction_date,
      ]
    );
    return insertResult.rows[0] || null;
  }
}

/**
 * Upsert a payout (insert or update if exists)
 */
async function upsertPayout(
  merchantId: string,
  normalized: ReturnType<typeof normalizePayout>
): Promise<void> {
  // Check if payout already exists
  const existing = await db.query(
    `SELECT id FROM payouts WHERE payout_reference = $1 AND merchant_id = $2`,
    [normalized.payout_reference, merchantId]
  );

  const metadataJson = JSON.stringify({
    ...normalized.metadata,
    source: 'stripe',
    raw_stripe_data: normalized.raw_stripe_data,
  });

  if (existing.rows.length > 0) {
    // Update existing payout
    await db.query(
      `UPDATE payouts 
       SET amount_cents = $1,
           status = $2,
           processed_at = $3,
           metadata = $4::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE payout_reference = $5 AND merchant_id = $6`,
      [
        normalized.amount_cents,
        normalized.status,
        normalized.processed_at,
        metadataJson,
        normalized.payout_reference,
        merchantId,
      ]
    );
  } else {
    // Insert new payout
    await db.query(
      `INSERT INTO payouts 
       (merchant_id, amount_cents, currency, status, payout_method, 
        payout_reference, processed_at, metadata)
       VALUES ($1, $2, $3, $4, 'STRIPE', $5, $6, $7::jsonb)`,
      [
        merchantId,
        normalized.amount_cents,
        normalized.currency,
        normalized.status,
        normalized.payout_reference,
        normalized.processed_at,
        metadataJson,
      ]
    );
  }
}

/**
 * Sync a single transaction from webhook
 */
export async function syncStripeTransactionFromWebhook(
  merchantId: string,
  stripeEvent: any
): Promise<void> {
  try {
    const stripe = await getStripeClient(merchantId);

    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'charge.succeeded':
      case 'charge.failed':
        const chargeId = stripeEvent.data.object.id;
        const charge = await stripe.charges.retrieve(chargeId);
        const normalized = normalizeCharge(charge);
        const transaction = await upsertTransaction(merchantId, normalized);
        
        // Process revenue split if transaction is COMPLETED
        if (transaction && normalized.status === 'COMPLETED') {
          try {
            await processTransactionRevenueSplit(
              transaction.id,
              merchantId,
              normalized.subtotal_cents,
              normalized.transaction_date,
              normalized.transaction_type,
              transaction.client_id || null
            );
          } catch (splitError: any) {
            console.error(`Revenue split error for transaction ${transaction.id}:`, splitError);
          }
        }
        break;

      case 'charge.refunded':
        const refundedChargeId = stripeEvent.data.object.id;
        const refundedCharge = await stripe.charges.retrieve(refundedChargeId);
        const refundedNormalized = normalizeCharge(refundedCharge);
        refundedNormalized.transaction_type = 'REFUND';
        const refundTransaction = await upsertTransaction(merchantId, refundedNormalized);
        
        // Process revenue split for refund
        if (refundTransaction && refundedNormalized.status === 'COMPLETED') {
          try {
            await processTransactionRevenueSplit(
              refundTransaction.id,
              merchantId,
              refundedNormalized.subtotal_cents,
              refundedNormalized.transaction_date,
              'REFUND',
              refundTransaction.client_id || null
            );
          } catch (splitError: any) {
            console.error(`Revenue split error for refund ${refundTransaction.id}:`, splitError);
          }
        }
        break;

      case 'payout.paid':
      case 'payout.failed':
      case 'payout.canceled':
        const payout = stripeEvent.data.object;
        const normalizedPayout = normalizePayout(payout);
        await upsertPayout(merchantId, normalizedPayout);
        break;

      default:
        // Other event types are ignored for MVP
        break;
    }
  } catch (error: any) {
    throw new Error(`Error syncing from webhook: ${error.message}`);
  }
}

