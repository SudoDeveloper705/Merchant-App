# Database Migrations

This directory contains PostgreSQL SQL migrations for the Merchant App MVP.

## Migration Order

Migrations must be run in numerical order:

1. `001_create_merchants.sql` - Base merchants table
2. `002_create_partners.sql` - Base partners table
3. `003_create_users.sql` - Merchant users table
4. `004_create_partner_users.sql` - Partner users table
5. `005_create_merchant_partner_links.sql` - Merchant-partner linking table
6. `006_create_clients.sql` - Clients table
7. `007_create_agreements.sql` - Agreements table
8. `008_create_transactions.sql` - Transactions table
9. `009_create_transaction_agreement_links.sql` - Transaction-agreement linking table
10. `010_create_expenses.sql` - Expenses table
11. `011_create_payouts.sql` - Payouts table
12. `012_create_merchant_payment_processors.sql` - Payment processor connections
13. `013_create_audit_logs.sql` - Audit logs table
14. `014_create_update_triggers.sql` - Automatic updated_at triggers

## Running Migrations

### Using psql

```bash
# Set your database connection
export DATABASE_URL="postgresql://user:password@localhost:5432/merchantapp"

# Run all migrations
for file in apps/api/migrations/*.sql; do
  psql $DATABASE_URL -f "$file"
done
```

### Using Node.js script

A migration runner script can be created to manage migrations programmatically.

## Design Decisions

- **UUIDs**: All primary keys use UUIDs for better distributed system support
- **Monetary Values**: Stored as `*_cents` (BIGINT) to avoid floating-point precision issues
- **Timestamps**: All tables include `created_at` and `updated_at` with automatic triggers
- **Soft Deletes**: Use `is_active` flags instead of hard deletes for auditability
- **JSONB**: Used for flexible metadata storage (PostgreSQL native JSON support)

