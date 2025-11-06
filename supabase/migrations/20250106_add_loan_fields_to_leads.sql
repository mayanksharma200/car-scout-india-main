-- Add loan-related columns to leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS employment_type TEXT,
ADD COLUMN IF NOT EXISTS monthly_income INTEGER,
ADD COLUMN IF NOT EXISTS loan_amount INTEGER,
ADD COLUMN IF NOT EXISTS emi_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS message TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_leads_loan_amount ON public.leads(loan_amount);
CREATE INDEX IF NOT EXISTS idx_leads_employment_type ON public.leads(employment_type);

-- Add comment to document the columns
COMMENT ON COLUMN public.leads.employment_type IS 'Type of employment: salaried, self_employed, business, professional';
COMMENT ON COLUMN public.leads.monthly_income IS 'Monthly income in rupees';
COMMENT ON COLUMN public.leads.loan_amount IS 'Requested loan amount in rupees';
COMMENT ON COLUMN public.leads.emi_amount IS 'Calculated EMI amount per month';
COMMENT ON COLUMN public.leads.message IS 'Additional information or requirements from the lead';
