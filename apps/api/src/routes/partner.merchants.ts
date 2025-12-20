import { Router, Request, Response } from 'express';
import { requireAuth, requirePartner } from '../middleware/auth.middleware';
import { db } from '../config/database';

const router = Router();

/**
 * GET /partner/merchants
 * 
 * Returns list of merchants the partner is linked to via merchant_partner_links.
 * 
 * Requirements:
 * - Must be authenticated (requireAuth)
 * - Must be a partner user (requirePartner)
 * 
 * Returns:
 * Array of merchant objects with:
 * - merchantId: UUID
 * - merchantName: string
 * - accessLevel: string (default: 'full' - can be extended later)
 * - canViewClientNames: boolean (default: true - can be extended later)
 * 
 * Usage:
 * GET /api/partner/merchants
 * Headers: Authorization: Bearer <access_token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "merchantId": "uuid",
 *       "merchantName": "Acme Corp",
 *       "accessLevel": "full",
 *       "canViewClientNames": true
 *     }
 *   ]
 * }
 */
router.get('/merchants', requireAuth, requirePartner, async (req: Request, res: Response) => {
  try {
    // req.user is guaranteed to be set by requireAuth middleware
    // req.user.userType is guaranteed to be 'partner' by requirePartner middleware
    const partnerId = req.user!.partnerId!;

    // SQL Query: Get all active merchants linked to this partner
    const query = `
      SELECT 
        m.id as merchant_id,
        m.business_name as merchant_name,
        mpl.is_active as link_is_active,
        mpl.can_view_client_names,
        mpl.created_at as link_created_at
      FROM merchant_partner_links mpl
      INNER JOIN merchants m ON mpl.merchant_id = m.id
      WHERE mpl.partner_id = $1 
        AND mpl.is_active = true
        AND m.is_active = true
      ORDER BY m.business_name ASC
    `;

    const result = await db.query(query, [partnerId]);

    // Format response with required fields
    const merchants = result.rows.map((row) => ({
      merchantId: row.merchant_id,
      merchantName: row.merchant_name,
      // Default values - can be extended when table schema is updated
      accessLevel: 'full', // Options: 'full', 'limited', 'readonly' (to be added to table)
      canViewClientNames: row.can_view_client_names === true,
    }));

    res.json({
      success: true,
      data: merchants,
    });
  } catch (error: any) {
    console.error('Get partner merchants error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch linked merchants',
    });
  }
});

export default router;

