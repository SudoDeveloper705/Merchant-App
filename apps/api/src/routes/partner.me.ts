import { Router, Request, Response } from 'express';
import { requireAuth, requirePartner } from '../middleware/auth.middleware';
import { db } from '../config/database';

const router = Router();

/**
 * GET /partner/me
 * 
 * Returns the authenticated partner user's information
 * 
 * This endpoint is used by the frontend to:
 * - Keep user logged in (verify token validity)
 * - Protect routes (check authentication status)
 * - Show dashboard (display user and partner info)
 * 
 * Requirements:
 * - Must be authenticated (requireAuth)
 * - Must be a partner user (requirePartner)
 * 
 * Returns:
 * - user id
 * - name (first_name + last_name)
 * - email
 * - role
 * - partner id
 * - partner name (business_name)
 * 
 * Usage:
 * GET /api/partner/me
 * Headers: Authorization: Bearer <access_token>
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "id": "user-uuid",
 *     "name": "John Doe",
 *     "email": "john@acme.com",
 *     "role": "partner_owner",
 *     "partnerId": "partner-uuid",
 *     "partnerName": "Acme Partner"
 *   }
 * }
 */
router.get('/me', requireAuth, requirePartner, async (req: Request, res: Response) => {
  try {
    // req.user is guaranteed to be set by requireAuth middleware
    // req.user.userType is guaranteed to be 'partner' by requirePartner middleware
    const userId = req.user!.userId;
    const partnerId = req.user!.partnerId!;

    // SQL Query: Join partner_users and partners tables to get all required information
    const query = `
      SELECT 
        pu.id,
        pu.first_name,
        pu.last_name,
        pu.email,
        pu.role,
        pu.partner_id,
        p.business_name as partner_name,
        p.is_active as partner_is_active,
        pu.is_active as user_is_active,
        pu.last_login_at,
        pu.created_at
      FROM partner_users pu
      INNER JOIN partners p ON pu.partner_id = p.id
      WHERE pu.id = $1 
        AND pu.partner_id = $2
        AND pu.is_active = true
        AND p.is_active = true
    `;

    const result = await db.query(query, [userId, partnerId]);

    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found or inactive',
      });
    }

    const user = result.rows[0];

    // Format response with required fields
    const response = {
      success: true,
      data: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        role: user.role,
        partnerId: user.partner_id,
        partnerName: user.partner_name,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error('Get partner user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user information',
    });
  }
});

export default router;

