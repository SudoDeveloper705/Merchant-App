# Dummy Login Credentials

These credentials allow you to test the application without a backend connection.

## Merchant Users

### Merchant Owner
- **Email**: `owner@merchant.com`
- **Password**: `owner123`
- **Role**: Merchant Owner
- **Dashboard**: `/merchant/dashboard`
- **Access**: Full access to all merchant features

### Merchant Manager
- **Email**: `manager@merchant.com`
- **Password**: `manager123`
- **Role**: Merchant Manager
- **Dashboard**: `/merchant/dashboard`
- **Access**: Management access (no user management)

### Merchant Accountant
- **Email**: `accountant@merchant.com`
- **Password**: `accountant123`
- **Role**: Merchant Accountant
- **Dashboard**: `/merchant/dashboard`
- **Access**: Financial data and reports only

## Partner Users

### Partner Owner
- **Email**: `owner@partner.com`
- **Password**: `owner123`
- **Role**: Partner Owner
- **Dashboard**: `/partner/dashboard`
- **Access**: Full partner dashboard access

### Partner Staff
- **Email**: `staff@partner.com`
- **Password**: `staff123`
- **Role**: Partner Staff
- **Dashboard**: `/partner/dashboard`
- **Access**: Limited partner access (read-only)

## How to Use

1. Navigate to `/login`
2. Enter any of the credentials above
3. Click "Sign In"
4. You will be automatically redirected to the appropriate dashboard

## Notes

- These credentials work without a backend connection
- User data is stored in localStorage
- Refresh the page to maintain the session
- Clear localStorage to logout

## Quick Login Links

You can also use these direct links (after setting credentials in localStorage):

- Merchant Dashboard: `/merchant/dashboard`
- Partner Dashboard: `/partner/dashboard`
- Main Dashboard: `/dashboard`

