# Authentication & RBAC Examples

## API Endpoints

### Authentication Routes

#### Register Merchant User
```bash
POST /api/auth/register/merchant
Content-Type: application/json

{
  "email": "owner@merchant.com",
  "password": "securepassword123",
  "firstName": "John",
  "lastName": "Doe",
  "merchantId": "uuid-of-merchant",
  "role": "merchant_owner"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "owner@merchant.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "merchant_owner",
      "merchantId": "merchant-uuid"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Register Partner User
```bash
POST /api/auth/register/partner
Content-Type: application/json

{
  "email": "staff@partner.com",
  "password": "securepassword123",
  "firstName": "Jane",
  "lastName": "Smith",
  "partnerId": "uuid-of-partner",
  "role": "partner_staff"
}
```

#### Login Merchant User
```bash
POST /api/auth/login/merchant
Content-Type: application/json

{
  "email": "owner@merchant.com",
  "password": "securepassword123",
  "merchantId": "uuid-of-merchant"  // Optional
}
```

#### Login Partner User
```bash
POST /api/auth/login/partner
Content-Type: application/json

{
  "email": "staff@partner.com",
  "password": "securepassword123",
  "partnerId": "uuid-of-partner"  // Optional
}
```

#### Refresh Access Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "new-access-token"
  }
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer <access-token>
```

## Protected Routes Examples

### Merchant Routes

#### Get Own Merchant Data
```bash
GET /api/merchants/me
Authorization: Bearer <merchant-user-token>
```

**Access:** Merchant users only

#### Get Merchant by ID
```bash
GET /api/merchants/:merchantId
Authorization: Bearer <token>
```

**Access:**
- Merchant users: Only their own merchant
- Partner users: Only linked merchants

#### Update Merchant
```bash
PUT /api/merchants/me
Authorization: Bearer <merchant-user-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+1234567890"
}
```

**Access:** Merchant users with `merchant_owner` or `merchant_manager` role

### Transaction Routes

#### Get Merchant's Transactions
```bash
GET /api/transactions/merchant?page=1&limit=20&status=COMPLETED
Authorization: Bearer <merchant-user-token>
```

**Access:** Merchant users only

#### Get Transactions for Linked Merchant (Partner Users)
```bash
GET /api/transactions/merchant/:merchantId?page=1&limit=20
Authorization: Bearer <partner-user-token>
```

**Access:** Partner users (only for linked merchants)

#### Create Transaction
```bash
POST /api/transactions
Authorization: Bearer <merchant-user-token>
Content-Type: application/json

{
  "clientId": "client-uuid",
  "transactionType": "PAYMENT",
  "subtotalCents": 10000,
  "salesTaxCents": 800,
  "totalCents": 10800,
  "feesCents": 300,
  "netCents": 10500,
  "currency": "USD",
  "description": "Payment for services"
}
```

**Access:** Merchant users with `merchant_owner`, `merchant_manager`, or `merchant_accountant` role

## JWT Token Structure

### Access Token Payload
```json
{
  "userType": "merchant",
  "userId": "user-uuid",
  "role": "merchant_owner",
  "merchantId": "merchant-uuid",
  "iat": 1234567890,
  "exp": 1234571490
}
```

### Partner User Token Payload
```json
{
  "userType": "partner",
  "userId": "partner-user-uuid",
  "role": "partner_staff",
  "partnerId": "partner-uuid",
  "iat": 1234567890,
  "exp": 1234571490
}
```

## Client Usage Examples

### JavaScript/TypeScript

```typescript
// Login
const loginResponse = await fetch('http://localhost:3001/api/auth/login/merchant', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'owner@merchant.com',
    password: 'password123'
  })
});

const { data } = await loginResponse.json();
const { accessToken, refreshToken } = data;

// Store tokens
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Make authenticated request
const response = await fetch('http://localhost:3001/api/merchants/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Refresh token when access token expires
const refreshResponse = await fetch('http://localhost:3001/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:3001/api/auth/login/merchant \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@merchant.com",
    "password": "password123"
  }'

# Get merchant data
curl -X GET http://localhost:3001/api/merchants/me \
  -H "Authorization: Bearer <access-token>"

# Get transactions
curl -X GET "http://localhost:3001/api/transactions/merchant?page=1&limit=20" \
  -H "Authorization: Bearer <access-token>"
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Access denied: Merchant not linked to your partner account"
}
```

### 403 Insufficient Permissions
```json
{
  "success": false,
  "error": "Insufficient permissions"
}
```

