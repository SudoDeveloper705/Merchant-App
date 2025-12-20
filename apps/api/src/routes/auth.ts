import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateTokens, verifyRefreshToken, generateAccessToken, verifyAccessToken } from '../utils/jwt';
import { JWTPayload } from '@merchant-app/shared';

const router = Router();

/**
 * Register merchant user
 */
router.post('/register/merchant', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, merchantId, role } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !merchantId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }

    // Check if merchant exists
    const merchantCheck = await db.query(
      'SELECT id FROM merchants WHERE id = $1 AND is_active = true',
      [merchantId]
    );

    if (merchantCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Merchant not found',
      });
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE merchant_id = $1 AND email = $2',
      [merchantId, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'User already exists',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await db.query(
      `INSERT INTO users (merchant_id, email, password_hash, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, email, first_name, last_name, role, merchant_id, created_at`,
      [merchantId, email, passwordHash, firstName, lastName, role || 'merchant_accountant']
    );

    const user = result.rows[0];

    // Generate tokens
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userType: 'merchant',
      userId: user.id,
      role: user.role,
      merchantId: user.merchant_id,
    };

    const tokens = generateTokens(payload);

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          merchantId: user.merchant_id,
        },
        ...tokens,
      },
    });
  } catch (error: any) {
    console.error('Register merchant user error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed',
    });
  }
});

/**
 * Register partner user
 */
router.post('/register/partner', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, partnerId, role } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !partnerId) {
      return res.status(400).json({
        error: 'Missing required fields: email, password, firstName, lastName, partnerId',
      });
    }

    // Check if partner exists
    const partnerCheck = await db.query(
      'SELECT id FROM partners WHERE id = $1 AND is_active = true',
      [partnerId]
    );

    if (partnerCheck.rows.length === 0) {
      return res.status(404).json({
        error: 'Partner not found',
      });
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM partner_users WHERE partner_id = $1 AND email = $2',
      [partnerId, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        error: 'Email already exists',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await db.query(
      `INSERT INTO partner_users (partner_id, email, password_hash, first_name, last_name, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, email, first_name, last_name, role, partner_id, created_at`,
      [partnerId, email, passwordHash, firstName, lastName, role || 'partner_staff']
    );

    const user = result.rows[0];

    // Generate tokens
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userType: 'partner',
      userId: user.id,
      role: user.role,
      partnerId: user.partner_id,
    };

    const tokens = generateTokens(payload);

    res.status(201).json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        role: user.role,
        partnerId: user.partner_id,
      },
    });
  } catch (error: any) {
    console.error('Register partner user error:', error);
    
    // Handle specific errors
    if (error.message && error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Email already exists',
      });
    }
    
    res.status(500).json({
      error: 'Registration failed',
    });
  }
});

/**
 * Login merchant user
 */
router.post('/login/merchant', async (req: Request, res: Response) => {
  try {
    const { email, password, merchantId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required',
      });
    }

    // Find user
    let query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
    const params: any[] = [email];

    if (merchantId) {
      query += ' AND merchant_id = $2';
      params.push(merchantId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Update last login
    await db.query(
      'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userType: 'merchant',
      userId: user.id,
      role: user.role,
      merchantId: user.merchant_id,
    };

    const tokens = generateTokens(payload);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          merchantId: user.merchant_id,
        },
        ...tokens,
      },
    });
  } catch (error: any) {
    console.error('Login merchant user error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
    });
  }
});

/**
 * Login partner user
 */
router.post('/login/partner', async (req: Request, res: Response) => {
  try {
    const { email, password, partnerId } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Find user
    let query = 'SELECT * FROM partner_users WHERE email = $1 AND is_active = true';
    const params: any[] = [email];

    if (partnerId) {
      query += ' AND partner_id = $2';
      params.push(partnerId);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
      });
    }

    // Update last login
    await db.query(
      'UPDATE partner_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate tokens
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userType: 'partner',
      userId: user.id,
      role: user.role,
      partnerId: user.partner_id,
    };

    const tokens = generateTokens(payload);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        role: user.role,
        partnerId: user.partner_id,
      },
    });
  } catch (error: any) {
    console.error('Login partner user error:', error);
    res.status(500).json({
      error: 'Login failed',
    });
  }
});

/**
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token required',
      });
    }

    try {
      const payload = verifyRefreshToken(refreshToken);

      // Verify user still exists and is active
      let user;
      if (payload.userType === 'merchant') {
        const result = await db.query(
          'SELECT id, merchant_id, role FROM users WHERE id = $1 AND is_active = true',
          [payload.userId]
        );
        if (result.rows.length === 0) {
          return res.status(401).json({
            success: false,
            error: 'User not found or inactive',
          });
        }
        user = result.rows[0];
      } else {
        const result = await db.query(
          'SELECT id, partner_id, role FROM partner_users WHERE id = $1 AND is_active = true',
          [payload.userId]
        );
        if (result.rows.length === 0) {
          return res.status(401).json({
            success: false,
            error: 'User not found or inactive',
          });
        }
        user = result.rows[0];
      }

      // Generate new access token
      const newPayload: Omit<JWTPayload, 'iat' | 'exp'> = {
        userType: payload.userType,
        userId: payload.userId,
        role: user.role,
        merchantId: user.merchant_id || payload.merchantId,
        partnerId: user.partner_id || payload.partnerId,
      };

      const accessToken = generateAccessToken(newPayload);

      res.json({
        success: true,
        data: {
          accessToken,
        },
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        error: error.message || 'Invalid refresh token',
      });
    }
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Token refresh failed',
    });
  }
});

/**
 * Get current user info
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
      });
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    let user;
    if (payload.userType === 'merchant') {
      const result = await db.query(
        `SELECT id, email, first_name, last_name, role, merchant_id, created_at, last_login_at
         FROM users WHERE id = $1 AND is_active = true`,
        [payload.userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }
      user = result.rows[0];
    } else {
      const result = await db.query(
        `SELECT id, email, first_name, last_name, role, partner_id, created_at, last_login_at
         FROM partner_users WHERE id = $1 AND is_active = true`,
        [payload.userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }
      user = result.rows[0];
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        userType: payload.userType,
        merchantId: user.merchant_id,
        partnerId: user.partner_id,
        createdAt: user.created_at,
        lastLoginAt: user.last_login_at,
      },
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(401).json({
      success: false,
      error: error.message || 'Invalid token',
    });
  }
});

export default router;

