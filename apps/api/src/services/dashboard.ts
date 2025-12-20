import { db } from '../config/database';

/**
 * Merchant dashboard metrics
 */
export interface MerchantDashboardMetrics {
  total_revenue_cents: number;
  total_expenses_cents: number;
  net_profit_cents: number;
  amount_owed_to_partners_cents: number;
  currency: string;
  period_start: Date;
  period_end: Date;
}

/**
 * Get merchant dashboard metrics
 * 
 * Metrics:
 * - Total revenue (subtotal only, from COMPLETED transactions)
 * - Total expenses (expenses + fees from transactions)
 * - Net profit (revenue - expenses - partner shares)
 * - Amount owed to partners (outstanding partner shares)
 */
export async function getMerchantDashboardMetrics(
  merchantId: string,
  startDate: Date,
  endDate: Date
): Promise<MerchantDashboardMetrics> {
  // Total revenue (subtotal from COMPLETED transactions)
  const revenueResult = await db.query(
    `SELECT 
       COALESCE(SUM(subtotal_cents), 0) as total_revenue_cents,
       currency
     FROM transactions
     WHERE merchant_id = $1
       AND status = 'COMPLETED'
       AND transaction_type = 'PAYMENT'
       AND transaction_date >= $2
       AND transaction_date <= $3
     GROUP BY currency
     ORDER BY total_revenue_cents DESC
     LIMIT 1`,
    [merchantId, startDate, endDate]
  );

  const totalRevenueCents = parseInt(revenueResult.rows[0]?.total_revenue_cents || '0');
  const currency = revenueResult.rows[0]?.currency || 'USD';

  // Total expenses (expenses table + fees from transactions)
  const expensesResult = await db.query(
    `SELECT COALESCE(SUM(amount_cents), 0) as total_expenses_cents
     FROM expenses
     WHERE merchant_id = $1
       AND expense_date >= $2
       AND expense_date <= $3`,
    [merchantId, startDate, endDate]
  );

  const transactionFeesResult = await db.query(
    `SELECT COALESCE(SUM(fees_cents), 0) as total_fees_cents
     FROM transactions
     WHERE merchant_id = $1
       AND status = 'COMPLETED'
       AND transaction_date >= $2
       AND transaction_date <= $3`,
    [merchantId, startDate, endDate]
  );

  const expensesCents = parseInt(expensesResult.rows[0]?.total_expenses_cents || '0');
  const feesCents = parseInt(transactionFeesResult.rows[0]?.total_fees_cents || '0');
  const totalExpensesCents = expensesCents + feesCents;

  // Amount owed to partners (outstanding partner shares)
  // Sum of partner shares from transaction_agreement_links minus completed payouts
  const partnerSharesResult = await db.query(
    `SELECT COALESCE(SUM(tal.partner_share_cents), 0) as total_partner_shares_cents
     FROM transaction_agreement_links tal
     INNER JOIN transactions t ON t.id = tal.transaction_id
     WHERE t.merchant_id = $1
       AND t.status = 'COMPLETED'
       AND t.transaction_type = 'PAYMENT'
       AND t.transaction_date >= $2
       AND t.transaction_date <= $3`,
    [merchantId, startDate, endDate]
  );

  const totalPartnerSharesCents = parseInt(partnerSharesResult.rows[0]?.total_partner_shares_cents || '0');

  // Completed payouts to partners
  const payoutsResult = await db.query(
    `SELECT COALESCE(SUM(amount_cents), 0) as total_payouts_cents
     FROM payouts
     WHERE merchant_id = $1
       AND partner_id IS NOT NULL
       AND status = 'COMPLETED'
       AND scheduled_date >= $2
       AND scheduled_date <= $3`,
    [merchantId, startDate, endDate]
  );

  const totalPayoutsCents = parseInt(payoutsResult.rows[0]?.total_payouts_cents || '0');
  const amountOwedToPartnersCents = totalPartnerSharesCents - totalPayoutsCents;

  // Net profit = revenue - expenses - partner shares
  const netProfitCents = totalRevenueCents - totalExpensesCents - totalPartnerSharesCents;

  return {
    total_revenue_cents: totalRevenueCents,
    total_expenses_cents: totalExpensesCents,
    net_profit_cents: netProfitCents,
    amount_owed_to_partners_cents: Math.max(0, amountOwedToPartnersCents), // Don't show negative
    currency,
    period_start: startDate,
    period_end: endDate,
  };
}

/**
 * Partner dashboard metrics
 */
export interface PartnerDashboardMetrics {
  total_revenue_cents: number;
  partner_share_cents: number;
  merchant_share_cents: number;
  sales_tax_cents: number;
  currency: string;
  period_start: Date;
  period_end: Date;
}

