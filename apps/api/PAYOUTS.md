# Payouts and Outstanding Balance

## Overview

Payout management and outstanding balance tracking for Merchant App. Merchants can record payouts manually, and the system calculates outstanding balances based on partner shares minus payouts.

## Features

- ✅ Manual payout creation (merchant users only)
- ✅ Outstanding balance calculation
- ✅ Partner read-only access to payouts
- ✅ Multiple payout methods (Wire, Wise, PayPal, Bank Transfer, Stripe)
- ✅ Payouts do NOT alter historical transaction calculations
- ✅ Monthly balance tracking

## Outstanding Balance Logic

**Formula:**
```
Outstanding Balance = Partner Share (month) - Payouts (month)
```

- **Partner Share**: Calculated from `transaction_agreement_links` for COMPLETED transactions
- **Payouts**: Sum of COMPLETED payouts for the month
- **Balance**: Can be positive (partner owes merchant) or negative (merchant owes partner)

## Payout Methods

Supported payout methods:
- `BANK_TRANSFER` - Bank transfer
- `STRIPE` - Stripe payout
- `PAYPAL` - PayPal transfer
- `WIRE` - Wire transfer
- `WISE` - Wise transfer

## Access Control

### Merchant Users
- ✅ **Can**: Create payouts
- ✅ **Can**: Update payout status
- ✅ **Can**: View all payouts
- ✅ **Can**: View outstanding balances
- ❌ **Cannot**: Delete payouts (use status = CANCELLED)

### Partner Users
- ✅ **Can**: View payouts (read-only)
- ✅ **Can**: View outstanding balances (read-only)
- ❌ **Cannot**: Create payouts
- ❌ **Cannot**: Update payouts
- ❌ **Cannot**: Delete payouts

## API Endpoints

### Create Payout (Merchant Only)

```bash
POST /api/payouts
Authorization: Bearer <merchant-token>
Content-Type: application/json

{
  "partnerId": "partner-uuid",
  "amountCents": 50000,
  "currency": "USD",
  "payoutMethod": "WISE",
  "payoutReference": "WISE-12345",
  "description": "Monthly payout for January",
  "scheduledDate": "2024-01-31",
  "agreementId": "agreement-uuid",  // Optional
  "metadata": {}  // Optional
}
```

**Access:** Merchant users (owner/manager/accountant)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payout-uuid",
    "merchant_id": "merchant-uuid",
    "partner_id": "partner-uuid",
    "amount_cents": 50000,
    "currency": "USD",
    "status": "PENDING",
    "payout_method": "WISE",
    "payout_reference": "WISE-12345",
    "description": "Monthly payout for January",
    "scheduled_date": "2024-01-31",
    "processed_at": null,
    "metadata": {
      "agreement_id": "agreement-uuid"
    },
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
}
```

### Update Payout Status (Merchant Only)

```bash
PUT /api/payouts/:payoutId
Authorization: Bearer <merchant-token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "processedAt": "2024-01-31T12:00:00Z",
  "payoutReference": "WISE-12345-UPDATED",
  "description": "Updated description"
}
```

**Access:** Merchant users (owner/manager/accountant)

### Get Payouts (Merchant)

```bash
GET /api/payouts/merchant?page=1&limit=20&partnerId=uuid&status=COMPLETED&payoutMethod=WISE&year=2024&month=1
Authorization: Bearer <merchant-token>
```

**Access:** Merchant users

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `partnerId` - Filter by partner
- `status` - Filter by status (PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED)
- `payoutMethod` - Filter by method
- `year` - Filter by year
- `month` - Filter by month

### Get Payouts (Partner - Read Only)

```bash
GET /api/payouts/partner?page=1&limit=20&merchantId=uuid&status=COMPLETED&year=2024&month=1
Authorization: Bearer <partner-token>
```

**Access:** Partner users (read-only)

**Query Parameters:** Same as merchant endpoint

### Get Outstanding Balance (Merchant)

```bash
GET /api/payouts/outstanding-balance?partnerId=uuid&year=2024&month=1&agreementId=uuid
Authorization: Bearer <merchant-token>
```

**Access:** Merchant users

**Query Parameters:**
- `partnerId` - Required
- `year` - Optional (defaults to current year)
- `month` - Optional (defaults to current month)
- `agreementId` - Optional (filter by specific agreement)

**Response:**
```json
{
  "success": true,
  "data": {
    "partner_id": "partner-uuid",
    "merchant_id": "merchant-uuid",
    "agreement_id": "agreement-uuid",
    "year": 2024,
    "month": 1,
    "total_partner_share_cents": 75000,
    "total_payouts_cents": 50000,
    "outstanding_balance_cents": 25000,
    "currency": "USD"
  }
}
```

### Get Outstanding Balance (Partner - Read Only)

```bash
GET /api/payouts/outstanding-balance/partner?merchantId=uuid&year=2024&month=1&agreementId=uuid
Authorization: Bearer <partner-token>
```

**Access:** Partner users (read-only)

### Get Outstanding Balance History

```bash
GET /api/payouts/outstanding-balance/history?partnerId=uuid&limit=12
Authorization: Bearer <merchant-token>

