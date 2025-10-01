-- Create auth_audit_logs table
CREATE TABLE IF NOT EXISTS public.auth_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  event_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  additional_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create otp_verification table
CREATE TABLE IF NOT EXISTS public.otp_verification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  email TEXT,
  phone TEXT,
  otp_code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create price_alerts table
CREATE TABLE IF NOT EXISTS public.price_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  target_price INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER,
  category TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_activity_logs table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_wishlist table
CREATE TABLE IF NOT EXISTS public.user_wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, car_id)
);

-- Create wishlist_shares table
CREATE TABLE IF NOT EXISTS public.wishlist_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  share_code TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create active_user_sessions view
CREATE OR REPLACE VIEW public.active_user_sessions AS
SELECT * FROM public.user_sessions WHERE is_active = true;

-- Create user_wishlist_with_cars view
CREATE OR REPLACE VIEW public.user_wishlist_with_cars AS
SELECT 
  uw.id,
  uw.user_id,
  uw.car_id,
  uw.added_at,
  c.brand,
  c.model,
  c.variant,
  c.price_min,
  c.price_max,
  c.images,
  c.fuel_type,
  c.transmission
FROM public.user_wishlist uw
LEFT JOIN public.cars c ON uw.car_id = c.id;

-- Enable RLS on all tables
ALTER TABLE public.auth_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for user_wishlist
CREATE POLICY "Users can view their own wishlist"
ON public.user_wishlist
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their wishlist"
ON public.user_wishlist
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove from their wishlist"
ON public.user_wishlist
FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for price_alerts
CREATE POLICY "Users can view their own price alerts"
ON public.price_alerts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create price alerts"
ON public.price_alerts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their price alerts"
ON public.price_alerts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their price alerts"
ON public.price_alerts
FOR DELETE
USING (auth.uid() = user_id);

-- Service role policies for all tables
CREATE POLICY "Service role can manage all" ON public.auth_audit_logs FOR ALL USING (true);
CREATE POLICY "Service role can manage all" ON public.otp_verification FOR ALL USING (true);
CREATE POLICY "Service role can manage all" ON public.products FOR ALL USING (true);
CREATE POLICY "Service role can manage all" ON public.user_activity_logs FOR ALL USING (true);
CREATE POLICY "Service role can manage all" ON public.wishlist_shares FOR ALL USING (true);

-- Create indexes
CREATE INDEX idx_auth_audit_logs_user_id ON public.auth_audit_logs(user_id);
CREATE INDEX idx_otp_verification_email ON public.otp_verification(email);
CREATE INDEX idx_price_alerts_user_id ON public.price_alerts(user_id);
CREATE INDEX idx_price_alerts_car_id ON public.price_alerts(car_id);
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_wishlist_user_id ON public.user_wishlist(user_id);
CREATE INDEX idx_user_wishlist_car_id ON public.user_wishlist(car_id);
