import { Router, Request, Response } from 'express';
import { requireAuth, requireMerchant } from '../middleware/auth.middleware';
import { db } from '../config/database';

const router = Router();

/**
 * GET /merchant/me
 * 
 * Returns the authenticated merchant user's information
 * 
 * This endpoint is used by the frontend to:
 * - Keep user logged in (verify token validity)
 * - Protect routes (check authentication status)
 * - Show dashboard (display user and merchant info)
 * 
 * Requirements:
 * - Must be authenticated (requireAuth)
 * - Must be a merchant user (requireMerchant)
 * 
 * Returns:
 * - user id
 * - name (first_name + last_name)
 * - email
 * - role
 * - merchant id
 * - merchant name (business_name)
 * 
 * Usage:
 * GET /api/merchant/me
 * Headers: Authorization: Bearer <access_token>
 * 
 * Response:
 * {
 *   "user": {
 *     "id": "user-uuid",
 *     "name": "John Doe",
 *     "email": "john@acme.com",
 *     "role": "merchant_owner",
 *     "merchantId": "merchant-uuid"
 *   },
 *   "merchant": {
 *     "id": "merchant-uuid",
 *     "name": "Acme Corporation",
 *     "state": "CA",
 *     "zip": "90210"
 *   }
 * }
 */
router.get('/me', requireAuth, requireMerchant, async (req: Request, res: Response) => {
  try {
    // req.user is guaranteed to be set by requireAuth middleware
    // req.user.userType is guaranteed to be 'merchant' by requireMerchant middleware
    const userId = req.user!.userId;
    const merchantId = req.user!.merchantId!;

    // SQL Query: Join users and merchants tables to get all required information
    const query = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        u.merchant_id,
        m.id as merchant_id_full,
        m.business_name as merchant_name,
        m.state,
        m.postal_code,
        m.is_active as merchant_is_active,
        u.is_active as user_is_active
      FROM users u
      INNER JOIN merchants m ON u.merchant_id = m.id
      WHERE u.id = $1 
        AND u.merchant_id = $2
        AND u.is_active = true
        AND m.is_active = true
    `;

    const result = await db.query(query, [userId, merchantId]);

    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found or inactive',
      });
    }

    const user = result.rows[0];

    // Format response with required fields
    const response = {
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        role: user.role,
        merchantId: user.merchant_id,
      },
      merchant: {
        id: user.merchant_id_full,
        name: user.merchant_name,
        state: user.state || null,
        zip: user.postal_code || null,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error('Get merchant user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user information',
    });
  }
});

export default router;

