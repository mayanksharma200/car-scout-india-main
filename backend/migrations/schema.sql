-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cars Table
CREATE TABLE IF NOT EXISTS cars (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    variant VARCHAR(255),
    price_min NUMERIC,
    price_max NUMERIC,
    exact_price VARCHAR(255),
    fuel_type VARCHAR(100),
    transmission VARCHAR(100),
    body_type VARCHAR(100),
    seating_capacity INTEGER,
    mileage VARCHAR(100),
    engine_capacity VARCHAR(100),
    images TEXT[],
    color_variant_images JSONB DEFAULT '{}',
    specifications JSONB DEFAULT '{}',
    features TEXT[],
    status VARCHAR(50) DEFAULT 'active',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    external_id VARCHAR(255) UNIQUE, -- For duplicate checking
    api_source VARCHAR(100)
);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    interested_car_id UUID REFERENCES cars(id),
    budget_min NUMERIC,
    budget_max NUMERIC,
    city VARCHAR(100),
    timeline VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Activities Table
CREATE TABLE IF NOT EXISTS admin_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type VARCHAR(100) NOT NULL,
    action_title VARCHAR(255) NOT NULL,
    action_details TEXT,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Image Generation Logs Table
CREATE TABLE IF NOT EXISTS image_generation_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id),
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- News Articles Table
CREATE TABLE IF NOT EXISTS news_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  author TEXT,
  category TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- 'published', 'draft', 'scheduled'
  is_featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY, -- Links to Supabase Auth ID (or just a UUID if we migrate auth later)
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role VARCHAR(50) DEFAULT 'user', -- 'user', 'admin'
  phone TEXT,
  city TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OTP Verification Table
CREATE TABLE IF NOT EXISTS otp_verification (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mobile_no TEXT NOT NULL,
  otp TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'expired'
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Wishlist Table
CREATE TABLE IF NOT EXISTS user_wishlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

-- Price Alerts Table
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  target_price DECIMAL(12, 2),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, car_id)
);

-- API Settings Table
CREATE TABLE IF NOT EXISTS api_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cars_status ON cars(status);
CREATE INDEX IF NOT EXISTS idx_cars_brand ON cars(brand);
CREATE INDEX IF NOT EXISTS idx_cars_price_min ON cars(price_min);
CREATE INDEX IF NOT EXISTS idx_cars_price_max ON cars(price_max);
