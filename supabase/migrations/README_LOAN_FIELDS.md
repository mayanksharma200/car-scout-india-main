# Loan Fields Migration for Leads Table

## Problem
The loan application form was failing with error: "Could not find the 'emi_amount' column of 'leads' in the schema cache"

## Solution
Added missing columns to the `leads` table to support loan application functionality.

## Migration File
`20250106_add_loan_fields_to_leads.sql`

## New Columns Added
- `employment_type` (TEXT) - Type of employment: salaried, self_employed, business, professional
- `monthly_income` (INTEGER) - Monthly income in rupees
- `loan_amount` (INTEGER) - Requested loan amount in rupees
- `emi_amount` (NUMERIC(10, 2)) - Calculated EMI amount per month
- `message` (TEXT) - Additional information or requirements from the lead

## How to Apply This Migration

### Option 1: Via Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `20250106_add_loan_fields_to_leads.sql`
5. Click **Run** to execute the migration

### Option 2: Via Supabase CLI (If you have it configured)
```bash
# Make sure you're logged in
supabase login

# Link to your project (if not already linked)
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### Option 3: Manual SQL Execution
Run this SQL directly in your database:

```sql
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS employment_type TEXT,
ADD COLUMN IF NOT EXISTS monthly_income INTEGER,
ADD COLUMN IF NOT EXISTS loan_amount INTEGER,
ADD COLUMN IF NOT EXISTS emi_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS message TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_loan_amount ON public.leads(loan_amount);
CREATE INDEX IF NOT EXISTS idx_leads_employment_type ON public.leads(employment_type);
```

## Graceful Fallback
The code has been updated with graceful error handling. If the migration hasn't been applied yet:
- The form will still work and save basic lead information
- A warning will be shown to the user
- All data will be preserved once the migration is applied

## Testing
After applying the migration:
1. Go to the car detail page or EMI calculator
2. Click "Get Pre-Approved Loan" button
3. Fill out the form with all details
4. Submit the form
5. Verify the lead is created with all loan fields in the database

## Verification
Run this query to verify the columns exist:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'leads'
AND column_name IN ('employment_type', 'monthly_income', 'loan_amount', 'emi_amount', 'message');
```

You should see all 5 columns listed.
