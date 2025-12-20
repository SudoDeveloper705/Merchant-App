# Revenue Split Engine

## Overview

Revenue split engine for Merchant App that calculates partner and merchant shares based on agreements. Supports percentage-based splits and minimum guarantee settlements.

## Features

- ✅ Agreement matching with priority rules
- ✅ Percentage-based revenue splits
- ✅ Minimum guarantee (monthly settlement)
- ✅ Hybrid agreements (percentage + minimum guarantee)
- ✅ Edge case handling (refunds, missing clients)
- ✅ Automatic processing on transaction creation/sync

## Agreement Types

### 1. PERCENTAGE
- Simple percentage split
- Partner share = `percentage_rate * subtotal_cents`
- Merchant share = `subtotal_cents - partner_share_cents`

### 2. MINIMUM_GUARANTEE
- Percentage split at transaction level
- Minimum guarantee applied at monthly settlement
- If monthly partner share < minimum guarantee, adjust to minimum

### 3. HYBRID
- Combination of percentage and minimum guarantee
- Percentage applied at transaction level
- Minimum guarantee enforced at monthly settlement

## Agreement Matching Rules

1. **Active Agreement**: Must be active and within date range
2. **Client-Specific Override**: Client-specific agreements override global agreements
3. **Priority**: Higher priority agreements override lower priority
4. **One Agreement Per Transaction**: Only one agreement applies per transaction

### Matching Priority Order

1. Client-specific agreements (client_id IS NOT NULL)
2. Global agreements (client_id IS NULL)
3. Higher priority within each group
4. Newer agreements as tiebreaker

## Calculation Rules

### Transaction Level

- **Base Amount**: Uses `subtotal_cents` only (excludes sales tax)
- **Partner Share**: `percentage_rate * subtotal_cents`
- **Merchant Share**: `subtotal_cents - partner_share_cents`
- **Minimum Guarantee**: NOT applied at transaction level (applied at settlement)

### Monthly Settlement

- Calculates total partner share for the month
- If total < minimum guarantee:
  - Adjustment = `minimum_guarantee_cents - total_partner_share_cents`
  - Final partner share = `minimum_guarantee_cents`
  - Adjustment distributed proportionally across transactions

## Edge Cases

### Refunds

- Refunds reverse the original transaction's revenue split
- Partner share and merchant share are reversed
- Uses the same agreement as the original transaction

### Missing Clients

- Transactions without client_id use global agreements
- If no global agreement exists, no revenue split is calculated

### Failed/Cancelled Transactions

- Revenue split is removed for failed/cancelled transactions
- Only COMPLETED transactions have revenue splits

### Status Changes

- When transaction status changes to COMPLETED, revenue split is calculated
- When status changes to FAILED/CANCELLED, revenue split is removed

## API Endpoints

### Process Monthly Settlement

```bash
POST /api/revenue-split/settlement/:agreementId
Authorization: Bearer <merchant-token>
Content-Type: application/json

{
  "year": 2024,
  "month": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "agreement_id": "uuid",
    "merchant_id": "uuid",
    "partner_id": "uuid",
    "year": 2024,
    "month": 1,
    "calculated_partner_share_cents": 15000,
    "minimum_guarantee_cents": 20000,
    "final_partner_share_cents": 20000,
    "adjustment_cents": 5000,
    "transaction_count": 10
  }
}
```

### Process All Monthly Settlements

```bash
POST /api/revenue-split/settlement/all
Authorization: Bearer <merchant-token>
Content-Type: application/json

{
  "year": 2024,
  "month": 1
}
```

### Get Settlement History

```bash
GET /api/revenue-split/settlement/:agreementId/history?limit=12
Authorization: Bearer <merchant-token>
```

### Recalculate Transaction Revenue Split

```bash
POST /api/revenue-split/recalculate/:transactionId
Authorization: Bearer <merchant-token>
```

### Bulk Recalculate

```bash
POST /api/revenue-split/recalculate/bulk
Authorization: Bearer <merchant-token>
Content-Type: application/json

{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z"
}
```

