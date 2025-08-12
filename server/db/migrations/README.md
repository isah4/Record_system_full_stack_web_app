# Database Migrations

## Latest Migration: Add Subcategory and Recurring Fields to Expenses

This migration adds two new fields to the expenses table:
- `subcategory`: A VARCHAR field to store the subcategory of the expense
- `recurring`: A BOOLEAN field to indicate if the expense is recurring

### How to Apply the Migration

Run the following command from the server directory:

```bash
npm run migrate
```

This will execute the migration script and apply the changes to the database.

### Verification

After running the migration, you can verify that the fields were added by querying the expenses table:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'expenses';
```

You should see the new `subcategory` and `recurring` fields in the results.