# Partner Dashboard Fix

## Issue
Partner dashboard was not working - showing blank or "Please select a merchant" message.

## Root Causes
1. **No Auto-Merchant Selection**: When partner users logged in with dummy credentials, no merchant was automatically selected
2. **Timing Issue**: Dashboard checked for merchantId before MerchantSwitcher had a chance to load and select a merchant
3. **PartnerAuthContext**: Needed to better detect dummy partner tokens set by AuthContext

## Fixes Applied

### 1. Auto-Select Merchant on Dashboard Load
- Updated `app/(partner)/partner/dashboard/page.tsx` to automatically select the first available merchant if none is selected
- Falls back to `merchant-001` for dummy users if merchants can't be loaded
- Waits for user to be loaded before initializing merchant selection

### 2. Improved PartnerAuthContext
- Updated `contexts/PartnerAuthContext.tsx` to detect dummy partner tokens set by AuthContext
- Better handling of `dummyPartnerUser` in localStorage
- Properly initializes partner user from dummy credentials

### 3. Better Loading States
- Added loading state while merchant is being initialized
- Shows helpful message if no merchant is selected (with pointer to merchant switcher)
- Improved error handling

### 4. Merchant Selection Sync
- Dashboard now listens for merchant changes from MerchantSwitcher
- Automatically loads dashboard data when merchant is selected
- Properly syncs with localStorage

## How It Works Now

1. **Partner User Logs In**:
   - Uses dummy credentials: `owner@partner.com` / `owner123` or `staff@partner.com` / `staff123`
   - AuthContext detects partner user and sets `dummyPartnerUser` in localStorage
   - Redirects to `/partner/dashboard`

2. **Partner Dashboard Loads**:
   - PartnerAuthContext detects dummy partner token and loads user
   - Dashboard checks for selected merchant in localStorage
   - If no merchant selected, automatically selects first available merchant (or `merchant-001` for dummy users)
   - Loads dashboard data for selected merchant

3. **MerchantSwitcher**:
   - Loads available merchants (with mock data fallback)
   - Auto-selects first merchant if none selected
   - Calls `onMerchantChange` callback to update dashboard

## Testing

To test the partner dashboard:

1. Go to `/login`
2. Use partner credentials:
   - **Owner**: `owner@partner.com` / `owner123`
   - **Staff**: `staff@partner.com` / `staff123`
3. You should be redirected to `/partner/dashboard`
4. Dashboard should automatically load with merchant selected
5. You can switch merchants using the dropdown in the header

## Mock Data

When backend is not available, the dashboard uses mock data:
- **Merchants**: `merchant-001` (Acme Corporation), `merchant-002` (Tech Solutions Inc), `merchant-003` (Global Trading Co)
- **Metrics**: Mock revenue, shares, taxes, balances
- **Invoices**: Mock transaction data
- **Payouts**: Mock payout data

All mock data is automatically used when network errors are detected.

