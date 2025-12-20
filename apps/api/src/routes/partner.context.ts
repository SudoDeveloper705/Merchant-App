import { Router, Request, Response } from 'express';
import { requireAuth, requirePartner } from '../middleware/auth.middleware';
import { db } from '../config/database';

const router = Router();

/**
 * GET /partner/context?merchantId=UUID
 * 
 * Returns a context object for a specific merchant that the partner is linked to.
 * This is used by the frontend to switch merchant context.
 * 
 * Requirements:
 * - Must be authenticated (requireAuth)
 * - Must be a partner user (requirePartner)
 * - merchantId must be provided as query parameter
 * - Partner must be linked to the merchant (403 if not linked)
 * 
 * Returns:
 * Context object with:
 * - merchantId: UUID
 * - merchantName: string
 * - partnerId: UUID
 * - partnerUserRole: string (role of the partner user)
 * - canViewClientNames: boolean
 * 
 * Usage:
 * GET /api/partner/context?merchantId=<uuid>
 * Headers: Authorization: Bearer <access_token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "merchantId": "uuid",
 *     "merchantName": "Acme Corp",
 *     "partnerId": "uuid",
 *     "partnerUserRole": "partner_owner",
 *     "canViewClientNames": true
 *   }
 * }
 * 
 * Error Responses:
 * - 400: merchantId missing
 * - 403: Merchant not linked to partner
 * - 404: Merchant not found
 */
router.get('/context', requireAuth, requirePartner, async (req: Request, res: Response) => {
  try {
    // req.user is guaranteed to be set by requireAuth middleware
    // req.user.userType is guaranteed to be 'partner' by requirePartner middleware
    const partnerId = req.user!.partnerId!;
    const userId = req.user!.userId;
    const merchantId = req.query.merchantId as string;

    // Validate merchantId is provided
    if (!merchantId) {
      return res.status(400).json({
        success: false,
        error: 'merchantId query parameter is required',
      });
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(merchantId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid merchantId format',
      });
    }

    // SQL Query: Verify partner is linked to merchant and get context
    // This query validates the linkage and returns merchant + partner user info
    const query = `
      SELECT 
        m.id as merchant_id,
        m.business_name as merchant_name,
        m.is_active as merchant_is_active,
        mpl.is_active as link_is_active,
        mpl.can_view_client_names,
        pu.role as partner_user_role,
        pu.is_active as user_is_active
      FROM merchant_partner_links mpl
      INNER JOIN merchants m ON mpl.merchant_id = m.id
      INNER JOIN partner_users pu ON pu.partner_id = mpl.partner_id AND pu.id = $1
      WHERE mpl.merchant_id = $2
        AND mpl.partner_id = $3
        AND mpl.is_active = true
        AND m.is_active = true
        AND pu.is_active = true
    `;

    const result = await db.query(query, [userId, merchantId, partnerId]);

    // Check if merchant is linked to partner
    if (result.rows.length === 0) {
      // Check if merchant exists at all
      const merchantCheck = await db.query(
        'SELECT id FROM merchants WHERE id = $1',
        [merchantId]
      );

      if (merchantCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Merchant not found',
        });
      }

      // Merchant exists but not linked - return 403
      return res.status(403).json({
        success: false,
        error: 'Access denied: Merchant not linked to your partner account',
      });
    }

    const row = result.rows[0];

    // Format response with required fields
    const context = {
      merchantId: row.merchant_id,
      merchantName: row.merchant_name,
      partnerId: partnerId,
      partnerUserRole: row.partner_user_role,
      canViewClientNames: row.can_view_client_names === true,
    };

    res.json({
      success: true,
      data: context,
    });
  } catch (error: any) {
    console.error('Get partner context error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch merchant context',
    });
  }
});

export default router;