# OR for partners
GET /api/payouts/outstanding-balance/history?merchantId=uuid&limit=12
Authorization: Bearer <partner-token>
```

**Access:** Both merchant and partner users

**Query Parameters:**
- `partnerId` - Required for merchant users
- `merchantId` - Required for partner users
- `limit` - Number of months (default: 12)

## Payout Status Flow

```
PENDING → PROCESSING → COMPLETED
              ↓
           FAILED
              ↓
          CANCELLED
```

- **PENDING**: Payout created but not yet processed
- **PROCESSING**: Payout is being processed
- **COMPLETED**: Payout successfully completed (counts toward outstanding balance)
- **FAILED**: Payout failed
- **CANCELLED**: Payout cancelled (does not count toward outstanding balance)

## Outstanding Balance Calculation

### Monthly Calculation

1. **Calculate Partner Share**:
   - Sum `partner_share_cents` from `transaction_agreement_links`
   - Only COMPLETED transactions
   - Only PAYMENT transactions (excludes refunds)
   - For the specified month

2. **Calculate Payouts**:
   - Sum `amount_cents` from `payouts`
   - Only COMPLETED payouts
   - For the specified month
   - Matching merchant_id and partner_id

3. **Calculate Balance**:
   - `outstanding_balance_cents = total_partner_share_cents - total_payouts_cents`

### Agreement-Specific Balance

If `agreementId` is provided:
- Only includes transactions linked to that agreement
- Only includes payouts with matching `agreement_id` in metadata

## Important Notes

1. **Payouts Do NOT Alter Historical Calculations**:
   - Payouts are separate from transaction calculations
   - Revenue splits remain unchanged
   - Outstanding balance is calculated dynamically

2. **Only COMPLETED Payouts Count**:
   - PENDING, PROCESSING, FAILED, CANCELLED payouts do not affect balance
   - Only COMPLETED payouts reduce outstanding balance

3. **Partner Access**:
   - Partners can only view payouts for linked merchants
   - Partners cannot create or modify payouts
   - Partners can view outstanding balances for transparency

4. **Agreement Linking**:
   - Payouts can be linked to specific agreements via `agreementId`
   - Stored in `metadata.agreement_id`
   - Allows agreement-specific balance tracking

## Example Scenarios

### Scenario 1: Monthly Payout

**January Transactions:**
- Partner share: $1,000.00 (100000 cents)

**January Payouts:**
- Payout 1: $500.00 (COMPLETED)
- Payout 2: $300.00 (PENDING)

**Outstanding Balance:**
- Total partner share: $1,000.00
- Total payouts: $500.00 (only COMPLETED)
- Outstanding balance: $500.00

### Scenario 2: Multiple Payouts

**February Transactions:**
- Partner share: $2,000.00

**February Payouts:**
- Payout 1: $800.00 (COMPLETED)
- Payout 2: $600.00 (COMPLETED)
- Payout 3: $400.00 (FAILED)

**Outstanding Balance:**
- Total partner share: $2,000.00
- Total payouts: $1,400.00 (only COMPLETED)
- Outstanding balance: $600.00

### Scenario 3: Overpayment

**March Transactions:**
- Partner share: $1,500.00

**March Payouts:**
- Payout 1: $2,000.00 (COMPLETED)

**Outstanding Balance:**
- Total partner share: $1,500.00
- Total payouts: $2,000.00
- Outstanding balance: -$500.00 (negative = merchant overpaid)

## Best Practices

1. **Record Payouts Immediately**: Record payouts when initiated, update status when completed
2. **Use Scheduled Date**: Set `scheduledDate` to the actual payout date for accurate monthly tracking
3. **Link to Agreements**: Use `agreementId` for agreement-specific balance tracking
4. **Update Status Promptly**: Update payout status to COMPLETED when confirmed
5. **Monitor Negative Balances**: Negative balances indicate overpayment