## Integration

### Automatic Processing

Revenue splits are automatically calculated when:
- Transaction is created with status = COMPLETED
- Transaction status changes to COMPLETED
- Stripe transactions are synced (if COMPLETED)

### Manual Processing

Use the recalculate endpoints to:
- Fix calculation errors
- Recalculate after agreement changes
- Backfill historical transactions

## Monthly Settlement Pseudocode

```
FUNCTION processMonthlySettlement(agreementId, year, month):
  // Get agreement details
  agreement = GET agreement WHERE id = agreementId
  
  // Get monthly revenue summary
  summary = getMonthlyRevenueSummary(agreementId, year, month)
  
  // Calculate base partner share
  calculatedShare = summary.total_partner_share_cents
  
  // Apply minimum guarantee if applicable
  IF agreement.type IN ('MINIMUM_GUARANTEE', 'HYBRID'):
    IF agreement.minimum_guarantee_cents > calculatedShare:
      adjustment = agreement.minimum_guarantee_cents - calculatedShare
      finalShare = agreement.minimum_guarantee_cents
      
      // Distribute adjustment proportionally
      FOR EACH transaction IN month:
        proportion = transaction.partner_share / calculatedShare
        transactionAdjustment = adjustment * proportion
        UPDATE transaction_agreement_links:
          partner_share_cents += transactionAdjustment
          merchant_share_cents -= transactionAdjustment
    ELSE:
      finalShare = calculatedShare
      adjustment = 0
  ELSE:
    finalShare = calculatedShare
    adjustment = 0
  
  RETURN {
    calculated_partner_share_cents: calculatedShare,
    minimum_guarantee_cents: agreement.minimum_guarantee_cents,
    final_partner_share_cents: finalShare,
    adjustment_cents: adjustment
  }
END FUNCTION
```

## Database Schema

### transaction_agreement_links

Stores the calculated revenue split for each transaction:

- `transaction_id` - Links to transaction
- `agreement_id` - Links to agreement used
- `partner_share_cents` - Calculated partner share
- `merchant_share_cents` - Calculated merchant share
- `calculation_method` - Method used (PERCENTAGE, MINIMUM_GUARANTEE, HYBRID)

## Example Scenarios

### Scenario 1: Simple Percentage

**Agreement:**
- Type: PERCENTAGE
- Percentage: 15% (0.15)

**Transaction:**
- Subtotal: $100.00 (10000 cents)

**Calculation:**
- Partner share: 10000 * 0.15 = 1500 cents ($15.00)
- Merchant share: 10000 - 1500 = 8500 cents ($85.00)

### Scenario 2: Minimum Guarantee

**Agreement:**
- Type: MINIMUM_GUARANTEE
- Percentage: 10% (0.10)
- Minimum guarantee: $500.00/month (50000 cents)

**Month Transactions:**
- Total subtotal: $3000.00 (300000 cents)
- Calculated partner share: 300000 * 0.10 = 30000 cents ($300.00)

**Settlement:**
- Calculated: $300.00
- Minimum: $500.00
- Adjustment: $200.00
- Final partner share: $500.00

### Scenario 3: Client-Specific Override

**Global Agreement:**
- Type: PERCENTAGE
- Percentage: 10%
- Priority: 0

**Client-Specific Agreement:**
- Type: PERCENTAGE
- Percentage: 20%
- Priority: 1
- Client ID: client-123

**Transaction with Client:**
- Uses client-specific agreement (20%)
- Transaction without client: Uses global agreement (10%)

## Best Practices

1. **Set Priorities**: Use priority field to control which agreement applies
2. **Client-Specific First**: Client-specific agreements automatically have higher priority
3. **Monthly Settlement**: Run settlement after month-end for minimum guarantee agreements
4. **Recalculate After Changes**: Recalculate revenue splits after agreement updates
5. **Monitor Adjustments**: Track adjustment_cents to understand minimum guarantee impact

