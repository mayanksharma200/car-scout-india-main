-- Create API settings table to store configuration
CREATE TABLE public.api_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cars table to store car data from APIs
CREATE TABLE public.cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  variant TEXT,
  price_min INTEGER,
  price_max INTEGER,
  fuel_type TEXT,
  transmission TEXT,
  engine_capacity TEXT,
  mileage TEXT,
  body_type TEXT,
  seating_capacity INTEGER,
  images JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  api_source TEXT,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create leads table to track customer inquiries
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  interested_car_id UUID REFERENCES public.cars(id),
  budget_min INTEGER,
  budget_max INTEGER,
  timeline TEXT,
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new',
  api_sent BOOLEAN DEFAULT false,
  api_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.api_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create policies for API settings (admin only for now)
CREATE POLICY "Admin can manage API settings" 
ON public.api_settings 
FOR ALL 
USING (true);

-- Create policies for cars (public read, admin write)
CREATE POLICY "Anyone can view cars" 
ON public.cars 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Admin can manage cars" 
ON public.cars 
FOR ALL 
USING (true);

-- Create policies for leads (public insert, admin manage)
CREATE POLICY "Anyone can create leads" 
ON public.leads 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admin can manage leads" 
ON public.leads 
FOR ALL 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_cars_brand ON public.cars(brand);
CREATE INDEX idx_cars_model ON public.cars(brand, model);
CREATE INDEX idx_cars_price ON public.cars(price_min, price_max);
CREATE INDEX idx_cars_api_source ON public.cars(api_source);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_leads_status ON public.leads(status);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_api_settings_updated_at
  BEFORE UPDATE ON public.api_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default API settings
INSERT INTO public.api_settings (setting_key, setting_value, enabled) VALUES
('carwale_api', '{"apiKey": "", "baseUrl": "https://api.carwale.com/v1", "syncInterval": "daily", "endpoints": {"cars": "/cars", "carDetails": "/cars/{id}", "pricing": "/cars/{id}/pricing", "variants": "/cars/{id}/variants", "images": "/cars/{id}/images", "brands": "/brands", "search": "/cars/search"}}', false),
('brand_apis', '{"apis": [{"brand": "Maruti Suzuki", "endpoint": "", "apiKey": "", "enabled": false, "method": "POST", "headers": {}}, {"brand": "Hyundai", "endpoint": "", "apiKey": "", "enabled": false, "method": "POST", "headers": {}}, {"brand": "Tata", "endpoint": "", "apiKey": "", "enabled": false, "method": "POST", "headers": {}}]}', false),
('general_settings', '{"autoSendToAPI": true, "sendDelay": 5, "retryAttempts": 3, "enableWebhooks": true, "logApiCalls": true}', true);