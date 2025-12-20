# Stripe Integration Guide

## Overview

Read-only Stripe integration for Merchant App MVP. Supports Stripe Connect, syncs payments, fees, and payouts, and stores raw Stripe data for audit/debug purposes.

## Features

- ✅ Stripe Connect support
- ✅ Encrypted credential storage
- ✅ Webhook endpoint with signature verification
- ✅ Manual and automatic transaction sync
- ✅ Data normalization (Stripe → Transactions table)
- ✅ Raw Stripe JSON storage in metadata
- ✅ Payout synchronization
- ✅ Read-only (no transfers)

## Architecture

### Components

1. **Encryption Service** (`src/utils/encryption.ts`)
   - Encrypts/decrypts API keys and webhook secrets
   - Uses AES-256-GCM encryption
   - Requires `ENCRYPTION_KEY` environment variable

2. **Stripe Service** (`src/services/stripe.ts`)
   - Stripe API client management
   - Fetches payments, charges, payouts
   - Handles Stripe Connect accounts

3. **Data Normalizer** (`src/services/stripeNormalizer.ts`)
   - Converts Stripe data to our transaction format
   - Maps Stripe statuses to our statuses
   - Calculates fees, taxes, net amounts

4. **Sync Service** (`src/services/stripeSync.ts`)
   - Idempotent sync function (safe to run multiple times)
   - Upserts transactions and payouts
   - Handles webhook events

5. **Stripe Routes** (`src/routes/stripe.ts`)
   - Connect/disconnect Stripe accounts
   - Manual sync endpoint
   - Webhook handler
   - Account info endpoint

## Setup

### 1. Environment Variables

```env
# Encryption key (32 bytes hex or any string)
ENCRYPTION_KEY=your-32-byte-hex-encryption-key-change-in-production

# Stripe (optional - for testing)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2. Database Migration

Run the migration to add `source` column to transactions:

```bash
psql $DATABASE_URL -f apps/api/migrations/015_add_source_to_transactions.sql
```

### 3. Install Dependencies

```bash
npm install
```

## API Endpoints

### Connect Stripe Account

```bash
POST /api/stripe/connect
Authorization: Bearer <merchant-token>
Content-Type: application/json

{
  "apiKey": "sk_live_...",
  "webhookSecret": "whsec_...",
  "processorAccountId": "acct_...",
  "isDefault": true
}
```

**Access:** Merchant users (owner/manager)

### Get Stripe Account Info

```bash
GET /api/stripe/account
Authorization: Bearer <merchant-token>
```

**Access:** Merchant users

### Manual Sync

```bash
POST /api/stripe/sync
Authorization: Bearer <merchant-token>
Content-Type: application/json

{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-12-31T23:59:59Z",
  "limit": 100,
  "processorId": "processor-uuid" // Optional
}
```

**Access:** Merchant users (owner/manager)

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionsCreated": 150,
    "transactionsUpdated": 10,
    "payoutsCreated": 5,
    "payoutsUpdated": 2,
    "errors": []
  }
}
```

### Get Sync Status

```bash
GET /api/stripe/sync/status
Authorization: Bearer <merchant-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lastSync": "2024-01-15T10:30:00Z",
    "totalTransactions": 1250,
    "processors": [
      {
        "id": "processor-uuid",
        "processor_account_id": "acct_...",
        "is_default": true,
        "connected_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Webhook Endpoint

```bash
POST /api/stripe/webhook
Stripe-Signature: <signature>
Content-Type: application/json

<stripe-event-json>
```

**Access:** Public (signature verification)

## Data Mapping

### Transaction Mapping

| Stripe Field | Our Field | Notes |
|-------------|-----------|-------|
| `charge.id` | `external_id` | Stripe charge ID |
| `charge.amount` | `total_cents` | Total amount |
| `charge.amount - tax` | `subtotal_cents` | If tax present |
| `charge.metadata.tax_amount` | `sales_tax_cents` | From metadata |
| `balance_transaction.fee` | `fees_cents` | Processing fees |
| `total - fees` | `net_cents` | Net amount |
| `charge.status` | `status` | Mapped to our statuses |
| `charge.created` | `transaction_date` | Unix timestamp |
| `charge.currency` | `currency` | Uppercased |
| Full charge object | `metadata.raw_stripe_data` | For audit/debug |

### Status Mapping

| Stripe Status | Our Status |
|--------------|------------|
| `succeeded` | `COMPLETED` |
| `failed` | `FAILED` |
| `pending` | `PENDING` |
| `refunded` | `COMPLETED` (type: REFUND) |

### Transaction Types

- **PAYMENT**: Normal charge
- **REFUND**: Refunded charge
- **CHARGEBACK**: Disputed charge

## Webhook Events

Supported events:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.succeeded`
- `charge.failed`
- `charge.refunded`
- `payout.paid`
- `payout.failed`
- `payout.canceled`

## Security

### Credential Storage

- API keys encrypted using AES-256-GCM
- Stored in `merchant_payment_processors.api_key_encrypted`
- Webhook secrets encrypted separately
- Encryption key from `ENCRYPTION_KEY` env var

### Webhook Verification

- Uses Stripe signature verification
- Verifies against all active merchant webhook secrets
- Returns 400 if signature invalid
- Processes event only after verification

## Usage Examples

### Connect Stripe Account

```typescript
const response = await fetch('http://localhost:3001/api/stripe/connect', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    apiKey: 'sk_live_...',
    webhookSecret: 'whsec_...',
    processorAccountId: 'acct_...',
    isDefault: true,
  }),
});
```

### Manual Sync

```typescript
const response = await fetch('http://localhost:3001/api/stripe/sync', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    startDate: '2024-01-01T00:00:00Z',
    endDate: '2024-12-31T23:59:59Z',
    limit: 100,
  }),
});

const { data } = await response.json();
console.log(`Synced ${data.transactionsCreated} transactions`);
```

### Background Sync (Cron Job)

```typescript
// Run every hour
import { syncStripeTransactions } from './services/stripeSync';

async function backgroundSync() {
  const merchants = await db.query(
    `SELECT DISTINCT merchant_id FROM merchant_payment_processors 
     WHERE processor_type = 'STRIPE' AND is_active = true`
  );

  for (const merchant of merchants.rows) {
    try {
      await syncStripeTransactions(merchant.merchant_id, {
        limit: 100,
        // Sync last 24 hours
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      });
    } catch (error) {
      console.error(`Sync failed for merchant ${merchant.merchant_id}:`, error);
    }
  }
}
```

## Error Handling

The sync function is idempotent and handles errors gracefully:

- Individual transaction errors don't stop the sync
- Errors are collected and returned in the response
- Duplicate transactions are updated (not re-inserted)
- Webhook processing errors return 200 to prevent Stripe retries

## Limitations (MVP)

- Read-only (no transfers)
- Webhook merchant detection by trying all secrets (not ideal for production)
- Fee calculation from balance transactions (may need enhancement)
- Tax calculation from metadata (Stripe doesn't separate tax by default)

## Future Enhancements

1. Use webhook endpoint IDs for better merchant detection
2. Fetch balance transactions for accurate fee calculation
3. Support Stripe Connect OAuth flow
4. Add sync scheduling/background jobs
5. Support multiple Stripe accounts per merchant
6. Add sync history/audit log

