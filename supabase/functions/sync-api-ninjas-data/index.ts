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
    console.log('Starting API-Ninjas car data sync');

    // Get API key from Supabase secrets
    const apiKey = Deno.env.get('TEST_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let newCars = 0;
    let updatedCars = 0;
    let totalCars = 0;

    // Popular car makes to fetch
    const carMakes = [
      'toyota',
      'honda', 
      'ford',
      'bmw',
      'audi',
      'mercedes',
      'nissan',
      'hyundai'
    ];

    try {
      for (const carMake of carMakes) {
        console.log(`Fetching data for make: ${carMake}`);
        
        const response = await fetch(`https://api.api-ninjas.com/v1/cars?make=${carMake}&limit=3`, {
          headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          console.error(`Failed to fetch ${carMake}: ${response.status}`);
          continue;
        }

        const carsData = await response.json();
        console.log(`Received ${carsData.length} cars for ${carMake}:`, carsData);

        // Process each car from the API
        for (const apiCar of carsData) { // Process all cars returned
          const carData = {
            external_id: `api_ninjas_${apiCar.make}_${apiCar.model}_${apiCar.year}`.toLowerCase().replace(/\s+/g, '_'),
            brand: apiCar.make || 'Unknown',
            model: apiCar.model || 'Unknown',
            variant: apiCar.class || 'Standard',
            price_min: 1000000, // Default price in INR since API doesn't provide pricing
            price_max: 2000000,
            fuel_type: apiCar.fuel_type || 'Petrol',
            transmission: apiCar.transmission || 'Manual',
            engine_capacity: apiCar.displacement ? `${apiCar.displacement}L` : '2.0L',
            mileage: apiCar.combination_mpg ? `${Math.round(apiCar.combination_mpg * 0.425)} kmpl` : '15 kmpl', // Convert MPG to kmpl
            body_type: apiCar.class || 'Sedan',
            seating_capacity: 5, // Default seating
            images: ['/placeholder.svg'],
            specifications: {
              engine: apiCar.displacement ? `${apiCar.displacement}L ${apiCar.cylinders} Cylinder` : '2.0L 4 Cylinder',
              year: apiCar.year,
              drive: apiCar.drive,
              city_mpg: apiCar.city_mpg,
              highway_mpg: apiCar.highway_mpg,
              combination_mpg: apiCar.combination_mpg
            },
            features: ['Power Steering', 'Air Conditioning', 'Power Windows'],
            api_source: 'api_ninjas',
            status: 'active'
          };

          // Check if car already exists
          const { data: existingCar } = await supabase
            .from('cars')
            .select('id, external_id')
            .eq('external_id', carData.external_id)
            .eq('api_source', 'api_ninjas')
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
              console.log(`Updated car: ${carData.brand} ${carData.model} (${apiCar.year})`);
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
              console.log(`Added new car: ${carData.brand} ${carData.model} (${apiCar.year})`);
            }
          }
        }

        // Add small delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Get total car count
      const { count } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true })
        .eq('api_source', 'api_ninjas');

      totalCars = count || 0;

      console.log(`Sync completed: ${newCars} new cars, ${updatedCars} updated cars, ${totalCars} total cars`);

      return new Response(JSON.stringify({
        success: true,
        newCars,
        updatedCars,
        totalCars,
        message: 'API-Ninjas car data synchronized successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (apiError) {
      console.error('API-Ninjas sync error:', apiError);
      return new Response(JSON.stringify({
        error: `Failed to sync API-Ninjas data: ${apiError.message}`
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in sync-api-ninjas-data function:', error);
    return new Response(JSON.stringify({
      error: `Sync failed: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});