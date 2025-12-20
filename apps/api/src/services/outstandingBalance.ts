import { db } from '../config/database';

/**
 * Outstanding balance calculation result
 */
export interface OutstandingBalanceResult {
  partner_id: string;
  merchant_id: string;
  agreement_id: string | null;
  year: number;
  month: number;
  total_partner_share_cents: number;
  total_payouts_cents: number;
  outstanding_balance_cents: number;
  currency: string;
}

/**
 * Calculate outstanding balance for a partner-merchant relationship
 * Outstanding balance = partner share (month) - payouts (month)
 */
export async function calculateOutstandingBalance(
  merchantId: string,
  partnerId: string,
  year: number,
  month: number,
  agreementId?: string
): Promise<OutstandingBalanceResult> {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Calculate total partner share from transaction_agreement_links
  // Only count COMPLETED transactions
  let shareQuery = `
    SELECT 
      COALESCE(SUM(tal.partner_share_cents), 0) as total_partner_share_cents,
      a.currency
    FROM transaction_agreement_links tal
    INNER JOIN transactions t ON t.id = tal.transaction_id
    INNER JOIN agreements a ON a.id = tal.agreement_id
    WHERE t.merchant_id = $1
      AND a.partner_id = $2
      AND t.status = 'COMPLETED'
      AND t.transaction_type = 'PAYMENT'
      AND t.transaction_date >= $3
      AND t.transaction_date <= $4
  `;

  const shareParams: any[] = [merchantId, partnerId, startDate, endDate];

  if (agreementId) {
    shareQuery += ' AND tal.agreement_id = $5';
    shareParams.push(agreementId);
  }

  shareQuery += ' GROUP BY a.currency';

  const shareResult = await db.query(shareQuery, shareParams);

  // Calculate total payouts for the month
  // Only count COMPLETED payouts
  let payoutQuery = `
    SELECT 
      COALESCE(SUM(amount_cents), 0) as total_payouts_cents,
      currency
    FROM payouts
    WHERE merchant_id = $1
      AND partner_id = $2
      AND status = 'COMPLETED'
      AND scheduled_date >= $3
      AND scheduled_date <= $4
  `;

  const payoutParams: any[] = [merchantId, partnerId, startDate, endDate];

  if (agreementId) {
    // If agreement_id is provided, filter payouts by agreement (stored in metadata)
    payoutQuery += ' AND (metadata->>\'agreement_id\' = $5 OR metadata->>\'agreement_id\' IS NULL)';
    payoutParams.push(agreementId);
  }

  payoutQuery += ' GROUP BY currency';

  const payoutResult = await db.query(payoutQuery, payoutParams);

  // Get currency (default to USD if not found)
  const currency = shareResult.rows[0]?.currency || payoutResult.rows[0]?.currency || 'USD';

  const totalPartnerShareCents = parseInt(shareResult.rows[0]?.total_partner_share_cents || '0');
  const totalPayoutsCents = parseInt(payoutResult.rows[0]?.total_payouts_cents || '0');
  const outstandingBalanceCents = totalPartnerShareCents - totalPayoutsCents;

  return {
    partner_id: partnerId,
    merchant_id: merchantId,
    agreement_id: agreementId || null,
    year,
    month,
    total_partner_share_cents: totalPartnerShareCents,
    total_payouts_cents: totalPayoutsCents,
    outstanding_balance_cents: outstandingBalanceCents,
    currency,
  };
}

/**
 * Calculate outstanding balance across all agreements for a partner-merchant relationship
 */
export async function calculateTotalOutstandingBalance(
  merchantId: string,
  partnerId: string,
  year: number,
  month: number
): Promise<OutstandingBalanceResult> {
  return calculateOutstandingBalance(merchantId, partnerId, year, month);
}

/**
 * Get outstanding balance history for a partner-merchant relationship
 */
export async function getOutstandingBalanceHistory(
  merchantId: string,
  partnerId: string,
  limit: number = 12
): Promise<OutstandingBalanceResult[]> {
  const history: OutstandingBalanceResult[] = [];
  const now = new Date();

  for (let i = 0; i < limit; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    try {
      const balance = await calculateOutstandingBalance(merchantId, partnerId, year, month);
      history.push(balance);
    } catch (error) {
      console.error(`Error calculating balance for ${year}-${month}:`, error);
      // Continue with other months
    }
  }

  return history.reverse(); // Oldest first
}

/**
 * Get current outstanding balance (current month)
 */
export async function getCurrentOutstandingBalance(
  merchantId: string,
  partnerId: string
): Promise<OutstandingBalanceResult> {
  const now = new Date();
  return calculateOutstandingBalance(merchantId, partnerId, now.getFullYear(), now.getMonth() + 1);
}

