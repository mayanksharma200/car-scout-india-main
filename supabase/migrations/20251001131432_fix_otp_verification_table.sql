-- Add missing columns to otp_verification table
ALTER TABLE public.otp_verification 
ADD COLUMN IF NOT EXISTS mobile_no TEXT,
ADD COLUMN IF NOT EXISTS purpose TEXT DEFAULT 'verification',
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0;

-- Create index for mobile lookup
CREATE INDEX IF NOT EXISTS idx_otp_verification_mobile ON public.otp_verification(mobile_no);
CREATE INDEX IF NOT EXISTS idx_otp_verification_phone ON public.otp_verification(phone);
