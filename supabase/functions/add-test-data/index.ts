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
    console.log('Starting test data insertion');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Sample car data to insert
    const sampleCars = [
      {
        external_id: 'test_001',
        brand: 'Toyota',
        model: 'Camry',
        variant: 'LE',
        price_min: 1500000,
        price_max: 2200000,
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        engine_capacity: '2.5L',
        mileage: '15 kmpl',
        body_type: 'Sedan',
        seating_capacity: 5,
        images: ['/placeholder.svg'],
        specifications: {
          engine: '2.5L 4 Cylinder',
          power: '203 hp',
          torque: '247 Nm',
          safety: '8 Airbags, Toyota Safety Sense'
        },
        features: ['Touchscreen Infotainment', 'Climate Control', 'Power Seats', 'Wireless Charging'],
        api_source: 'test_data',
        status: 'active'
      },
      {
        external_id: 'test_002',
        brand: 'Honda',
        model: 'Civic',
        variant: 'VTi-LX',
        price_min: 1200000,
        price_max: 1800000,
        fuel_type: 'Petrol',
        transmission: 'CVT',
        engine_capacity: '1.8L',
        mileage: '17 kmpl',
        body_type: 'Sedan',
        seating_capacity: 5,
        images: ['/placeholder.svg'],
        specifications: {
          engine: '1.8L 4 Cylinder',
          power: '141 hp',
          torque: '174 Nm',
          safety: '6 Airbags, Honda Sensing'
        },
        features: ['Apple CarPlay', 'Android Auto', 'Sunroof', 'Premium Audio'],
        api_source: 'test_data',
        status: 'active'
      },
      {
        external_id: 'test_003',
        brand: 'BMW',
        model: 'X3',
        variant: 'xDrive30i',
        price_min: 3500000,
        price_max: 4500000,
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        engine_capacity: '2.0L',
        mileage: '12 kmpl',
        body_type: 'SUV',
        seating_capacity: 5,
        images: ['/placeholder.svg'],
        specifications: {
          engine: '2.0L 4 Cylinder Turbo',
          power: '248 hp',
          torque: '350 Nm',
          safety: '8 Airbags, BMW ConnectedDrive'
        },
        features: ['Panoramic Sunroof', 'Harman Kardon Audio', 'Gesture Control', 'Wireless Charging'],
        api_source: 'test_data',
        status: 'active'
      },
      {
        external_id: 'test_004',
        brand: 'Audi',
        model: 'A4',
        variant: 'Premium Plus',
        price_min: 2800000,
        price_max: 3800000,
        fuel_type: 'Petrol',
        transmission: 'Automatic',
        engine_capacity: '2.0L',
        mileage: '14 kmpl',
        body_type: 'Sedan',
        seating_capacity: 5,
        images: ['/placeholder.svg'],
        specifications: {
          engine: '2.0L 4 Cylinder TFSI',
          power: '249 hp',
          torque: '370 Nm',
          safety: '8 Airbags, Audi Pre Sense'
        },
        features: ['Virtual Cockpit', 'Matrix LED Headlights', 'Bang & Olufsen Audio', 'Quattro AWD'],
        api_source: 'test_data',
        status: 'active'
      }
    ];

    let newCars = 0;
    let errors = 0;

    // Insert each car
    for (const carData of sampleCars) {
      try {
        // Check if car already exists
        const { data: existingCar } = await supabase
          .from('cars')
          .select('id')
          .eq('external_id', carData.external_id)
          .single();

        if (!existingCar) {
          // Insert new car
          const { error: insertError } = await supabase
            .from('cars')
            .insert({
              ...carData,
              last_synced: new Date().toISOString()
            });

          if (insertError) {
            console.error('Error inserting car:', insertError);
            errors++;
          } else {
            newCars++;
            console.log(`Added car: ${carData.brand} ${carData.model}`);
          }
        } else {
          console.log(`Car already exists: ${carData.brand} ${carData.model}`);
        }
      } catch (error) {
        console.error('Error processing car:', error);
        errors++;
      }
    }

    console.log(`Completed: ${newCars} new cars added, ${errors} errors`);

    return new Response(JSON.stringify({
      success: true,
      newCars,
      updatedCars: 0,
      totalCars: newCars,
      message: `Successfully added ${newCars} test cars to the database!`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in add-test-data function:', error);
    return new Response(JSON.stringify({
      error: `Failed to add test data: ${error.message}`
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});