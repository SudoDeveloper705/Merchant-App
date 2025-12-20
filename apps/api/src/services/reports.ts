import { db } from '../config/database';

/**
 * Monthly partner settlement report
 */
export interface PartnerSettlementReport {
  merchant_id: string;
  merchant_name: string;
  partner_id: string;
  partner_name: string;
  agreement_id: string;
  agreement_name: string;
  year: number;
  month: number;
  total_revenue_cents: number;
  total_transactions: number;
  partner_share_cents: number;
  merchant_share_cents: number;
  minimum_guarantee_cents: number | null;
  adjustment_cents: number;
  final_partner_share_cents: number;
  total_payouts_cents: number;
  outstanding_balance_cents: number;
  currency: string;
}

/**
 * Get monthly partner settlement report
 */
export async function getPartnerSettlementReport(
  merchantId: string,
  partnerId: string,
  year: number,
  month: number
): Promise<PartnerSettlementReport[]> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Get all agreements between merchant and partner
  const agreementsResult = await db.query(
    `SELECT 
       a.id as agreement_id,
       a.name as agreement_name,
       a.minimum_guarantee_cents,
       a.currency,
       m.name as merchant_name,
       p.name as partner_name
     FROM agreements a
     INNER JOIN merchants m ON m.id = a.merchant_id
     INNER JOIN partners p ON p.id = a.partner_id
     WHERE a.merchant_id = $1
       AND a.partner_id = $2
       AND a.is_active = true
       AND a.start_date <= $3
       AND (a.end_date IS NULL OR a.end_date >= $3)`,
    [merchantId, partnerId, startDate]
  );

  const reports: PartnerSettlementReport[] = [];

  for (const agreement of agreementsResult.rows) {
    // Get transaction summary for this agreement
    const transactionsResult = await db.query(
      `SELECT 
         COUNT(*) as total_transactions,
         COALESCE(SUM(t.subtotal_cents), 0) as total_revenue_cents,
         COALESCE(SUM(tal.partner_share_cents), 0) as partner_share_cents,
         COALESCE(SUM(tal.merchant_share_cents), 0) as merchant_share_cents
       FROM transactions t
       INNER JOIN transaction_agreement_links tal ON tal.transaction_id = t.id
       WHERE t.merchant_id = $1
         AND tal.agreement_id = $2
         AND t.status = 'COMPLETED'
         AND t.transaction_type = 'PAYMENT'
         AND t.transaction_date >= $3
         AND t.transaction_date <= $4`,
      [merchantId, agreement.agreement_id, startDate, endDate]
    );

    const txSummary = transactionsResult.rows[0];
    const totalTransactions = parseInt(txSummary?.total_transactions || '0');
    const totalRevenueCents = parseInt(txSummary?.total_revenue_cents || '0');
    let partnerShareCents = parseInt(txSummary?.partner_share_cents || '0');
    const merchantShareCents = parseInt(txSummary?.merchant_share_cents || '0');

    // Apply minimum guarantee if applicable
    const minimumGuaranteeCents = agreement.minimum_guarantee_cents
      ? parseInt(agreement.minimum_guarantee_cents)
      : null;
    let adjustmentCents = 0;
    let finalPartnerShareCents = partnerShareCents;

    if (
      minimumGuaranteeCents &&
      minimumGuaranteeCents > 0 &&
      partnerShareCents < minimumGuaranteeCents
    ) {
      adjustmentCents = minimumGuaranteeCents - partnerShareCents;
      finalPartnerShareCents = minimumGuaranteeCents;
    }

    // Get payouts for this agreement
    const payoutsResult = await db.query(
      `SELECT COALESCE(SUM(amount_cents), 0) as total_payouts_cents
       FROM payouts
       WHERE merchant_id = $1
         AND partner_id = $2
         AND status = 'COMPLETED'
         AND scheduled_date >= $3
         AND scheduled_date <= $4
         AND (metadata->>'agreement_id' = $5 OR metadata->>'agreement_id' IS NULL)`,
      [merchantId, partnerId, startDate, endDate, agreement.agreement_id]
    );

    const totalPayoutsCents = parseInt(payoutsResult.rows[0]?.total_payouts_cents || '0');
    const outstandingBalanceCents = finalPartnerShareCents - totalPayoutsCents;

    reports.push({
      merchant_id: merchantId,
      merchant_name: agreement.merchant_name,
      partner_id: partnerId,
      partner_name: agreement.partner_name,
      agreement_id: agreement.agreement_id,
      agreement_name: agreement.agreement_name,
      year,
      month,
      total_revenue_cents: totalRevenueCents,
      total_transactions: totalTransactions,
      partner_share_cents: partnerShareCents,
      merchant_share_cents: merchantShareCents,
      minimum_guarantee_cents: minimumGuaranteeCents,
      adjustment_cents: adjustmentCents,
      final_partner_share_cents: finalPartnerShareCents,
      total_payouts_cents: totalPayoutsCents,
      outstanding_balance_cents: outstandingBalanceCents,
      currency: agreement.currency || 'USD',
    });
  }

  return reports;
}

