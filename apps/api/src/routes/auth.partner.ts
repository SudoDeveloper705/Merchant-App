import { Router, Request, Response } from 'express';
import { registerPartner, loginPartner } from '../services/auth.service';

const router = Router();

/**
 * POST /auth/partner/register
 * 
 * Register a new partner and create partner_owner user
 * 
 * Request body:
 * {
 *   "partner_name": "Acme Partner",
 *   "owner_name": "John Doe",
 *   "email": "john@acme.com",
 *   "password": "securepassword123",
 *   "country": "US" (optional)
 * }
 * 
 * Response:
 * {
 *   "accessToken": "jwt_token",
 *   "refreshToken": "jwt_refresh_token",
 *   "user": {
 *     "id": "uuid",
 *     "name": "John Doe",
 *     "email": "john@acme.com",
 *     "role": "partner_owner",
 *     "partnerId": "uuid"
 *   },
 *   "partner": {
 *     "id": "uuid",
 *     "name": "Acme Partner"
 *   }
 * }
 */
router.post('/partner/register', async (req: Request, res: Response) => {
  try {
    const { partner_name, owner_name, email, password, country } = req.body;

    // Validate required fields
    if (!partner_name || !owner_name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: partner_name, owner_name, email, password',
      });
    }

    // Register partner and create owner user
    const result = await registerPartner({
      partner_name,
      owner_name,
      email,
      password,
      country,
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Partner registration error:', error);

    // Handle specific error types
    if (error.message.includes('already exists') || error.message.includes('email already exists')) {
      return res.status(409).json({
        error: error.message || 'Email already exists',
      });
    }

    if (
      error.message.includes('Invalid email') ||
      error.message.includes('Password must be') ||
      error.message.includes('Owner name must') ||
      error.message.includes('Missing required fields')
    ) {
      return res.status(400).json({
        error: error.message || 'Invalid input',
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Registration failed',
    });
  }
});

/**
 * POST /auth/partner/login
 * 
 * Login a partner user
 * 
 * Request body:
 * {
 *   "email": "john@acme.com",
 *   "password": "securepassword123"
 * }
 * 
 * Response:
 * {
 *   "accessToken": "jwt_token",
 *   "refreshToken": "jwt_refresh_token",
 *   "user": {
 *     "id": "uuid",
 *     "name": "John Doe",
 *     "email": "john@acme.com",
 *     "role": "partner_owner",
 *     "partnerId": "uuid"
 *   },
 *   "partner": {
 *     "id": "uuid",
 *     "name": "Acme Partner"
 *   }
 * }
 */
router.post('/partner/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Login partner user
    const result = await loginPartner({
      email,
      password,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Partner login error:', error);

    // Handle authentication errors
    if (
      error.message.includes('Invalid credentials') ||
      error.message.includes('inactive') ||
      error.message.includes('not found')
    ) {
      return res.status(401).json({
        error: error.message || 'Invalid credentials',
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Login failed',
    });
  }
});

export default router;

