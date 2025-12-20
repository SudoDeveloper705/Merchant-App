# Merchant Authentication Implementation

This document describes the merchant authentication implementation for the Merchant App.

## Overview

The merchant authentication system provides secure registration and login functionality using:
- **bcrypt** for password hashing
- **JWT** for access and refresh tokens
- **PostgreSQL** with parameterized queries (no ORM)
- **Express + TypeScript** for the API

## Architecture

### Files Created/Modified

1. **`src/services/auth.service.ts`** - Business logic for merchant authentication
2. **`src/routes/auth.merchant.ts`** - Express routes for merchant auth endpoints
3. **`src/utils/password.ts`** - Password hashing utilities (already existed)
4. **`src/utils/jwt.ts`** - JWT token generation utilities (already existed)

## API Endpoints

### 1. POST /api/auth/merchant/register

Register a new merchant and automatically create a merchant_owner user.

**Request Body:**
```json
{
  "merchant_name": "Acme Corporation",
  "owner_name": "John Doe",
  "email": "john@acme.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@acme.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "merchant_owner",
      "merchantId": "uuid"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

**Error Responses:**
- `400` - Missing required fields, invalid email format, password too short
- `409` - Email already exists (merchant or user)
- `500` - Registration failed

**What it does:**
1. Validates input (merchant_name, owner_name, email, password)
2. Checks email uniqueness (both merchants and users tables)
3. Creates merchant record in database
4. Hashes password using bcrypt
5. Creates merchant_owner user for the merchant
6. Generates JWT access and refresh tokens
7. Returns user data and tokens

### 2. POST /api/auth/merchant/login

Login an existing merchant user.

**Request Body:**
```json
{
  "email": "john@acme.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@acme.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "merchant_owner",
      "merchantId": "uuid"
    },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

**Error Responses:**
- `400` - Missing email or password
- `401` - Invalid credentials, user inactive, or merchant inactive
- `500` - Login failed

**What it does:**
1. Validates input (email, password)
2. Finds user by email (joins with merchants table)
3. Verifies user and merchant are active
4. Verifies password using bcrypt
5. Updates last_login_at timestamp
6. Generates JWT access and refresh tokens
7. Returns user data and tokens

## JWT Token Payload

The JWT tokens include the following payload:

```typescript
{
  userType: "merchant",
  userId: "user-uuid",
  merchantId: "merchant-uuid",
  role: "merchant_owner" | "merchant_manager" | "merchant_accountant",
  iat: 1234567890,  // Issued at (auto)
  exp: 1234567890   // Expiration (auto)
}
```

**Token Expiration:**
- Access Token: 15 minutes (configurable via `JWT_EXPIRES_IN` env var)
- Refresh Token: 7 days (configurable via `JWT_REFRESH_EXPIRES_IN` env var)

## Password Hashing

Passwords are hashed using **bcrypt** with 10 salt rounds:

```typescript
// Hashing
const passwordHash = await hashPassword(password);
// Returns: "$2b$10$..."

// Verification
const isValid = await verifyPassword(password, passwordHash);
// Returns: true/false
```

**Security:**
- Never store plain text passwords
- Uses bcrypt with 10 salt rounds (industry standard)
- Passwords must be at least 8 characters long

## Database Operations

All database operations use **parameterized SQL queries** to prevent SQL injection:

```typescript
// Example: Find user by email
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// Example: Create merchant (transaction)
await db.transaction(async (client) => {
  const merchantResult = await client.query(
    'INSERT INTO merchants (...) VALUES ($1, $2, $3) RETURNING id',
    [name, business_name, email]
  );
  // ...
});
```

**Transaction Support:**
- Registration uses database transactions to ensure atomicity
- If user creation fails, merchant creation is rolled back
- Prevents orphaned records

## Service Layer

The `auth.service.ts` file contains the business logic:

### `registerMerchant(input: MerchantRegisterInput)`
- Validates input
- Checks email uniqueness
- Creates merchant and user in a transaction
- Hashes password
- Generates tokens

### `loginMerchant(input: MerchantLoginInput)`
- Validates input
- Finds user by email
- Verifies password
- Updates last login
- Generates tokens

## Error Handling

The service throws descriptive errors that are caught by the route handlers:

- **Validation errors**: Missing fields, invalid format, weak password
- **Conflict errors**: Email already exists
- **Authentication errors**: Invalid credentials, inactive accounts
- **Generic errors**: Database failures, unexpected errors

Route handlers map these to appropriate HTTP status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication errors)
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error (generic errors)

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **SQL Injection Prevention**: Parameterized queries only
3. **Email Uniqueness**: Enforced at database level
4. **Account Status Checks**: Verifies user and merchant are active
5. **JWT Tokens**: Secure token-based authentication
6. **Transaction Safety**: Atomic operations prevent data inconsistency

## Usage Example

### Register a Merchant

```bash
curl -X POST http://localhost:3001/api/auth/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "merchant_name": "Acme Corporation",
    "owner_name": "John Doe",
    "email": "john@acme.com",
    "password": "securepassword123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3001/api/auth/merchant/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@acme.com",
    "password": "securepassword123"
  }'
```

### Use Access Token

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <access_token>"
```

## Environment Variables

Required environment variables:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/merchantapp

# JWT Secrets
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production

# JWT Expiration (optional)
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

## Testing

To test the endpoints:

1. **Register a merchant:**
   ```bash
   POST /api/auth/merchant/register
   ```

2. **Login:**
   ```bash
   POST /api/auth/merchant/login
   ```

3. **Verify token:**
   ```bash
   GET /api/auth/me
   Authorization: Bearer <access_token>
   ```

## Related Files

- `src/routes/auth.ts` - Other auth routes (partner, refresh, me)
- `src/middleware/auth.ts` - Authentication middleware
- `src/middleware/roleGuard.ts` - Role-based access control

