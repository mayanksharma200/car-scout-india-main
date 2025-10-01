-- Add missing status column and rename otp_code to otp
ALTER TABLE public.otp_verification 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Rename otp_code to otp if it exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='otp_verification' AND column_name='otp_code') THEN
    ALTER TABLE public.otp_verification RENAME COLUMN otp_code TO otp;
  END IF;
END $$;

-- Add otp column if it doesn't exist
ALTER TABLE public.otp_verification 
ADD COLUMN IF NOT EXISTS otp TEXT NOT NULL DEFAULT '';