/**
 * Get transactions for export (with RBAC)
 */
export async function getTransactionsForExport(
  merchantId: string,
  partnerId: string | null,
  startDate: Date,
  endDate: Date,
  canViewClientNames: boolean = true
): Promise<any[]> {
  let query = `
    SELECT 
      t.id,
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
      t.transaction_date,
      t.created_at,
      ${canViewClientNames ? 'c.name as client_name,' : ''}
      tal.partner_share_cents,
      tal.merchant_share_cents,
      a.name as agreement_name,
      p.name as partner_name
    FROM transactions t
    ${canViewClientNames ? 'LEFT JOIN clients c ON c.id = t.client_id' : ''}
    LEFT JOIN transaction_agreement_links tal ON tal.transaction_id = t.id
    LEFT JOIN agreements a ON a.id = tal.agreement_id
    LEFT JOIN partners p ON p.id = a.partner_id
    WHERE t.merchant_id = $1
      AND t.transaction_date >= $2
      AND t.transaction_date <= $3
  `;

  const params: any[] = [merchantId, startDate, endDate];

  // If partnerId is provided, filter by partner
  if (partnerId) {
    query += ` AND a.partner_id = $4`;
    params.push(partnerId);
  }

  query += ` ORDER BY t.transaction_date DESC, t.created_at DESC`;

  const result = await db.query(query, params);
  
  // Redact client names if not allowed
  return result.rows.map((row) => {
    const transaction: any = { ...row };
    if (!canViewClientNames) {
      transaction.client_name = null; // Redacted
    }
    return transaction;
  });
}

/**
 * Get payouts for export (with RBAC)
 */
export async function getPayoutsForExport(
  merchantId: string,
  partnerId: string | null,
  startDate: Date,
  endDate: Date
): Promise<any[]> {
  let query = `
    SELECT 
      p.id,
      p.amount_cents,
      p.currency,
      p.status,
      p.payout_method,
      p.payout_reference,
      p.description,
      p.scheduled_date,
      p.processed_at,
      p.created_at,
      p.updated_at,
      pt.name as partner_name,
      m.name as merchant_name,
      a.name as agreement_name
    FROM payouts p
    LEFT JOIN partners pt ON pt.id = p.partner_id
    LEFT JOIN merchants m ON m.id = p.merchant_id
    LEFT JOIN agreements a ON a.id::text = p.metadata->>'agreement_id'
    WHERE p.merchant_id = $1
      AND p.scheduled_date >= $2
      AND p.scheduled_date <= $3
  `;

  const params: any[] = [merchantId, startDate, endDate];

  // If partnerId is provided, filter by partner
  if (partnerId) {
    query += ` AND p.partner_id = $4`;
    params.push(partnerId);
  }

  query += ` ORDER BY p.scheduled_date DESC, p.created_at DESC`;

  const result = await db.query(query, params);
  return result.rows;
}

