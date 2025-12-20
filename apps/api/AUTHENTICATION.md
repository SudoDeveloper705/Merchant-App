# Authentication & RBAC Implementation

## Overview

Complete JWT-based authentication and role-based access control (RBAC) system for Merchant App with support for two user types: Merchant Users and Partner Users.

## Architecture

### User Types

1. **Merchant Users** (`userType: "merchant"`)
   - Belong to a specific merchant
   - Roles: `merchant_owner`, `merchant_manager`, `merchant_accountant`
   - Can access only their merchant's data

2. **Partner Users** (`userType: "partner"`)
   - Belong to a specific partner
   - Roles: `partner_owner`, `partner_staff`
   - Can access only merchants linked via `merchant_partner_links`
   - **Restricted from**: bank accounts, expenses, other partners' data

## File Structure

```
apps/api/src/
├── config/
│   └── database.ts          # PostgreSQL connection pool
├── middleware/
│   ├── auth.ts              # JWT authentication middleware
│   ├── roleGuard.ts         # Role-based authorization
│   ├── accessGuard.ts       # Merchant/Partner access control
│   └── README.md            # Middleware documentation
├── routes/
│   ├── auth.ts              # Authentication routes
│   ├── merchants.ts         # Merchant routes (examples)
│   └── transactions.ts      # Transaction routes (examples)
├── utils/
│   ├── jwt.ts               # JWT token generation/verification
│   └── password.ts          # Password hashing/verification
└── index.ts                 # Main server file
```

## JWT Token Structure

### Access Token Payload
```typescript
{
  userType: "merchant" | "partner",
  userId: string,              // UUID
  role: MerchantRole | PartnerRole,
  merchantId?: string,        // For merchant users
  partnerId?: string,         // For partner users
  iat: number,                // Issued at
  exp: number                 // Expires at
}
```

### Token Expiration
- **Access Token**: 15 minutes (configurable via `JWT_EXPIRES_IN`)
- **Refresh Token**: 7 days (configurable via `JWT_REFRESH_EXPIRES_IN`)

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/merchant` | Register merchant user | No |
| POST | `/api/auth/register/partner` | Register partner user | No |
| POST | `/api/auth/login/merchant` | Login merchant user | No |
| POST | `/api/auth/login/partner` | Login partner user | No |
| POST | `/api/auth/refresh` | Refresh access token | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### Protected Routes (Examples)

| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/merchants/me` | Merchant users only |
| GET | `/api/merchants/:merchantId` | Merchant users (own) or Partner users (linked) |
| PUT | `/api/merchants/me` | Merchant users (owner/manager) |
| GET | `/api/transactions/merchant` | Merchant users only |
| GET | `/api/transactions/merchant/:merchantId` | Partner users (linked merchants) |
| POST | `/api/transactions` | Merchant users (owner/manager/accountant) |

## Middleware Usage

### 1. Authentication
```typescript
import { authenticate } from './middleware/auth';

router.get('/protected', authenticate, handler);
```

### 2. Role Guard
```typescript
import { requireMerchantRole } from './middleware/roleGuard';
import { MerchantRole } from '@merchant-app/shared';

router.put('/merchant',
  authenticate,
  requireMerchantRole(MerchantRole.MERCHANT_OWNER, MerchantRole.MERCHANT_MANAGER),
  handler
);
```

### 3. Access Guard
```typescript
import { requireMerchantAccess, requireMerchantAccessById } from './middleware/accessGuard';

// Merchant users only
router.get('/merchant/data',
  authenticate,
  requireMerchantAccess,
  handler
);

// Both merchant and partner users (with access verification)
router.get('/merchants/:merchantId',
  authenticate,
  requireMerchantAccessById(),
  handler
);
```

## Access Control Rules

### Merchant Users
✅ **Can Access:**
- Their own merchant's data
- Their merchant's clients, transactions, expenses
- Their merchant's agreements

❌ **Cannot Access:**
- Other merchants' data
- Partners' data directly

### Partner Users
✅ **Can Access:**
- Merchants linked via `merchant_partner_links`
- Transactions for linked merchants
- Agreements involving their partner and linked merchants

❌ **Cannot Access:**
- Bank accounts (`/bank-accounts`)
- Expenses (`/expenses`)
- Other partners' data (`/partners`)
- Merchants without an active link

## Security Features

1. **Password Hashing**: Bcrypt with 10 salt rounds
2. **JWT Tokens**: Separate access and refresh tokens
3. **Token Verification**: Automatic expiration checking
4. **Access Control**: Database-level verification of merchant-partner links
5. **Role-Based Authorization**: Granular permission checks
6. **Audit Trail**: Last login tracking

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/merchantapp
```

## Example Request Flow

### 1. Login
```bash
POST /api/auth/login/merchant
{
  "email": "owner@merchant.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

### 2. Use Access Token
```bash
GET /api/merchants/me
Authorization: Bearer eyJ...
```

### 3. Refresh Token (when access token expires)
```bash
POST /api/auth/refresh
{
  "refreshToken": "eyJ..."
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "new-token"
  }
}
```

## Testing

### Test Merchant User Login
```bash
curl -X POST http://localhost:3001/api/auth/login/merchant \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@merchant.com",
    "password": "password123"
  }'
```

### Test Protected Route
```bash
curl -X GET http://localhost:3001/api/merchants/me \
  -H "Authorization: Bearer <access-token>"
```

## Next Steps

1. Implement refresh token storage (database or Redis)
2. Add token blacklisting for logout
3. Implement rate limiting for auth endpoints
4. Add 2FA support
5. Add password reset functionality
6. Implement session management

