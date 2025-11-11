-- Create password_reset_otp table for forgot password functionality
CREATE TABLE IF NOT EXISTS password_reset_otp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'admin')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE
);

-- Create index on email and expiration for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_email ON password_reset_otp(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_expires_at ON password_reset_otp(expires_at);
CREATE INDEX IF NOT EXISTS idx_password_reset_otp_user_id ON password_reset_otp(user_id);

-- Add RLS policies
ALTER TABLE password_reset_otp ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do anything
CREATE POLICY "Service role can manage password reset OTPs" ON password_reset_otp
  FOR ALL
  USING (auth.role() = 'service_role');

-- Function to clean up expired OTPs (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM password_reset_otp
  WHERE expires_at < NOW();
END;
$$;

-- Add comment
COMMENT ON TABLE password_reset_otp IS 'Stores OTP codes for password reset functionality with email verification';
