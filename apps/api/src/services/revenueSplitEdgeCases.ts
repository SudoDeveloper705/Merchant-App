import { db } from '../config/database';
import { processTransactionRevenueSplit } from './revenueSplit';

/**
 * Handle edge cases for revenue split processing
 */

/**
 * Process refund transaction
 * Refunds reverse the original transaction's revenue split
 */
export async function processRefundRevenueSplit(
  refundTransactionId: string,
  originalTransactionId: string,
  merchantId: string,
  subtotalCents: number,
  transactionDate: Date,
  clientId: string | null = null
): Promise<void> {
  // Check if original transaction has an agreement link
  const originalLinkResult = await db.query(
    `SELECT agreement_id, partner_share_cents, merchant_share_cents
     FROM transaction_agreement_links
     WHERE transaction_id = $1`,
    [originalTransactionId]
  );

  if (originalLinkResult.rows.length === 0) {
    // Original transaction had no agreement - refund also has no split
    return;
  }

  const originalLink = originalLinkResult.rows[0];

  // For refunds, we reverse the shares
  // Partner gets negative of their original share
  // Merchant gets negative of their original share
  const refundPartnerShare = originalLink.partner_share_cents;
  const refundMerchantShare = originalLink.merchant_share_cents;

  // Store refund split (using same agreement)
  await db.query(
    `INSERT INTO transaction_agreement_links 
     (transaction_id, agreement_id, partner_share_cents, merchant_share_cents, calculation_method)
     VALUES ($1, $2, $3, $4, 'PERCENTAGE')
     ON CONFLICT (transaction_id, agreement_id)
     DO UPDATE SET
       partner_share_cents = EXCLUDED.partner_share_cents,
       merchant_share_cents = EXCLUDED.merchant_share_cents,
       updated_at = CURRENT_TIMESTAMP`,
    [
      refundTransactionId,
      originalLink.agreement_id,
      refundPartnerShare,
      refundMerchantShare,
    ]
  );
}

/**
 * Process transaction with missing client
 * Uses global agreement if available
 */
export async function processTransactionWithMissingClient(
  transactionId: string,
  merchantId: string,
  subtotalCents: number,
  transactionDate: Date
): Promise<void> {
  // Try to find global agreement (client_id IS NULL)
  await processTransactionRevenueSplit(
    transactionId,
    merchantId,
    subtotalCents,
    transactionDate,
    'PAYMENT',
    null // No client ID
  );
}

/**
 * Recalculate revenue split for a transaction
 * Useful when agreement changes or transaction is updated
 */
export async function recalculateTransactionRevenueSplit(
  transactionId: string
): Promise<void> {
  // Get transaction details
  const transactionResult = await db.query(
    `SELECT id, merchant_id, client_id, subtotal_cents, transaction_date, transaction_type
     FROM transactions
     WHERE id = $1`,
    [transactionId]
  );

  if (transactionResult.rows.length === 0) {
    throw new Error('Transaction not found');
  }

  const transaction = transactionResult.rows[0];

  // Delete existing links
  await db.query(
    `DELETE FROM transaction_agreement_links WHERE transaction_id = $1`,
    [transactionId]
  );

  // Recalculate
  if (transaction.transaction_type === 'REFUND') {
    // For refunds, we need the original transaction
    // This is a simplified version - in production, you'd link refunds to originals
    await processTransactionRevenueSplit(
      transactionId,
      transaction.merchant_id,
      transaction.subtotal_cents,
      transaction.transaction_date,
      'REFUND',
      transaction.client_id
    );
  } else {
    await processTransactionRevenueSplit(
      transactionId,
      transaction.merchant_id,
      transaction.subtotal_cents,
      transaction.transaction_date,
      transaction.transaction_type,
      transaction.client_id
    );
  }
}

/**
 * Handle transaction status change
 * Only process revenue split for COMPLETED transactions
 */
export async function handleTransactionStatusChange(
  transactionId: string,
  newStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
): Promise<void> {
  if (newStatus === 'COMPLETED') {
    // Recalculate if not already calculated
    const existingLinkResult = await db.query(
      `SELECT id FROM transaction_agreement_links WHERE transaction_id = $1`,
      [transactionId]
    );

    if (existingLinkResult.rows.length === 0) {
      // No split calculated yet - calculate now
      await recalculateTransactionRevenueSplit(transactionId);
    }
  } else if (newStatus === 'FAILED' || newStatus === 'CANCELLED') {
    // Remove revenue split for failed/cancelled transactions
    await db.query(
      `DELETE FROM transaction_agreement_links WHERE transaction_id = $1`,
      [transactionId]
    );
  }
  // PENDING transactions keep their splits (if any) until status changes
}

/**
 * Bulk recalculate revenue splits for a date range
 * Useful for backfilling or fixing calculation errors
 */
export async function bulkRecalculateRevenueSplits(
  merchantId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  processed: number;
  errors: string[];
}> {
  const result = {
    processed: 0,
    errors: [] as string[],
  };

  // Get all transactions in date range
  const transactionsResult = await db.query(
    `SELECT id, merchant_id, client_id, subtotal_cents, transaction_date, transaction_type, status
     FROM transactions
     WHERE merchant_id = $1
       AND transaction_date >= $2
       AND transaction_date <= $3
       AND status = 'COMPLETED'
     ORDER BY transaction_date`,
    [merchantId, startDate, endDate]
  );

  for (const transaction of transactionsResult.rows) {
    try {
      // Delete existing links
      await db.query(
        `DELETE FROM transaction_agreement_links WHERE transaction_id = $1`,
        [transaction.id]
      );

      // Recalculate
      if (transaction.transaction_type !== 'REFUND') {
        await processTransactionRevenueSplit(
          transaction.id,
          transaction.merchant_id,
          transaction.subtotal_cents,
          transaction.transaction_date,
          transaction.transaction_type,
          transaction.client_id
        );
      }

      result.processed++;
    } catch (error: any) {
      result.errors.push(`Transaction ${transaction.id}: ${error.message}`);
    }
  }

  return result;
}

