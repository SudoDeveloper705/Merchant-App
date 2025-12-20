import { db } from '../config/database';

/**
 * Get canViewClientNames flag for a partner-merchant link
 * 
 * @param merchantId - UUID of the merchant
 * @param partnerId - UUID of the partner
 * @returns Promise<boolean> - true if partner can view client names, false otherwise
 */
export async function getCanViewClientNames(
  merchantId: string,
  partnerId: string
): Promise<boolean> {
  try {
    const result = await db.query(
      `SELECT can_view_client_names 
       FROM merchant_partner_links 
       WHERE merchant_id = $1 
         AND partner_id = $2 
         AND is_active = true`,
      [merchantId, partnerId]
    );

    if (result.rows.length === 0) {
      // If link doesn't exist, default to false (most restrictive)
      return false;
    }

    return result.rows[0].can_view_client_names === true;
  } catch (error) {
    console.error('Error getting canViewClientNames:', error);
    // Default to false on error (most restrictive)
    return false;
  }
}

/**
 * Redact client name based on canViewClientNames flag
 * 
 * @param clientName - Original client name
 * @param canViewClientNames - Whether client names can be viewed
 * @returns string | null - Client name if allowed, null otherwise
 */
export function redactClientName(clientName: string | null, canViewClientNames: boolean): string | null {
  if (!clientName) {
    return null;
  }
  
  return canViewClientNames ? clientName : null;
}

