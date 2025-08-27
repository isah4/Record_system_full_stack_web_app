# Rollout & Monitoring Plan

## Pre-deploy
- Backup DB.
- Apply migrations 011–015.
- Smoke test API locally: customers CRUD, sales with customer_id, debts summary.

## Deploy steps
1. Deploy server with new routes and schema.
2. Run backfill: `npm run backfill-customers` in server.
3. Verify:
   - Random indebted buyers now have customers.
   - Debts summary shows aggregated outstanding per customer.
   - Sales creation: debt requires customer_id.

## Feature flag (optional)
- UI: hide customer selection behind env flag; enable after verification.

## Monitoring
- Log 400s for debt sales missing customer_id.
- Track counts of debts with NULL customer_id (should be ~0 after backfill).
- Error rates on `/api/customers`, `/api/debts/customers/summary`, `/api/debts/customers/:id/payments`.

## Rollback
- If needed, revert to previous server build; migrations are additive and safe to keep.

## Post-deploy tasks
- Train staff: debt sales must pick customer.
- Periodically merge duplicate customers.
