# Customer-Aware Schema & Migration Design

This design makes the system customer-aware while preserving existing flows for normal buyers. Customers are optional for sales, but REQUIRED for any debt record.

## Principles
- Normal sales continue to work with no `customer_id`.
- Only buyers with debts must be added as customers.
- Aggregate debts per customer across multiple sales.
- Preserve history and add minimal, backward-compatible changes.

## New/Updated Tables

### customers (new)
- id INTEGER PRIMARY KEY AUTOINCREMENT
- name TEXT NOT NULL
- phone TEXT UNIQUE NULL
- email TEXT NULL
- address TEXT NULL
- note TEXT NULL
- is_deleted BOOLEAN NOT NULL DEFAULT 0
- created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
- updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

Indexes:
- UNIQUE(phone) where phone IS NOT NULL
- INDEX(name)

### sales (updated)
- Add column `customer_id` INTEGER NULL REFERENCES customers(id) ON DELETE RESTRICT

Notes:
- Nullable to keep normal buyer flow.
- When present, links a sale to a customer for reporting.

### debts (updated)
Current system records debt per sale. We add `customer_id` for direct aggregation.
- Add column `customer_id` INTEGER NOT NULL REFERENCES customers(id) ON DELETE RESTRICT

Notes:
- For any new debt, `customer_id` is mandatory (enforced at API level). Migration backfills from related sale when available.

### payment_history (updated)
- Optional: Add `customer_id` INTEGER NULL REFERENCES customers(id)

Notes:
- Denormalization for faster queries on customer statements. Backfill via join to debts/sales when possible.

## Migrations (server/db/migrations)
1) 011_create_customers.sql
- Create `customers`
- Indexes on `name`, unique on `phone`

2) 012_add_customer_id_to_sales.sql
- ALTER TABLE sales ADD COLUMN customer_id INTEGER NULL REFERENCES customers(id)
- INDEX on sales(customer_id)

3) 013_add_customer_id_to_debts.sql
- ALTER TABLE debts ADD COLUMN customer_id INTEGER NULL REFERENCES customers(id)
- Backfill debts.customer_id from sales.customer_id where possible
- After backfill, set NOT NULL constraint on debts.customer_id
- INDEX on debts(customer_id)

4) 014_add_customer_id_to_payment_history.sql (optional but recommended)
- ALTER TABLE payment_history ADD COLUMN customer_id INTEGER NULL REFERENCES customers(id)
- Backfill via join to debts
- INDEX on payment_history(customer_id)

5) 015_covering_indexes_customers_sales_debts.sql
- Add useful indexes for aggregates and lookups

## Backfill Strategy
- Create customers for clearly identified debtors only:
  - If a debt’s sale has a payer name/phone field (if present), try to match by exact phone, else case-insensitive name.
  - If no reliable identifier exists, require manual assignment via UI later. Leave sales.customer_id NULL and temporarily allow debts.customer_id NULL during migration; then only enforce NOT NULL after manual pass or set to an "Unknown" placeholder customer if business prefers.
- For existing non-debt sales, do not create customers.

## Constraints & Validation
- API rule: creating a debt requires a valid `customer_id`.
- Prevent deleting customers with outstanding balance (`ON DELETE RESTRICT` + server validation).
- Optional uniqueness: allow duplicate names; encourage unique phone when available.

## Query Patterns
- Customer balance: sum(open debt amounts) grouped by customer_id.
- Statement: list of debts and payments filtered by customer_id, ordered by date.
- Reports: sales totals and averages by customer_id (filterable), while still supporting anonymous sales (customer_id IS NULL).

## Example SQL Sketches

-- 011_create_customers.sql
```sql
CREATE TABLE IF NOT EXISTS customers (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	phone TEXT UNIQUE,
	email TEXT,
	address TEXT,
	note TEXT,
	is_deleted INTEGER NOT NULL DEFAULT 0,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
```

-- 012_add_customer_id_to_sales.sql
```sql
ALTER TABLE sales ADD COLUMN customer_id INTEGER REFERENCES customers(id);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
```

-- 013_add_customer_id_to_debts.sql
```sql
ALTER TABLE debts ADD COLUMN customer_id INTEGER REFERENCES customers(id);
-- Backfill example (SQLite syntax may vary based on current schema):
UPDATE debts
SET customer_id = (
	SELECT s.customer_id FROM sales s WHERE s.id = debts.sale_id
)
WHERE customer_id IS NULL;
-- After manual review and data hygiene, enforce NOT NULL if desired:
-- This may require table rebuild in SQLite to add NOT NULL.
```

-- 014_add_customer_id_to_payment_history.sql (optional)
```sql
ALTER TABLE payment_history ADD COLUMN customer_id INTEGER REFERENCES customers(id);
UPDATE payment_history p
SET customer_id = (
	SELECT d.customer_id FROM debts d WHERE d.id = p.debt_id
)
WHERE customer_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_payment_history_customer_id ON payment_history(customer_id);
```

## UI/UX Implications (for next tasks)
- Sales form: customer is optional; add search-and-create for customers.
- Debts creation: require selecting a customer first.
- Customer directory and profile show balances and history.

## Risks
- Duplicate customers: plan merge flow to reassign sales/debts/payments.
- Legacy records without identifiers: require manual assignment before enforcing strict NOT NULL on debts.customer_id.
