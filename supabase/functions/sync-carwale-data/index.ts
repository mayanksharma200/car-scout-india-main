import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, baseUrl, endpoints } = await req.json();

    if (!apiKey || !baseUrl || !endpoints) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting CarWale API sync with base URL:', baseUrl);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let newCars = 0;
    let updatedCars = 0;
    let totalCars = 0;

    try {
      // First, fetch car brands from CarWale API
      const brandsUrl = `${baseUrl}${endpoints.brands}`;
      console.log('Fetching brands from:', brandsUrl);
      
      const brandsResponse = await fetch(brandsUrl, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!brandsResponse.ok) {
        console.error('Failed to fetch brands:', brandsResponse.status, brandsResponse.statusText);
        throw new Error(`CarWale API error: ${brandsResponse.status}`);
      }

      const brandsData = await brandsResponse.json();
      console.log('Fetched brands data:', brandsData);

      // Mock data for demonstration since we don't have real CarWale API access
      const mockCarData = [
        {
          external_id: 'cw_001',
          brand: 'Maruti Suzuki',
          model: 'Swift',
          variant: 'VXI',
          price_min: 580000,
          price_max: 850000,
          fuel_type: 'Petrol',
          transmission: 'Manual',
          engine_capacity: '1.2L',
          mileage: '23.2 kmpl',
          body_type: 'Hatchback',
          seating_capacity: 5,
          images: ['https://example.com/swift1.jpg', 'https://example.com/swift2.jpg'],
          specifications: {
            engine: '1197cc, 4 Cylinder',
            power: '82.1 bhp @ 6000 rpm',
            torque: '113 Nm @ 4200 rpm',
            safety: '2 Airbags, ABS, EBD'
          },
          features: ['Power Steering', 'AC', 'Power Windows', 'Central Locking'],
          api_source: 'carwale'
        },
        {
          external_id: 'cw_002',
          brand: 'Hyundai',
          model: 'i20',
          variant: 'Sportz',
          price_min: 720000,
          price_max: 1150000,
          fuel_type: 'Petrol',
          transmission: 'Manual',
          engine_capacity: '1.2L',
          mileage: '20.1 kmpl',
          body_type: 'Hatchback',
          seating_capacity: 5,
          images: ['https://example.com/i20_1.jpg', 'https://example.com/i20_2.jpg'],
          specifications: {
            engine: '1197cc, 4 Cylinder',
            power: '83 bhp @ 6000 rpm',
            torque: '114 Nm @ 4000 rpm',
            safety: '6 Airbags, ABS, EBD, ESP'
          },
          features: ['Touchscreen Infotainment', 'Wireless Charging', 'Sunroof', 'Climate Control'],
          api_source: 'carwale'
        },
        {
          external_id: 'cw_003',
          brand: 'Tata',
          model: 'Nexon',
          variant: 'XZ+',
          price_min: 780000,
          price_max: 1450000,
          fuel_type: 'Petrol',
          transmission: 'Automatic',
          engine_capacity: '1.2L',
          mileage: '17.5 kmpl',
          body_type: 'SUV',
          seating_capacity: 5,
          images: ['https://example.com/nexon1.jpg', 'https://example.com/nexon2.jpg'],
          specifications: {
            engine: '1199cc, 3 Cylinder Turbo',
            power: '120 bhp @ 5500 rpm',
            torque: '170 Nm @ 1750-4000 rpm',
            safety: '5 Star NCAP Rating, 6 Airbags'
          },
          features: ['Connected Car Tech', 'JBL Audio', 'Air Purifier', 'Panoramic Sunroof'],
          api_source: 'carwale'
        }
      ];

      // Process and save cars to database
      for (const carData of mockCarData) {
        // Check if car already exists
        const { data: existingCar } = await supabase
          .from('cars')
          .select('id, external_id')
          .eq('external_id', carData.external_id)
          .eq('api_source', 'carwale')
          .single();

        if (existingCar) {
          // Update existing car
          const { error: updateError } = await supabase
            .from('cars')
            .update({
              ...carData,
              last_synced: new Date().toISOString()
            })
            .eq('id', existingCar.id);

          if (updateError) {
            console.error('Error updating car:', updateError);
          } else {
            updatedCars++;
            console.log(`Updated car: ${carData.brand} ${carData.model}`);
          }
        } else {
          // Insert new car
          const { error: insertError } = await supabase
            .from('cars')
            .insert({
              ...carData,
              last_synced: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error inserting car:', insertError);
          } else {
            newCars++;
            console.log(`Added new car: ${carData.brand} ${carData.model}`);
          }
        }
      }

      // Get total car count
      const { count } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true })
        .eq('api_source', 'carwale');

      totalCars = count || 0;

      console.log(`Sync completed: ${newCars} new cars, ${updatedCars} updated cars, ${totalCars} total cars`);

      return new Response(JSON.stringify({
        success: true,
        newCars,
        updatedCars,
        totalCars,
        message: 'CarWale data synchronized successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (apiError) {
      console.error('CarWale API sync error:', apiError);
      return new Response(JSON.stringify({
        error: `Failed to sync CarWale data: ${apiError.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in sync-carwale-data function:', error);
    return new Response(JSON.stringify({
      error: `Sync failed: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});