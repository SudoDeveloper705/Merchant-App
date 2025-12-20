import { db } from '../config/database';
import { getMonthlyRevenueSummary } from './revenueSplit';

/**
 * Monthly settlement result
 */
export interface SettlementResult {
  agreement_id: string;
  merchant_id: string;
  partner_id: string;
  year: number;
  month: number;
  calculated_partner_share_cents: number;
  minimum_guarantee_cents: number | null;
  final_partner_share_cents: number;
  adjustment_cents: number;
  transaction_count: number;
}

/**
 * Process monthly settlement for an agreement
 * 
 * Applies minimum guarantee if applicable:
 * - If monthly partner share < minimum guarantee, adjust to minimum guarantee
 * - Adjustment is added to partner share, subtracted from merchant share
 */
export async function processMonthlySettlement(
  agreementId: string,
  year: number,
  month: number
): Promise<SettlementResult> {
  // Get agreement details
  const agreementResult = await db.query(
    `SELECT id, merchant_id, partner_id, minimum_guarantee_cents, agreement_type, currency
     FROM agreements
     WHERE id = $1 AND is_active = true`,
    [agreementId]
  );

  if (agreementResult.rows.length === 0) {
    throw new Error('Agreement not found or inactive');
  }

  const agreement = agreementResult.rows[0];

  // Get monthly revenue summary
  const summary = await getMonthlyRevenueSummary(agreementId, year, month);

  let finalPartnerShareCents = summary.total_partner_share_cents;
  let adjustmentCents = 0;

  // Apply minimum guarantee if applicable
  if (
    agreement.agreement_type === 'MINIMUM_GUARANTEE' ||
    agreement.agreement_type === 'HYBRID'
  ) {
    if (summary.minimum_guarantee_cents && summary.minimum_guarantee_cents > 0) {
      if (summary.total_partner_share_cents < summary.minimum_guarantee_cents) {
        // Partner share is below minimum guarantee - apply adjustment
        adjustmentCents = summary.minimum_guarantee_cents - summary.total_partner_share_cents;
        finalPartnerShareCents = summary.minimum_guarantee_cents;

        // Create adjustment transactions in transaction_agreement_links
        // We need to find all transactions for this month and adjust them proportionally
        // OR create a single adjustment entry
        // For MVP, we'll create a summary adjustment entry

        // Get all transaction links for this month
        const transactionLinksResult = await db.query(
          `SELECT tal.id, tal.transaction_id, tal.partner_share_cents, tal.merchant_share_cents
           FROM transaction_agreement_links tal
           INNER JOIN transactions t ON t.id = tal.transaction_id
           WHERE tal.agreement_id = $1
             AND t.status = 'COMPLETED'
             AND t.transaction_type = 'PAYMENT'
             AND t.transaction_date >= $2
             AND t.transaction_date <= $3
           ORDER BY t.transaction_date`,
          [
            agreementId,
            new Date(year, month - 1, 1),
            new Date(year, month, 0, 23, 59, 59),
          ]
        );

        if (transactionLinksResult.rows.length > 0) {
          // Distribute adjustment proportionally across transactions
          const totalShare = summary.total_partner_share_cents;
          
          for (const link of transactionLinksResult.rows) {
            if (totalShare > 0) {
              const proportion = link.partner_share_cents / totalShare;
              const linkAdjustment = Math.round(adjustmentCents * proportion);
              
              // Update the link with adjusted amounts
              await db.query(
                `UPDATE transaction_agreement_links
                 SET partner_share_cents = partner_share_cents + $1,
                     merchant_share_cents = merchant_share_cents - $1,
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2`,
                [linkAdjustment, link.id]
              );
            }
          }
        }
      }
    }
  }

  return {
    agreement_id: agreement.id,
    merchant_id: agreement.merchant_id,
    partner_id: agreement.partner_id,
    year,
    month,
    calculated_partner_share_cents: summary.total_partner_share_cents,
    minimum_guarantee_cents: summary.minimum_guarantee_cents,
    final_partner_share_cents: finalPartnerShareCents,
    adjustment_cents: adjustmentCents,
    transaction_count: summary.transaction_count,
  };
}

/**
 * Process monthly settlement for all active agreements
 */
export async function processAllMonthlySettlements(
  year: number,
  month: number
): Promise<SettlementResult[]> {
  // Get all active agreements
  const agreementsResult = await db.query(
    `SELECT id FROM agreements
     WHERE is_active = true
       AND (agreement_type = 'MINIMUM_GUARANTEE' OR agreement_type = 'HYBRID')
       AND start_date <= $1
       AND (end_date IS NULL OR end_date >= $1)`,
    [new Date(year, month - 1, 1)]
  );

  const results: SettlementResult[] = [];

  for (const agreement of agreementsResult.rows) {
    try {
      const result = await processMonthlySettlement(agreement.id, year, month);
      results.push(result);
    } catch (error: any) {
      console.error(`Error processing settlement for agreement ${agreement.id}:`, error);
      // Continue with other agreements
    }
  }

  return results;
}

/**
 * Get settlement history for an agreement
 */
export async function getSettlementHistory(
  agreementId: string,
  limit: number = 12
): Promise<Array<{
  year: number;
  month: number;
  calculated_partner_share_cents: number;
  minimum_guarantee_cents: number | null;
  final_partner_share_cents: number;
  adjustment_cents: number;
  transaction_count: number;
}>> {
  // This would typically be stored in a settlements table
  // For MVP, we'll calculate on-the-fly from transaction_agreement_links
  // In production, you'd want to store settlement results

  const history: any[] = [];
  const now = new Date();
  
  for (let i = 0; i < limit; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    try {
      const summary = await getMonthlyRevenueSummary(agreementId, year, month);
      
      // Check if minimum guarantee was applied (simplified - in production, check settlement records)
      const agreementResult = await db.query(
        `SELECT minimum_guarantee_cents, agreement_type
         FROM agreements
         WHERE id = $1`,
        [agreementId]
      );

      if (agreementResult.rows.length > 0) {
        const agreement = agreementResult.rows[0];
        let finalPartnerShare = summary.total_partner_share_cents;
        let adjustment = 0;

        if (
          (agreement.agreement_type === 'MINIMUM_GUARANTEE' || agreement.agreement_type === 'HYBRID') &&
          agreement.minimum_guarantee_cents &&
          summary.total_partner_share_cents < parseInt(agreement.minimum_guarantee_cents)
        ) {
          adjustment = parseInt(agreement.minimum_guarantee_cents) - summary.total_partner_share_cents;
          finalPartnerShare = parseInt(agreement.minimum_guarantee_cents);
        }

        history.push({
          year,
          month,
          calculated_partner_share_cents: summary.total_partner_share_cents,
          minimum_guarantee_cents: agreement.minimum_guarantee_cents
            ? parseInt(agreement.minimum_guarantee_cents)
            : null,
          final_partner_share_cents: finalPartnerShare,
          adjustment_cents: adjustment,
          transaction_count: summary.transaction_count,
        });
      }
    } catch (error) {
      // Skip months with errors
      continue;
    }
  }

  return history.reverse(); // Oldest first
}

