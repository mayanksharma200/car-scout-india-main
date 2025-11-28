-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on setting_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access for non-sensitive settings
CREATE POLICY "Allow public read access for site settings"
  ON site_settings
  FOR SELECT
  USING (true);

-- Policy: Allow admin users to insert/update/delete settings
CREATE POLICY "Allow admin users to manage settings"
  ON site_settings
  FOR ALL
  USING (
    (auth.jwt() ->> 'role')::text = 'admin'
  );

-- Insert initial ad script URL
INSERT INTO site_settings (setting_key, setting_value)
VALUES ('ad_script_url', 'https://securepubads.g.doubleclick.net/tag/js/gpt.js')
ON CONFLICT (setting_key) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
