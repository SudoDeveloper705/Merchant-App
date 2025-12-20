# Authentication & RBAC Middleware

## Overview

The Merchant App implements JWT-based authentication with role-based access control (RBAC) for two user types:
- **Merchant Users**: Users belonging to merchants
- **Partner Users**: Users belonging to partners (offshore)

## Middleware Components

### 1. Authentication Middleware (`auth.ts`)

#### `authenticate`
Verifies JWT access token from `Authorization: Bearer <token>` header.

```typescript
import { authenticate } from './middleware/auth';

router.get('/protected', authenticate, (req, res) => {
  // req.user is now available
  res.json({ user: req.user });
});
```

#### `optionalAuthenticate`
Sets user if token is valid, but doesn't fail if missing.

```typescript
import { optionalAuthenticate } from './middleware/auth';

router.get('/public', optionalAuthenticate, (req, res) => {
  // req.user may or may not be set
});
```

### 2. Role Guard Middleware (`roleGuard.ts`)

#### `requireRole(...roles)`
Checks if user has one of the specified roles.

```typescript
import { requireRole } from './middleware/roleGuard';
import { MerchantRole, PartnerRole } from '@merchant-app/shared';

// Require any of these roles
router.get('/admin', 
  authenticate,
  requireRole(MerchantRole.MERCHANT_OWNER, PartnerRole.PARTNER_OWNER),
  handler
);
```

#### `requireMerchantRole(...roles)`
Requires merchant user with specific role.

```typescript
import { requireMerchantRole } from './middleware/roleGuard';
import { MerchantRole } from '@merchant-app/shared';

router.put('/merchant',
  authenticate,
  requireMerchantRole(MerchantRole.MERCHANT_OWNER, MerchantRole.MERCHANT_MANAGER),
  handler
);
```

#### `requirePartnerRole(...roles)`
Requires partner user with specific role.

```typescript
import { requirePartnerRole } from './middleware/roleGuard';
import { PartnerRole } from '@merchant-app/shared';

router.get('/partner',
  authenticate,
  requirePartnerRole(PartnerRole.PARTNER_OWNER),
  handler
);
```

### 3. Access Guard Middleware (`accessGuard.ts`)

#### `requireMerchantAccess`
Ensures merchant users can only access their merchant's data.

```typescript
import { requireMerchantAccess } from './middleware/accessGuard';

router.get('/merchant/data',
  authenticate,
  requireMerchantAccess,
  handler
);
```

#### `requirePartnerAccess`
Ensures partner users can only access linked merchants and blocks restricted resources.

```typescript
import { requirePartnerAccess } from './middleware/accessGuard';

router.get('/merchant/:merchantId',
  authenticate,
  requirePartnerAccess,
  handler
);
```

**Restrictions for Partner Users:**
- ❌ Cannot access `/bank-accounts`
- ❌ Cannot access `/expenses`
- ❌ Cannot access `/partners` (other partners' data)

#### `requireMerchantAccessById(paramName)`
Verifies access to a specific merchant by ID.

```typescript
import { requireMerchantAccessById } from './middleware/accessGuard';

router.get('/merchants/:merchantId',
  authenticate,
  requireMerchantAccessById('merchantId'),
  handler
);
```

## JWT Payload Structure

```typescript
interface JWTPayload {
  userType: 'merchant' | 'partner';
  userId: string;
  role: MerchantRole | PartnerRole;
  merchantId?: string;  // For merchant users
  partnerId?: string;    // For partner users
  iat?: number;
  exp?: number;
}
```

## Roles

### Merchant Roles
- `merchant_owner` - Full access to merchant
- `merchant_manager` - Management access
- `merchant_accountant` - Accounting access

### Partner Roles
- `partner_owner` - Full access to partner
- `partner_staff` - Limited access

## Example Usage

### Example 1: Merchant-only route with role requirement

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireMerchantAccess } from '../middleware/accessGuard';
import { requireMerchantRole } from '../middleware/roleGuard';
import { MerchantRole } from '@merchant-app/shared';

const router = Router();

router.put('/merchants/me',
  authenticate,                    // 1. Verify JWT
  requireMerchantAccess,           // 2. Ensure merchant user
  requireMerchantRole(             // 3. Require specific role
    MerchantRole.MERCHANT_OWNER,
    MerchantRole.MERCHANT_MANAGER
  ),
  async (req, res) => {
    // Handler - req.user is available with merchantId
    const merchantId = req.user!.merchantId;
    // ... update merchant
  }
);
```

### Example 2: Partner accessing linked merchant

```typescript
router.get('/merchants/:merchantId/transactions',
  authenticate,                    // 1. Verify JWT
  requirePartnerAccess,            // 2. Verify partner user + check link
  async (req, res) => {
    // Handler - merchant access already verified
    const merchantId = req.params.merchantId;
    // ... fetch transactions
  }
);
```

### Example 3: Mixed access (merchant or partner)

```typescript
router.get('/merchants/:merchantId',
  authenticate,                    // 1. Verify JWT
  requireMerchantAccessById(),     // 2. Verify access (works for both types)
  async (req, res) => {
    // Handler - access verified for both merchant and partner users
    const merchantId = req.params.merchantId;
    // ... fetch merchant
  }
);
```

## Access Control Rules

### Merchant Users
- ✅ Can access their own merchant's data
- ✅ Can access their merchant's clients, transactions, expenses
- ❌ Cannot access other merchants
- ❌ Cannot access partners directly

### Partner Users
- ✅ Can access merchants linked via `merchant_partner_links`
- ✅ Can access transactions, agreements for linked merchants
- ❌ Cannot access bank accounts
- ❌ Cannot access expenses
- ❌ Cannot access other partners' data
- ❌ Cannot access merchants without a link