/**
 * Get partner dashboard metrics for a specific merchant
 * 
 * Metrics:
 * - Revenue related to partner (from linked merchant transactions)
 * - Partner share (from transaction_agreement_links)
 * - Merchant share (from transaction_agreement_links)
 * - Sales tax separated
 */
export async function getPartnerDashboardMetrics(
  partnerId: string,
  merchantId: string,
  startDate: Date,
  endDate: Date
): Promise<PartnerDashboardMetrics> {
  // Verify merchant is linked to partner
  const linkCheck = await db.query(
    `SELECT id FROM merchant_partner_links
     WHERE merchant_id = $1 AND partner_id = $2 AND is_active = true`,
    [merchantId, partnerId]
  );

  if (linkCheck.rows.length === 0) {
    throw new Error('Merchant is not linked to partner');
  }

  // Get transactions for this merchant-partner relationship
  // Only transactions with agreements linking to this partner
  const metricsResult = await db.query(
    `SELECT 
       COALESCE(SUM(t.subtotal_cents), 0) as total_revenue_cents,
       COALESCE(SUM(t.sales_tax_cents), 0) as sales_tax_cents,
       COALESCE(SUM(tal.partner_share_cents), 0) as partner_share_cents,
       COALESCE(SUM(tal.merchant_share_cents), 0) as merchant_share_cents,
       t.currency
     FROM transactions t
     INNER JOIN transaction_agreement_links tal ON tal.transaction_id = t.id
     INNER JOIN agreements a ON a.id = tal.agreement_id
     WHERE t.merchant_id = $1
       AND a.partner_id = $2
       AND t.status = 'COMPLETED'
       AND t.transaction_type = 'PAYMENT'
       AND t.transaction_date >= $3
       AND t.transaction_date <= $4
     GROUP BY t.currency
     ORDER BY total_revenue_cents DESC
     LIMIT 1`,
    [merchantId, partnerId, startDate, endDate]
  );

  if (metricsResult.rows.length === 0) {
    return {
      total_revenue_cents: 0,
      partner_share_cents: 0,
      merchant_share_cents: 0,
      sales_tax_cents: 0,
      currency: 'USD',
      period_start: startDate,
      period_end: endDate,
    };
  }

  const row = metricsResult.rows[0];

  return {
    total_revenue_cents: parseInt(row.total_revenue_cents || '0'),
    partner_share_cents: parseInt(row.partner_share_cents || '0'),
    merchant_share_cents: parseInt(row.merchant_share_cents || '0'),
    sales_tax_cents: parseInt(row.sales_tax_cents || '0'),
    currency: row.currency || 'USD',
    period_start: startDate,
    period_end: endDate,
  };
}

/**
 * Get partner dashboard metrics across all linked merchants
 */
export async function getPartnerDashboardMetricsAll(
  partnerId: string,
  startDate: Date,
  endDate: Date
): Promise<PartnerDashboardMetrics> {
  // Get metrics across all linked merchants
  const metricsResult = await db.query(
    `SELECT 
       COALESCE(SUM(t.subtotal_cents), 0) as total_revenue_cents,
       COALESCE(SUM(t.sales_tax_cents), 0) as sales_tax_cents,
       COALESCE(SUM(tal.partner_share_cents), 0) as partner_share_cents,
       COALESCE(SUM(tal.merchant_share_cents), 0) as merchant_share_cents,
       t.currency
     FROM transactions t
     INNER JOIN transaction_agreement_links tal ON tal.transaction_id = t.id
     INNER JOIN agreements a ON a.id = tal.agreement_id
     INNER JOIN merchant_partner_links mpl ON mpl.merchant_id = t.merchant_id AND mpl.partner_id = a.partner_id
     WHERE a.partner_id = $1
       AND mpl.is_active = true
       AND t.status = 'COMPLETED'
       AND t.transaction_type = 'PAYMENT'
       AND t.transaction_date >= $2
       AND t.transaction_date <= $3
     GROUP BY t.currency
     ORDER BY total_revenue_cents DESC
     LIMIT 1`,
    [partnerId, startDate, endDate]
  );

  if (metricsResult.rows.length === 0) {
    return {
      total_revenue_cents: 0,
      partner_share_cents: 0,
      merchant_share_cents: 0,
      sales_tax_cents: 0,
      currency: 'USD',
      period_start: startDate,
      period_end: endDate,
    };
  }

  const row = metricsResult.rows[0];

  return {
    total_revenue_cents: parseInt(row.total_revenue_cents || '0'),
    partner_share_cents: parseInt(row.partner_share_cents || '0'),
    merchant_share_cents: parseInt(row.merchant_share_cents || '0'),
    sales_tax_cents: parseInt(row.sales_tax_cents || '0'),
    currency: row.currency || 'USD',
    period_start: startDate,
    period_end: endDate,
  };
}

