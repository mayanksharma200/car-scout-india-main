-- Create table for tracking image generation costs and usage
CREATE TABLE IF NOT EXISTS image_generation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  car_id UUID REFERENCES cars(id),
  source VARCHAR(50) NOT NULL, -- 'dashboard', 'add_edit_car', 'bulk'
  image_count INTEGER NOT NULL DEFAULT 1,
  cost DECIMAL(10, 4) NOT NULL, -- Cost in dollars
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE image_generation_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all logs
CREATE POLICY "Admins can view all image generation logs" 
  ON image_generation_logs 
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-- Allow admins to insert logs (backend service role will bypass RLS anyway, but good for completeness)
CREATE POLICY "Admins can insert image generation logs" 
  ON image_generation_logs 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );
