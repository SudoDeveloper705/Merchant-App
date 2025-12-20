import { db } from '../config/database';

/**
 * Agreement matching result
 */
export interface MatchedAgreement {
  id: string;
  merchant_id: string;
  partner_id: string;
  client_id: string | null;
  agreement_type: 'PERCENTAGE' | 'MINIMUM_GUARANTEE' | 'HYBRID';
  percentage_rate: number;
  minimum_guarantee_cents: number | null;
  currency: string;
  priority: number;
}

/**
 * Calculation result
 */
export interface RevenueSplitResult {
  agreement_id: string;
  partner_share_cents: number;
  merchant_share_cents: number;
  calculation_method: 'PERCENTAGE' | 'MINIMUM_GUARANTEE' | 'HYBRID';
  applied_minimum_guarantee: boolean;
}

/**
 * Find applicable agreement for a transaction
 * 
 * Matching rules:
 * 1. Agreement must be active (date range and is_active)
 * 2. Client-specific agreements override global agreements
 * 3. Higher priority overrides lower priority
 * 4. Only ONE agreement applies per transaction
 */
export async function findApplicableAgreement(
  merchantId: string,
  transactionDate: Date,
  clientId: string | null = null
): Promise<MatchedAgreement | null> {
  const transactionDateStr = transactionDate.toISOString().split('T')[0]; // YYYY-MM-DD

  // Build query to find matching agreements
  // Priority order:
  // 1. Client-specific agreements (client_id IS NOT NULL)
  // 2. Global agreements (client_id IS NULL)
  // 3. Higher priority within each group
  let query = `
    SELECT 
      a.id,
      a.merchant_id,
      a.partner_id,
      a.client_id,
      a.agreement_type,
      a.percentage_rate,
      a.minimum_guarantee_cents,
      a.currency,
      a.priority,
      CASE 
        WHEN a.client_id IS NOT NULL THEN 1
        ELSE 0
      END as is_client_specific
    FROM agreements a
    WHERE a.merchant_id = $1
      AND a.is_active = true
      AND a.start_date <= $2
      AND (a.end_date IS NULL OR a.end_date >= $2)
  `;

  const params: any[] = [merchantId, transactionDateStr];

  // If client_id is provided, prefer client-specific agreements
  if (clientId) {
    query += ` AND (a.client_id = $3 OR a.client_id IS NULL)`;
    params.push(clientId);
  } else {
    query += ` AND a.client_id IS NULL`;
  }

  query += `
    ORDER BY 
      is_client_specific DESC,  -- Client-specific first
      a.priority DESC,          -- Higher priority first
      a.created_at DESC         -- Newer agreements first (tiebreaker)
    LIMIT 1
  `;

  const result = await db.query(query, params);

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: row.id,
    merchant_id: row.merchant_id,
    partner_id: row.partner_id,
    client_id: row.client_id,
    agreement_type: row.agreement_type,
    percentage_rate: parseFloat(row.percentage_rate),
    minimum_guarantee_cents: row.minimum_guarantee_cents ? parseInt(row.minimum_guarantee_cents) : null,
    currency: row.currency,
    priority: parseInt(row.priority),
  };
}

/**
 * Calculate revenue split for a transaction
 * 
 * Rules:
 * - Use subtotal only (exclude sales tax)
 * - Partner share = percentage * subtotal
 * - Merchant share = subtotal - partner share
 * - Minimum guarantee is NOT applied at transaction level (applied at monthly settlement)
 */
