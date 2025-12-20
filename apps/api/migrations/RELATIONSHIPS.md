# Database Table Relationships

## Core Entity Relationships

### 1. Merchants & Partners (Base Entities)
- **merchants**: Core merchant businesses
- **partners**: Partner businesses that work with merchants
- Independent entities, linked through `merchant_partner_links`

### 2. User Management

#### Merchant Users
```
merchants (1) ──< (many) users
```
- Each `user` belongs to exactly one `merchant`
- Users can only access their merchant's data
- Cascade delete: deleting a merchant deletes all its users

#### Partner Users
```
partners (1) ──< (many) partner_users
```
- Each `partner_user` belongs to exactly one `partner`
- Partner users can only access merchants through `merchant_partner_links`
- Cascade delete: deleting a partner deletes all its users

### 3. Merchant-Partner Links
```
merchants (many) ──< (many) merchant_partner_links >── (many) partners
```
- Many-to-many relationship between merchants and partners
- **Security**: Partner users can ONLY access merchants that have an active link
- Enforces access control: no direct merchant access without a link
- Unique constraint prevents duplicate links

### 4. Clients
```
merchants (1) ──< (many) clients
```
- Each `client` belongs to exactly one `merchant`
- Optional relationship for transactions and agreements
- Cascade delete: deleting a merchant deletes all its clients

### 5. Agreements
```
merchants (1) ──< (many) agreements >── (1) partners
clients (1) ──< (many) agreements (optional)
```
- Links a `merchant` and `partner` with business terms
- Optional `client_id` for client-specific agreements
- Supports:
  - **PERCENTAGE**: Revenue share based on percentage
  - **MINIMUM_GUARANTEE**: Fixed minimum amount
  - **HYBRID**: Combination of both
- Cascade delete: deleting merchant/partner deletes agreements

### 6. Transactions
```
merchants (1) ──< (many) transactions
clients (1) ──< (many) transactions (optional)
```
- Each `transaction` belongs to exactly one `merchant`
- Optional `client_id` for client-specific transactions
- Monetary fields (all in cents):
  - `subtotal_cents`: Amount before tax
  - `sales_tax_cents`: Tax amount
  - `total_cents`: Subtotal + tax
  - `fees_cents`: Processing fees
  - `net_cents`: Total - fees
- Cascade delete: deleting merchant deletes transactions

### 7. Transaction-Agreement Links
```
transactions (1) ──< (many) transaction_agreement_links >── (1) agreements
```
- Links transactions to applicable agreements
- Stores computed shares:
  - `partner_share_cents`: Amount allocated to partner
  - `merchant_share_cents`: Amount allocated to merchant
- Multiple agreements can apply to one transaction
- Unique constraint: one link per transaction-agreement pair
- Cascade delete: deleting transaction/agreement deletes links

### 8. Expenses
```
merchants (1) ──< (many) expenses
```
- Each `expense` belongs to exactly one `merchant`
- Tracks merchant operational costs
- Cascade delete: deleting merchant deletes expenses

### 9. Payouts
```
merchants (1) ──< (many) payouts (optional)
partners (1) ──< (many) payouts (optional)
```
- Payouts can be to either a `merchant` OR a `partner` (not both)
- Enforced by CHECK constraint
- Tracks payment distributions
- Set NULL on delete (preserves payout history)

### 10. Payment Processors
```
merchants (1) ──< (many) merchant_payment_processors
```
- Each merchant can have multiple payment processor connections
- Supports Stripe, PayPal, Square, etc.
- Stores encrypted API keys and webhook secrets
- One default processor per merchant
- Cascade delete: deleting merchant deletes processor connections

### 11. Audit Logs
```
users ──< (many) audit_logs (optional)
partner_users ──< (many) audit_logs (optional)
merchants ──< (many) audit_logs (optional)
partners ──< (many) audit_logs (optional)
```
- Tracks all system actions
- Can reference users or partner_users
- Can reference merchants or partners for context
- Stores action, resource type, changes, and metadata
- Set NULL on delete (preserves audit history)

## Access Control Flow

### Merchant User Access
1. User authenticates → belongs to a merchant
2. User can access:
   - Their merchant's data
   - Clients of their merchant
   - Transactions of their merchant
   - Agreements involving their merchant

### Partner User Access
1. Partner user authenticates → belongs to a partner
2. Partner user can ONLY access:
   - Merchants linked via `merchant_partner_links` (where `is_active = true`)
   - Agreements where their partner is involved AND merchant is linked
   - Transactions linked to those agreements
   - **Cannot directly access merchant data without a link**

## Key Constraints

1. **Unique Constraints**:
   - `(merchant_id, email)` in users
   - `(partner_id, email)` in partner_users
   - `(merchant_id, partner_id)` in merchant_partner_links
   - `(transaction_id, agreement_id)` in transaction_agreement_links
   - `(merchant_id, processor_type, processor_account_id)` in merchant_payment_processors

2. **Check Constraints**:
   - Agreement types: PERCENTAGE, MINIMUM_GUARANTEE, HYBRID
   - Transaction types: PAYMENT, REFUND, CHARGEBACK
   - Transaction statuses: PENDING, COMPLETED, FAILED, CANCELLED
   - Payout must have either merchant_id OR partner_id (not both)

3. **Cascade Rules**:
   - Deleting merchant → deletes users, clients, transactions, expenses, agreements, links
   - Deleting partner → deletes partner_users, agreements, links
   - Deleting transaction → deletes transaction_agreement_links
   - Deleting agreement → deletes transaction_agreement_links

