-- Create admin_activities table to track important admin actions
CREATE TABLE IF NOT EXISTS public.admin_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type VARCHAR(50) NOT NULL, -- 'car_added', 'car_updated', 'car_deleted', 'car_import', 'content_published', 'lead_assigned', etc.
  action_title VARCHAR(255) NOT NULL, -- Short description e.g., "New car added"
  action_details TEXT, -- Detailed description e.g., "2024 Tata Nexon EV Max"
  entity_type VARCHAR(50), -- 'car', 'lead', 'content', 'dealer', etc.
  entity_id UUID, -- Reference to the affected entity
  metadata JSONB, -- Additional data like { count: 50, source: 'csv' }
  admin_user_id UUID, -- Who performed the action
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_activities_created_at ON public.admin_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_activities_action_type ON public.admin_activities(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_activities_entity_type ON public.admin_activities(entity_type);
CREATE INDEX IF NOT EXISTS idx_admin_activities_admin_user_id ON public.admin_activities(admin_user_id);

-- Add comments
COMMENT ON TABLE public.admin_activities IS 'Tracks all important admin panel activities for dashboard display';
COMMENT ON COLUMN public.admin_activities.action_type IS 'Type of action performed (car_added, car_import, etc.)';
COMMENT ON COLUMN public.admin_activities.metadata IS 'Additional JSON data like import count, source, etc.';

-- Enable Row Level Security (optional, can be configured based on needs)
ALTER TABLE public.admin_activities ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all activities
CREATE POLICY "Admins can view all activities"
  ON public.admin_activities
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Admins can insert activities
CREATE POLICY "Admins can insert activities"
  ON public.admin_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
