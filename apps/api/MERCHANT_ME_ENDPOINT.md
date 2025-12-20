# GET /merchant/me Endpoint

## Overview

The `GET /merchant/me` endpoint returns the authenticated merchant user's information. This endpoint is essential for the frontend to maintain user sessions, protect routes, and display user information on the dashboard.

## Endpoint

```
GET /api/merchant/me
```

## Authentication

**Required:** Yes

**Header:**
```
Authorization: Bearer <access_token>
```

The endpoint uses the following middleware:
- `requireAuth` - Verifies JWT access token
- `requireMerchant` - Ensures user is a merchant user

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@acme.com",
    "role": "merchant_owner",
    "merchantId": "660e8400-e29b-41d4-a716-446655440000",
    "merchantName": "Acme Corporation"
  }
}
```

### Error Responses

#### 401 Unauthorized - No token provided
```json
{
  "success": false,
  "error": "Authorization header required"
}
```

#### 401 Unauthorized - Invalid/expired token
```json
{
  "success": false,
  "error": "Token expired"
}
```

#### 403 Forbidden - Not a merchant user
```json
{
  "success": false,
  "error": "Merchant user required"
}
```

#### 404 Not Found - User not found or inactive
```json
{
  "success": false,
  "error": "User not found or inactive"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch user information"
}
```

## SQL Query

The endpoint executes the following SQL query:

```sql
SELECT 
  u.id,
  u.first_name,
  u.last_name,
  u.email,
  u.role,
  u.merchant_id,
  m.business_name as merchant_name,
  m.is_active as merchant_is_active,
  u.is_active as user_is_active,
  u.last_login_at,
  u.created_at
FROM users u
INNER JOIN merchants m ON u.merchant_id = m.id
WHERE u.id = $1 
  AND u.merchant_id = $2
  AND u.is_active = true
  AND m.is_active = true
```

**Parameters:**
- `$1` - User ID (from JWT token)
- `$2` - Merchant ID (from JWT token)

**Query Features:**
- Joins `users` and `merchants` tables
- Verifies both user and merchant are active
- Returns all required fields in a single query
- Uses parameterized queries for SQL injection prevention

## Frontend Usage

### Keep User Logged In

Call this endpoint on app initialization to verify the token is still valid:

```typescript
// Check if user is still logged in
async function checkAuth() {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return null;
  }

  try {
    const response = await fetch('http://localhost:3001/api/merchant/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.data; // User is logged in
    } else {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
}
```

### Protect Routes

Use the response to determine if user can access protected routes:

```typescript
// React example
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth().then(userData => {
      setUser(userData);
      setLoading(false);
    });
  }, []);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" />;

  return children;
}
```

### Show Dashboard

Display user and merchant information:

```typescript
// React component example
function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/merchant/me', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.data);
        }
      });
  }, []);

  if (!user) return <Loading />;

  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>Merchant: {user.merchantName}</p>
      <p>Role: {user.role}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}
```

## Controller Logic

The endpoint handler:

1. **Extracts user info from JWT token** (via `requireAuth` middleware)
   - `req.user.userId` - User ID
   - `req.user.merchantId` - Merchant ID
   - `req.user.role` - User role

2. **Verifies merchant user** (via `requireMerchant` middleware)
   - Ensures `userType === 'merchant'`
   - Ensures `merchantId` is present

3. **Queries database**
   - Joins users and merchants tables
   - Verifies both are active
   - Returns user and merchant information

4. **Formats response**
   - Combines `first_name` and `last_name` into `name`
   - Returns only required fields
   - Returns merchant `business_name` as `merchantName`

5. **Error handling**
   - Handles database errors
   - Returns appropriate HTTP status codes
   - Provides descriptive error messages

## Testing

### Using curl

```bash
# Get access token from login first
TOKEN="your_access_token_here"

# Call the endpoint
curl -X GET http://localhost:3001/api/merchant/me \
  -H "Authorization: Bearer $TOKEN"
```

### Using Postman

1. Set method to `GET`
2. URL: `http://localhost:3001/api/merchant/me`
3. Headers:
   - `Authorization: Bearer <your_token>`
4. Send request

### Expected Response

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@acme.com",
    "role": "merchant_owner",
    "merchantId": "660e8400-e29b-41d4-a716-446655440000",
    "merchantName": "Acme Corporation"
  }
}
```

## Security Considerations

1. **Token Verification**: JWT token is verified before processing
2. **User Type Check**: Only merchant users can access
3. **Active Status**: Only active users and merchants are returned
4. **SQL Injection Prevention**: Uses parameterized queries
5. **Error Messages**: Generic error messages prevent information leakage

## Related Endpoints

- `POST /api/auth/merchant/login` - Login to get access token
- `POST /api/auth/refresh` - Refresh expired access token
- `GET /api/merchants/me` - Get merchant business information (different from user info)

## File Structure

- **Route File**: `apps/api/src/routes/merchant.me.ts`
- **Middleware**: `apps/api/src/middleware/auth.middleware.ts`
- **Database Config**: `apps/api/src/config/database.ts`
- **Main App**: `apps/api/src/index.ts`

