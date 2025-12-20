import { Router, Request, Response } from 'express';
import { registerMerchant, loginMerchant } from '../services/auth.service';

const router = Router();

/**
 * POST /auth/merchant/register
 * 
 * Register a new merchant and create merchant_owner user
 * 
 * Request body:
 * {
 *   "merchant_name": "Acme Corporation",
 *   "owner_name": "John Doe",
 *   "email": "john@acme.com",
 *   "password": "securepassword123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "uuid",
 *       "email": "john@acme.com",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "role": "merchant_owner",
 *       "merchantId": "uuid"
 *     },
 *     "accessToken": "jwt_token",
 *     "refreshToken": "jwt_refresh_token"
 *   }
 * }
 */
router.post('/merchant/register', async (req: Request, res: Response) => {
  try {
    const { merchant_name, owner_name, email, password } = req.body;

    // Validate required fields
    if (!merchant_name || !owner_name || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields: merchant_name, owner_name, email, password',
      });
    }

    // Register merchant and create owner user
    const result = await registerMerchant({
      merchant_name,
      owner_name,
      email,
      password,
    });

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Merchant registration error:', error);

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
 * POST /auth/merchant/login
 * 
 * Login a merchant user
 * 
 * Request body:
 * {
 *   "email": "john@acme.com",
 *   "password": "securepassword123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "user": {
 *       "id": "uuid",
 *       "email": "john@acme.com",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "role": "merchant_owner",
 *       "merchantId": "uuid"
 *     },
 *     "accessToken": "jwt_token",
 *     "refreshToken": "jwt_refresh_token"
 *   }
 * }
 */
router.post('/merchant/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Login merchant user
    const result = await loginMerchant({
      email,
      password,
    });

    res.json(result);
  } catch (error: any) {
    console.error('Merchant login error:', error);

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

