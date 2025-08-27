# Customer Awareness Test Plan

Scope: Verify customer-aware flows without breaking anonymous sales.

## API tests (manual or via HTTP client)
- Sale without customer (paid): should succeed; `sales.customer_id` null.
- Sale with customer (paid): should succeed; `customer_id` set.
- Sale with payment_status=debt and missing `customer_id`: should 400.
- Sale with payment_status=debt and valid `customer_id`: creates debt with same `customer_id`.
- Debts list: includes `customer_id` and buyer name.
- Customer summary: sums outstanding per `customer_id` > 0 only.
- FIFO allocation POST /api/debts/customers/:id/payments: allocates oldest-first, updates `debts`, `sales.balance`, and writes `payment_history.customer_id`.
- Repayment POST /api/debts/:id/repayment: writes `payment_history.customer_id`.
- Customers CRUD: create, update, soft-delete blocked if outstanding > 0.

## Migration/backfill
- Run migrations 011–015 in order; verify tables/columns/indexes.
- Run backfill script; verify:
  - Customers created for indebted buyer names.
  - `sales.customer_id`, `debts.customer_id`, `payment_history.customer_id` populated.

## UI flows
- Customers page: search, quick create, list, and debts summary table loads.
- Sales flow: select/create customer, submit paid/partial/debt; debt requires customer.
- Debts page: filter by customer; record repayment updates list.
- Reports: Customer Debts Overview loads and filters list.

## Edge cases
- Duplicate names: ensure linking uses selected `customer_id`, not name.
- Overpayment in FIFO: unallocated amount reported in response.
- Partial payment leads to `sales.balance` decreasing and status updating.

## Smoke checklist
- Anonymous sale works.
- Debt sale with selected customer works.
- Summary endpoint shows updated outstanding after payments.
