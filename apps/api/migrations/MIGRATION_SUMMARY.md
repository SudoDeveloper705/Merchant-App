# PostgreSQL Migrations Summary

## Migration Files (Run in Order)

| # | File | Description |
|---|------|-------------|
| 001 | `001_create_merchants.sql` | Base merchants table |
| 002 | `002_create_partners.sql` | Base partners table |
| 003 | `003_create_users.sql` | Merchant users (belong to merchants) |
| 004 | `004_create_partner_users.sql` | Partner users (belong to partners) |
| 005 | `005_create_merchant_partner_links.sql` | Links merchants and partners |
| 006 | `006_create_clients.sql` | Clients belonging to merchants |
| 007 | `007_create_agreements.sql` | Agreements between merchants and partners |
| 008 | `008_create_transactions.sql` | Financial transactions |
| 009 | `009_create_transaction_agreement_links.sql` | Links transactions to agreements with computed shares |
| 010 | `010_create_expenses.sql` | Merchant expenses |
| 011 | `011_create_payouts.sql` | Payouts to merchants or partners |
| 012 | `012_create_merchant_payment_processors.sql` | Payment processor connections (Stripe, etc.) |
| 013 | `013_create_audit_logs.sql` | Audit trail for all actions |
| 014 | `014_create_update_triggers.sql` | Automatic updated_at timestamp triggers |
| 015 | `015_add_source_to_transactions.sql` | Add source field to transactions |
| 016 | `016_add_priority_to_agreements.sql` | Add priority field to agreements |
| 017 | `017_add_wise_to_payout_methods.sql` | Add Wise to payout methods enum |

## Key Design Features

### ✅ UUID Primary Keys
All tables use UUIDs for primary keys via `uuid_generate_v4()`

### ✅ Monetary Values as Cents
All monetary values stored as `*_cents` (BIGINT) to avoid floating-point issues:
- `subtotal_cents`, `sales_tax_cents`, `total_cents`, `fees_cents`, `net_cents`
- `amount_cents`, `partner_share_cents`, `merchant_share_cents`
- `minimum_guarantee_cents`

### ✅ Timestamps
- `created_at`: Set on insert (default CURRENT_TIMESTAMP)
- `updated_at`: Auto-updated via trigger (migration 014)

### ✅ Security & Access Control
- **Partner users CANNOT directly access merchants** - must go through `merchant_partner_links`
- Unique constraints prevent duplicate relationships
- Cascade deletes maintain referential integrity

### ✅ Agreement Types
Supports three agreement types:
- **PERCENTAGE**: Revenue share based on percentage rate (0.0000 to 1.0000)
- **MINIMUM_GUARANTEE**: Fixed minimum amount in cents
- **HYBRID**: Combination of both

### ✅ Transaction Structure
Complete financial breakdown:
- `subtotal_cents`: Before tax
- `sales_tax_cents`: Tax amount
- `total_cents`: Subtotal + tax
- `fees_cents`: Processing fees
- `net_cents`: Total - fees (actual revenue)

### ✅ Computed Shares
`transaction_agreement_links` stores:
- `partner_share_cents`: Computed partner portion
- `merchant_share_cents`: Computed merchant portion
- `calculation_method`: How it was calculated

## Table Relationships Quick Reference

```
merchants (1) ──< (many) users
merchants (1) ──< (many) clients
merchants (1) ──< (many) transactions
merchants (1) ──< (many) expenses
merchants (1) ──< (many) merchant_payment_processors

partners (1) ──< (many) partner_users

merchants (many) ──< (many) merchant_partner_links >── (many) partners

merchants (1) ──< (many) agreements >── (1) partners
clients (1) ──< (many) agreements (optional)

transactions (1) ──< (many) transaction_agreement_links >── (1) agreements

merchants (1) ──< (many) payouts (optional)
partners (1) ──< (many) payouts (optional)
```

## Running Migrations

```bash
# Using psql
psql $DATABASE_URL -f apps/api/migrations/001_create_merchants.sql
psql $DATABASE_URL -f apps/api/migrations/002_create_partners.sql
# ... continue for all migrations
```

See `README.md` for detailed instructions.

