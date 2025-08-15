const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://bfbtxxelnyktktxuhiqn.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmYnR4eGVsbnlrdGt0eHVoaXFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyODQ4NzUsImV4cCI6MjA1MTg2MDg3NX0.3Q_Xpz8cgOkAEbECdN6lLxlj5L2zqTETPKJUdcpEj0M'
);

async function checkMGCars() {
  try {
    console.log('Checking for MG cars in database...');
    
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .ilike('brand', '%mg%')
      .eq('status', 'active');
    
    if (error) {
      console.error('Error:', error);
      return;
    }
    
    console.log(`Found ${data.length} MG cars in database:`);
    data.forEach(car => {
      console.log(`- ${car.brand} ${car.model} ${car.variant} (external_id: ${car.external_id})`);
    });
    
    // Also check what the slugs would be
    console.log('\nExpected slugs:');
    data.forEach(car => {
      const slug = createSlug(car.brand, car.model, car.variant);
      console.log(`- ${car.brand} ${car.model} ${car.variant} -> ${slug}`);
    });
    
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

function createSlug(brand, model, variant) {
  const parts = [brand, model];
  if (variant && variant !== model) {
    parts.push(variant);
  }
  
  return parts
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

checkMGCars();