export function calculateRevenueSplit(
  agreement: MatchedAgreement,
  subtotalCents: number,
  transactionType: 'PAYMENT' | 'REFUND' | 'CHARGEBACK'
): RevenueSplitResult {
  // For refunds and chargebacks, reverse the calculation
  const isNegative = transactionType === 'REFUND' || transactionType === 'CHARGEBACK';
  const effectiveSubtotal = isNegative ? -subtotalCents : subtotalCents;

  let partnerShareCents: number;
  let merchantShareCents: number;
  let calculationMethod: 'PERCENTAGE' | 'MINIMUM_GUARANTEE' | 'HYBRID' = 'PERCENTAGE';
  let appliedMinimumGuarantee = false;

  switch (agreement.agreement_type) {
    case 'PERCENTAGE':
      // Simple percentage split
      partnerShareCents = Math.round(effectiveSubtotal * agreement.percentage_rate);
      merchantShareCents = effectiveSubtotal - partnerShareCents;
      calculationMethod = 'PERCENTAGE';
      break;

    case 'MINIMUM_GUARANTEE':
      // At transaction level, use percentage (minimum guarantee applied at settlement)
      // If no percentage_rate, assume 0% (all to merchant until settlement)
      const percentage = agreement.percentage_rate || 0;
      partnerShareCents = Math.round(effectiveSubtotal * percentage);
      merchantShareCents = effectiveSubtotal - partnerShareCents;
      calculationMethod = 'MINIMUM_GUARANTEE';
      break;

    case 'HYBRID':
      // Percentage split at transaction level
      // Minimum guarantee will be applied at monthly settlement
      partnerShareCents = Math.round(effectiveSubtotal * agreement.percentage_rate);
      merchantShareCents = effectiveSubtotal - partnerShareCents;
      calculationMethod = 'HYBRID';
      break;

    default:
      throw new Error(`Unknown agreement type: ${agreement.agreement_type}`);
  }

  // Ensure non-negative values (for refunds, we store absolute values)
  partnerShareCents = Math.abs(partnerShareCents);
  merchantShareCents = Math.abs(merchantShareCents);

  return {
    agreement_id: agreement.id,
    partner_share_cents: partnerShareCents,
    merchant_share_cents: merchantShareCents,
    calculation_method: calculationMethod,
    applied_minimum_guarantee: appliedMinimumGuarantee,
  };
}

/**
 * Process revenue split for a transaction
 * Finds agreement, calculates split, and stores in transaction_agreement_links
 */
export async function processTransactionRevenueSplit(
  transactionId: string,
  merchantId: string,
  subtotalCents: number,
  transactionDate: Date,
  transactionType: 'PAYMENT' | 'REFUND' | 'CHARGEBACK',
  clientId: string | null = null
): Promise<RevenueSplitResult | null> {
  // Find applicable agreement
  const agreement = await findApplicableAgreement(merchantId, transactionDate, clientId);

  if (!agreement) {
    // No agreement found - no split needed
    return null;
  }

  // Calculate split
  const splitResult = calculateRevenueSplit(agreement, subtotalCents, transactionType);

  // Store in transaction_agreement_links (upsert)
  await db.query(
    `INSERT INTO transaction_agreement_links 
     (transaction_id, agreement_id, partner_share_cents, merchant_share_cents, calculation_method)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (transaction_id, agreement_id)
     DO UPDATE SET
       partner_share_cents = EXCLUDED.partner_share_cents,
       merchant_share_cents = EXCLUDED.merchant_share_cents,
       calculation_method = EXCLUDED.calculation_method,
       updated_at = CURRENT_TIMESTAMP`,
    [
      transactionId,
      splitResult.agreement_id,
      splitResult.partner_share_cents,
      splitResult.merchant_share_cents,
      splitResult.calculation_method,
    ]
  );

  return splitResult;
}

/**
 * Get monthly revenue summary for an agreement
 */
export async function getMonthlyRevenueSummary(
  agreementId: string,
  year: number,
  month: number
): Promise<{
  total_partner_share_cents: number;
  total_merchant_share_cents: number;
  transaction_count: number;
  minimum_guarantee_cents: number | null;
}> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Get agreement details
  const agreementResult = await db.query(
    `SELECT minimum_guarantee_cents, currency
     FROM agreements
     WHERE id = $1`,
    [agreementId]
  );

  if (agreementResult.rows.length === 0) {
    throw new Error('Agreement not found');
  }

  const agreement = agreementResult.rows[0];

  // Calculate monthly totals from transaction_agreement_links
  // Only count COMPLETED transactions
  const summaryResult = await db.query(
    `SELECT 
       COALESCE(SUM(tal.partner_share_cents), 0) as total_partner_share_cents,
       COALESCE(SUM(tal.merchant_share_cents), 0) as total_merchant_share_cents,
       COUNT(*) as transaction_count
     FROM transaction_agreement_links tal
     INNER JOIN transactions t ON t.id = tal.transaction_id
     WHERE tal.agreement_id = $1
       AND t.status = 'COMPLETED'
       AND t.transaction_type = 'PAYMENT'
       AND t.transaction_date >= $2
       AND t.transaction_date <= $3`,
    [agreementId, startDate, endDate]
  );

  const summary = summaryResult.rows[0];

  return {
    total_partner_share_cents: parseInt(summary.total_partner_share_cents || '0'),
    total_merchant_share_cents: parseInt(summary.total_merchant_share_cents || '0'),
    transaction_count: parseInt(summary.transaction_count || '0'),
    minimum_guarantee_cents: agreement.minimum_guarantee_cents
      ? parseInt(agreement.minimum_guarantee_cents)
      : null,
  };
}

