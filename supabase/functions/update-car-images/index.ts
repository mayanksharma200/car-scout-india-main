import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting car image updates...');

    // Car image mappings
    const carImageMappings = [
      // Maruti Suzuki
      { brand: 'Maruti Suzuki', model: 'Baleno', image: '/src/assets/cars/maruti-baleno.jpg' },
      
      // Hyundai
      { brand: 'Hyundai', model: 'Creta', image: '/src/assets/cars/hyundai-creta.jpg' },
      { brand: 'Hyundai', model: 'i20', image: '/src/assets/cars/hyundai-creta.jpg' },
      { brand: 'Hyundai', model: 'Venue', image: '/src/assets/cars/hyundai-creta.jpg' },
      { brand: 'Hyundai', model: 'Verna', image: '/src/assets/cars/hyundai-creta.jpg' },
      { brand: 'Hyundai', model: 'Alcazar', image: '/src/assets/cars/hyundai-creta.jpg' },
      { brand: 'Hyundai', model: 'Tucson', image: '/src/assets/cars/hyundai-creta.jpg' },
      
      // Tata
      { brand: 'Tata', model: 'Nexon', image: '/src/assets/cars/tata-nexon.jpg' },
      
      // Mahindra
      { brand: 'Mahindra', model: 'XUV700', image: '/src/assets/cars/mahindra-xuv700.jpg' },
      
      // Honda
      { brand: 'Honda', model: 'City', image: '/src/assets/cars/honda-city.jpg' },
      { brand: 'Honda', model: 'Amaze', image: '/src/assets/cars/honda-city.jpg' },
      { brand: 'Honda', model: 'Jazz', image: '/src/assets/cars/honda-city.jpg' },
      { brand: 'Honda', model: 'WR-V', image: '/src/assets/cars/honda-city.jpg' },
      { brand: 'Honda', model: 'Civic', image: '/src/assets/cars/honda-city.jpg' },
      
      // Toyota
      { brand: 'Toyota', model: 'Camry', image: '/src/assets/cars/toyota-camry.jpg' },
      
      // Kia
      { brand: 'Kia', model: 'Seltos', image: '/src/assets/cars/kia-seltos.jpg' },
      { brand: 'Kia', model: 'Carens', image: '/src/assets/cars/kia-seltos.jpg' },
      { brand: 'Kia', model: 'Sonet', image: '/src/assets/cars/kia-seltos.jpg' },
      
      // Renault
      { brand: 'Renault', model: 'Kiger', image: '/src/assets/cars/renault-kiger.jpg' },
      { brand: 'Renault', model: 'Triber', image: '/src/assets/cars/renault-kiger.jpg' },
      { brand: 'Renault', model: 'Kwid', image: '/src/assets/cars/renault-kiger.jpg' },
      
      // BMW and Audi (use existing car images)
      { brand: 'BMW', model: 'X3', image: '/src/assets/cars/toyota-camry.jpg' },
      { brand: 'Audi', model: 'A4', image: '/src/assets/cars/toyota-camry.jpg' },
    ];

    let updatedCount = 0;

    for (const mapping of carImageMappings) {
      const { data, error } = await supabase
        .from('cars')
        .update({ images: [mapping.image] })
        .eq('brand', mapping.brand)
        .eq('model', mapping.model);

      if (error) {
        console.error(`Error updating ${mapping.brand} ${mapping.model}:`, error);
      } else {
        console.log(`Updated images for ${mapping.brand} ${mapping.model}`);
        updatedCount++;
      }
    }

    console.log(`Successfully updated images for ${updatedCount} car models`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        updatedCount,
        message: `Updated images for ${updatedCount} car models`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error updating car images:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});