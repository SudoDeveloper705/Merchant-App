# JWT Authentication Middleware

This document describes the JWT authentication middleware for protecting routes in the Merchant App API.

## Overview

The authentication middleware provides three main functions:
1. **`requireAuth`** - Verify JWT access token and attach user to request
2. **`requireMerchant`** - Ensure user is a merchant user
3. **`requireRole(roles[])`** - Ensure user has one of the specified roles

## Middleware Functions

### `requireAuth`

Verifies JWT access token from `Authorization: Bearer <token>` header and attaches decoded user to `req.user`.

**Features:**
- Extracts Bearer token from Authorization header
- Verifies token signature and expiration
- Rejects invalid, expired, or missing tokens
- Attaches decoded JWT payload to `req.user`

**Usage:**
```typescript
import { requireAuth } from '../middleware/auth.middleware';

router.get('/protected', requireAuth, (req, res) => {
  // req.user is available here
  const userId = req.user!.userId;
  const userType = req.user!.userType;
  // ...
});
```

**Error Responses:**
- `401` - No Authorization header
- `401` - Invalid token format
- `401` - Token expired
- `401` - Invalid token

### `requireMerchant`

Ensures the authenticated user is a merchant user. Must be used after `requireAuth`.

**Features:**
- Checks `req.user.userType === 'merchant'`
- Verifies `merchantId` is present in token
- Rejects partner users and unauthenticated requests

**Usage:**
```typescript
import { requireAuth, requireMerchant } from '../middleware/auth.middleware';

router.get('/merchant/me', requireAuth, requireMerchant, (req, res) => {
  // req.user.userType === 'merchant'
  // req.user.merchantId is available
  const merchantId = req.user!.merchantId!;
  // ...
});
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not a merchant user
- `403` - Merchant ID not found in token

### `requireRole(...roles)`

Ensures the authenticated user has one of the specified roles. Must be used after `requireAuth`.

**Features:**
- Checks if `req.user.role` matches any of the allowed roles
- Supports multiple roles (OR logic)
- Rejects users without required permissions

**Usage:**
```typescript
import { requireAuth, requireMerchant, requireRole } from '../middleware/auth.middleware';

// Require merchant owner OR manager
router.post('/agreements', 
  requireAuth, 
  requireMerchant, 
  requireRole('merchant_owner', 'merchant_manager'),
  (req, res) => {
    // Only merchant_owner or merchant_manager can access
    // ...
  }
);

// Require only merchant owner
router.delete('/agreements/:id',
  requireAuth,
  requireMerchant,
  requireRole('merchant_owner'),
  (req, res) => {
    // Only merchant_owner can access
    // ...
  }
);
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Insufficient permissions

## Convenience Functions

### `requireMerchantAuth`

Combined middleware: `requireAuth` + `requireMerchant`

**Usage:**
```typescript
import { requireMerchantAuth } from '../middleware/auth.middleware';

router.get('/merchant/me', requireMerchantAuth, (req, res) => {
  // req.user is authenticated merchant user
  // ...
});
```

### `requireMerchantRole(...roles)`

Combined middleware: `requireAuth` + `requireMerchant` + `requireRole`

**Usage:**
```typescript
import { requireMerchantRole } from '../middleware/auth.middleware';
import { MerchantRole } from '@merchant-app/shared';

router.post('/transactions',
  requireMerchantRole(MerchantRole.MERCHANT_OWNER, MerchantRole.MERCHANT_MANAGER),
  (req, res) => {
    // Only merchant_owner or merchant_manager can access
    // ...
  }
);
```

## Example Protected Routes

### 1. Protect `/merchant/me`

```typescript
import { Router, Request, Response } from 'express';
import { requireAuth, requireMerchant } from '../middleware/auth.middleware';
import { db } from '../config/database';

const router = Router();

router.get('/me', requireAuth, requireMerchant, async (req: Request, res: Response) => {
  const merchantId = req.user!.merchantId!;
  
  const result = await db.query(
    'SELECT * FROM merchants WHERE id = $1',
    [merchantId]
  );
  
  res.json({ success: true, data: result.rows[0] });
});
```

### 2. Protect `/agreements/*`

