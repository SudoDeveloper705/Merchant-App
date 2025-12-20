# Dashboard and Reporting APIs

## Overview

Dashboard metrics and reporting APIs for Merchant App with full RBAC support. All queries respect access control rules.

## Dashboard Metrics

### Merchant Dashboard

**Metrics:**
- Total revenue (subtotal only, from COMPLETED transactions)
- Total expenses (expenses + fees from transactions)
- Net profit (revenue - expenses - partner shares)
- Amount owed to partners (outstanding partner shares)

**Endpoint:**
```bash
GET /api/dashboard/merchant?period=month
GET /api/dashboard/merchant?startDate=2024-01-01&endDate=2024-01-31
```

**Access:** Merchant users only

**Query Parameters:**
- `period` - "month" (default) or "year"
- `startDate` - Custom start date (ISO format)
- `endDate` - Custom end date (ISO format)

**Response:**
```json
{
  "success": true,
  "data": {
    "total_revenue_cents": 1000000,
    "total_expenses_cents": 50000,
    "net_profit_cents": 850000,
    "amount_owed_to_partners_cents": 100000,
    "currency": "USD",
    "period_start": "2024-01-01T00:00:00Z",
    "period_end": "2024-01-31T23:59:59Z"
  }
}
```

### Partner Dashboard

**Metrics:**
- Revenue related to partner (from linked merchant transactions)
- Partner share (from transaction_agreement_links)
- Merchant share (from transaction_agreement_links)
- Sales tax separated

**Endpoints:**
```bash
# For specific merchant
GET /api/dashboard/partner/:merchantId?period=month

# Across all linked merchants
GET /api/dashboard/partner?period=month
```

**Access:** Partner users only

**Query Parameters:**
- `period` - "month" (default) or "year"
- `startDate` - Custom start date
- `endDate` - Custom end date

**Response:**
```json
{
  "success": true,
  "data": {
    "total_revenue_cents": 500000,
    "partner_share_cents": 75000,
    "merchant_share_cents": 425000,
    "sales_tax_cents": 5000,
    "currency": "USD",
    "period_start": "2024-01-01T00:00:00Z",
    "period_end": "2024-01-31T23:59:59Z"
  }
}
```

## Reports

### Monthly Partner Settlement Report

**Endpoint:**
```bash
GET /api/reports/settlement?merchantId=uuid&partnerId=uuid&year=2024&month=1
GET /api/reports/settlement?merchantId=uuid&partnerId=uuid&year=2024&month=1&format=csv
```

**Access:** 
- Merchant users: Can view any partner
- Partner users: Can only view their own data (merchantId required)

**Query Parameters:**
- `merchantId` - Required for partner users
- `partnerId` - Required for merchant users
- `year` - Required
- `month` - Required
- `format` - "csv" for CSV export

**Response (JSON):**
```json
{
  "success": true,
  "data": [
    {
      "merchant_id": "uuid",
      "merchant_name": "Merchant Name",
      "partner_id": "uuid",
      "partner_name": "Partner Name",
      "agreement_id": "uuid",
      "agreement_name": "Agreement Name",
      "year": 2024,
      "month": 1,
      "total_revenue_cents": 1000000,
      "total_transactions": 50,
      "partner_share_cents": 150000,
      "merchant_share_cents": 850000,
      "minimum_guarantee_cents": 200000,
      "adjustment_cents": 50000,
      "final_partner_share_cents": 200000,
      "total_payouts_cents": 100000,
      "outstanding_balance_cents": 100000,
      "currency": "USD"
    }
  ]
}
```

### Transaction Export (CSV)

**Endpoint:**
```bash
GET /api/reports/transactions/export?startDate=2024-01-01&endDate=2024-01-31&partnerId=uuid
```

**Access:**
- Merchant users: Can export all transactions or filter by partner
- Partner users: Must specify merchantId, can only see their transactions

**Query Parameters:**
- `startDate` - Required (ISO format)
- `endDate` - Required (ISO format)
- `partnerId` - Optional (for merchant users)
- `merchantId` - Required for partner users

**Response:** CSV file download

