import { Router, Request, Response } from 'express';
import { requireAuth, requirePartner } from '../middleware/auth.middleware';
import { db } from '../config/database';
import { sendInvitationEmail } from '../services/email.service';
import { hashPassword } from '../utils/password';
import crypto from 'crypto';

const router = Router();

/**
 * Require partner owner role
 * Must be used after requireAuth and requirePartner
 */
function requirePartnerOwner(req: Request, res: Response, next: any) {
  if (req.user?.role !== 'partner_owner') {
    return res.status(403).json({
      success: false,
      error: 'Partner owner access required',
    });
  }
  next();
}

/**
 * POST /partner/users/invite
 * 
 * Invite a new partner staff member
 * 
 * Auth: partner_owner only
 * Input: name, email
 * 
 * Creates partner_users row with:
 * - role: partner_staff
 * - password_reset_token: temporary token
 * - password_reset_token_expires_at: 7 days from now
 * - is_active: false (until password is set)
 * 
 * Sends invitation email with password reset link
 */
router.post(
  '/invite',
  requireAuth,
  requirePartner,
  requirePartnerOwner,
  async (req: Request, res: Response) => {
    try {
      const { name, email } = req.body;
      const partnerId = req.user!.partnerId!;
      const inviterUserId = req.user!.userId;
      
      // Get inviter name from database
      let inviterName = 'Partner Owner';
      try {
        const inviterResult = await db.query(
          'SELECT first_name, last_name FROM partner_users WHERE id = $1',
          [inviterUserId]
        );
        if (inviterResult.rows.length > 0) {
          const inviter = inviterResult.rows[0];
          inviterName = `${inviter.first_name} ${inviter.last_name}`.trim() || 'Partner Owner';
        }
      } catch (err) {
        console.warn('Failed to get inviter name:', err);
      }

      // Validation
      if (!name || !email) {
        return res.status(400).json({
          success: false,
          error: 'Name and email are required',
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
        });
      }

      // Parse name into first_name and last_name
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (!firstName) {
        return res.status(400).json({
          success: false,
          error: 'Name must include at least a first name',
        });
      }

      // Check if email already exists for this partner
      const existingUser = await db.query(
        'SELECT id FROM partner_users WHERE partner_id = $1 AND email = $2',
        [partnerId, email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'Email already exists for this partner',
        });
      }

      // Generate password reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenExpiresAt = new Date();
      tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7); // 7 days from now

      // Create partner user with temporary token
      // Use a placeholder password hash - will be replaced when password is set
      const placeholderHash = await hashPassword(crypto.randomBytes(16).toString('hex'));
      
      const result = await db.query(
        `INSERT INTO partner_users (
          partner_id,
          email,
          password_hash,
          first_name,
          last_name,
          role,
          is_active,
          password_reset_token,
          password_reset_token_expires_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, false, $7, $8)
        RETURNING id, email, first_name, last_name, role, created_at`,
        [
          partnerId,
          email,
          placeholderHash, // Placeholder - will be replaced when password is set
          firstName,
          lastName,
          'partner_staff',
          resetToken,
          tokenExpiresAt,
        ]
      );

      const user = result.rows[0];

      // Send invitation email
      try {
        await sendInvitationEmail(email, name, resetToken, inviterName);
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Continue even if email fails - user can still use the token
      }

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`.trim(),
          role: user.role,
          invitedAt: user.created_at,
        },
      });
    } catch (error: any) {
      console.error('Invite partner staff error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to invite staff member',
      });
    }
  }
);

/**
 * POST /partner/users/set-password
 * 
 * Set password for invited staff member
 * 
 * Input: token, newPassword
 * 
 * Validates token and expiration
 * Sets password hash
 * Activates user (is_active = true)
 * Clears password reset token
 */
router.post('/set-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Validation
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token and new password are required',
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    // Find user by token
    const userResult = await db.query(
      `SELECT id, email, password_reset_token_expires_at, is_active
       FROM partner_users
       WHERE password_reset_token = $1`,
      [token]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }

    const user = userResult.rows[0];

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(user.password_reset_token_expires_at);
    if (now > expiresAt) {
      return res.status(400).json({
        success: false,
        error: 'Token has expired. Please request a new invitation.',
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user: set password, activate, clear token
    await db.query(
      `UPDATE partner_users
       SET password_hash = $1,
           is_active = true,
           password_reset_token = NULL,
           password_reset_token_expires_at = NULL,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    res.json({
      success: true,
      message: 'Password set successfully. You can now login.',
    });
  } catch (error: any) {
    console.error('Set password error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to set password',
    });
  }
});

export default router;