```typescript
import { Router, Request, Response } from 'express';
import { requireAuth, requireMerchant, requireRole } from '../middleware/auth.middleware';

const router = Router();

// GET /agreements - All merchant roles can view
router.get('/',
  requireAuth,
  requireMerchant,
  requireRole('merchant_owner', 'merchant_manager', 'merchant_accountant'),
  async (req, res) => {
    // Fetch agreements
  }
);

// POST /agreements - Only owner/manager can create
router.post('/',
  requireAuth,
  requireMerchant,
  requireRole('merchant_owner', 'merchant_manager'),
  async (req, res) => {
    // Create agreement
  }
);

// DELETE /agreements/:id - Only owner can delete
router.delete('/:id',
  requireAuth,
  requireMerchant,
  requireRole('merchant_owner'),
  async (req, res) => {
    // Delete agreement
  }
);
```

### 3. Protect `/transactions/*`

```typescript
import { Router, Request, Response } from 'express';
import { requireMerchantRole } from '../middleware/auth.middleware';
import { MerchantRole } from '@merchant-app/shared';

const router = Router();

// GET /transactions - All merchant roles can view
router.get('/',
  requireMerchantRole(
    MerchantRole.MERCHANT_OWNER,
    MerchantRole.MERCHANT_MANAGER,
    MerchantRole.MERCHANT_ACCOUNTANT
  ),
  async (req, res) => {
    // Fetch transactions
  }
);

// POST /transactions - Only owner/manager can create
router.post('/',
  requireMerchantRole(MerchantRole.MERCHANT_OWNER, MerchantRole.MERCHANT_MANAGER),
  async (req, res) => {
    // Create transaction
  }
);

// DELETE /transactions/:id - Only owner can delete
router.delete('/:id',
  requireMerchantRole(MerchantRole.MERCHANT_OWNER),
  async (req, res) => {
    // Delete transaction
  }
);
```

## Request Object

After authentication, `req.user` contains the JWT payload:

```typescript
interface JWTPayload {
  userType: 'merchant' | 'partner';
  userId: string;
  merchantId?: string;
  partnerId?: string;
  role: string;
  iat?: number;  // Issued at
  exp?: number;  // Expiration
}
```

**Usage in route handlers:**
```typescript
router.get('/example', requireAuth, (req, res) => {
  const userId = req.user!.userId;
  const merchantId = req.user!.merchantId;
  const role = req.user!.role;
  const userType = req.user!.userType;
  
  // Use these values...
});
```

## Error Handling

All middleware functions return appropriate HTTP status codes:

- **401 Unauthorized** - Authentication required or failed
- **403 Forbidden** - Insufficient permissions or wrong user type

**Error Response Format:**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Security Features

1. **Token Verification**: Validates JWT signature and expiration
2. **Type Safety**: TypeScript types ensure `req.user` is properly typed
3. **Role-Based Access**: Enforces role-based permissions
4. **User Type Validation**: Separates merchant and partner users
5. **Clear Error Messages**: Provides descriptive error messages

## Testing

### Test with curl:

```bash
# Get access token from login
TOKEN="your_access_token_here"

# Test protected route
curl -X GET http://localhost:3001/api/merchant/me \
  -H "Authorization: Bearer $TOKEN"

# Test role-protected route
curl -X POST http://localhost:3001/api/agreements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"partner_id": "...", "agreement_type": "PERCENTAGE"}'
```

### Test without token (should fail):

```bash
curl -X GET http://localhost:3001/api/merchant/me
# Returns: 401 Unauthorized
```

### Test with invalid token (should fail):

```bash
curl -X GET http://localhost:3001/api/merchant/me \
  -H "Authorization: Bearer invalid_token"
# Returns: 401 Invalid token
```

## Integration

To use these middlewares in your routes:

1. Import the middleware functions
2. Add them to your route definitions (in order)
3. Access `req.user` in your route handlers

**Example:**
```typescript
import { Router } from 'express';
import { requireAuth, requireMerchant, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Apply to all routes
router.use(requireAuth);
router.use(requireMerchant);

// Or apply to specific routes
router.get('/public', (req, res) => { /* public */ });
router.get('/private', requireAuth, (req, res) => { /* protected */ });
```

## Related Files

- `src/middleware/auth.middleware.ts` - Main middleware file
- `src/utils/jwt.ts` - JWT token utilities
- `src/routes/merchant.example.ts` - Example merchant routes
- `src/routes/agreements.example.ts` - Example agreement routes
- `src/routes/transactions.example.ts` - Example transaction routes