**CSV Columns:**
- ID
- External ID
- Transaction Type
- Status
- Subtotal (Cents)
- Sales Tax (Cents)
- Total (Cents)
- Fees (Cents)
- Net (Cents)
- Currency
- Description
- Transaction Date
- Client Name
- Partner Share (Cents)
- Merchant Share (Cents)
- Agreement Name
- Partner Name
- Created At

### Payout History Export (CSV)

**Endpoint:**
```bash
GET /api/reports/payouts/export?startDate=2024-01-01&endDate=2024-01-31&partnerId=uuid
```

**Access:**
- Merchant users: Can export all payouts or filter by partner
- Partner users: Must specify merchantId, can only see their payouts

**Query Parameters:**
- `startDate` - Required (ISO format)
- `endDate` - Required (ISO format)
- `partnerId` - Optional (for merchant users)
- `merchantId` - Required for partner users

**Response:** CSV file download

**CSV Columns:**
- ID
- Amount (Cents)
- Currency
- Status
- Payout Method
- Payout Reference
- Description
- Scheduled Date
- Processed At
- Partner Name
- Merchant Name
- Agreement Name
- Created At
- Updated At

## RBAC Rules

### Merchant Users
- ✅ Can view all dashboard metrics for their merchant
- ✅ Can view settlement reports for any partner
- ✅ Can export all transactions (with optional partner filter)
- ✅ Can export all payouts (with optional partner filter)

### Partner Users
- ✅ Can view dashboard metrics for linked merchants only
- ✅ Can view settlement reports for their own data only
- ✅ Can export transactions for linked merchants only
- ✅ Can export payouts for linked merchants only
- ❌ Cannot access other partners' data
- ❌ Cannot access merchants without a link

## Calculation Details

### Merchant Dashboard

**Total Revenue:**
- Sum of `subtotal_cents` from COMPLETED transactions
- Only PAYMENT transactions (excludes refunds)
- Excludes sales tax

**Total Expenses:**
- Sum of `amount_cents` from expenses table
- Plus sum of `fees_cents` from transactions
- For the specified period

**Net Profit:**
```
Net Profit = Total Revenue - Total Expenses - Partner Shares
```

**Amount Owed to Partners:**
- Sum of partner shares from `transaction_agreement_links`
- Minus completed payouts
- Only positive values shown

### Partner Dashboard

**Total Revenue:**
- Sum of `subtotal_cents` from transactions linked to partner agreements
- Only COMPLETED PAYMENT transactions

**Partner Share:**
- Sum of `partner_share_cents` from `transaction_agreement_links`

**Merchant Share:**
- Sum of `merchant_share_cents` from `transaction_agreement_links`

**Sales Tax:**
- Sum of `sales_tax_cents` from transactions
- Separated for clarity

## CSV Export Features

- Proper CSV escaping (handles commas, quotes, newlines)
- UTF-8 encoding
- Downloadable files with proper headers
- Includes all relevant data fields
- Respects RBAC (partners only see their data)

## Example Usage

### Merchant Dashboard
```bash
# Current month
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/dashboard/merchant?period=month"

# Custom date range
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/dashboard/merchant?startDate=2024-01-01&endDate=2024-01-31"
```

### Partner Dashboard
```bash
# For specific merchant
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/dashboard/partner/merchant-uuid?period=month"

# Across all merchants
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/dashboard/partner?period=month"
```

### Settlement Report
```bash
# JSON format
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/reports/settlement?merchantId=uuid&partnerId=uuid&year=2024&month=1"

# CSV format
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/reports/settlement?merchantId=uuid&partnerId=uuid&year=2024&month=1&format=csv" \
  -o settlement-report.csv
```

### Transaction Export
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/reports/transactions/export?startDate=2024-01-01&endDate=2024-01-31" \
  -o transactions.csv
```

### Payout Export
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3001/api/reports/payouts/export?startDate=2024-01-01&endDate=2024-01-31" \
  -o payouts.csv
```

## Performance Considerations

- Dashboard queries are optimized with proper indexes
- CSV exports may take time for large datasets
- Consider pagination for very large exports (future enhancement)
- Settlement reports are calculated on-demand

## Security

- All endpoints require authentication
- RBAC enforced at query level
- Partner users can only access linked merchants
- No data leakage between partners
- CSV exports respect same access rules as JSON endpoints

