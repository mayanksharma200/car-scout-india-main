import { supabase } from '@/integrations/supabase/client';

export const addMissingMGHectorCars = async () => {
  console.log('🚗 Adding missing MG Hector cars to database...');
  
  const mgHectorCars = [
    {
      external_id: 'mg_hector_style',
      brand: 'MG',
      model: 'Hector',
      variant: 'Style',
      price_min: 1450000,
      price_max: 1650000,
      fuel_type: 'Petrol',
      transmission: 'Manual',
      engine_capacity: '1.5L Turbo',
      mileage: '14.2 kmpl',
      body_type: 'SUV',
      seating_capacity: 5,
      images: ['/placeholder.svg'],
      specifications: {
        engine: '1.5L Turbo',
        mileage: '14.2 kmpl',
        body_type: 'SUV',
        fuel_type: 'Petrol',
        transmission: 'Manual'
      },
      features: [
        'Power Steering',
        'Air Conditioning', 
        'Power Windows',
        'Central Locking',
        'ABS',
        'Airbags'
      ],
      status: 'active'
    },
    {
      external_id: 'mg_hector_super',
      brand: 'MG',
      model: 'Hector',
      variant: 'Super',
      price_min: 1650000,
      price_max: 1850000,
      fuel_type: 'Petrol',
      transmission: 'CVT',
      engine_capacity: '1.5L Turbo',
      mileage: '13.8 kmpl',
      body_type: 'SUV',
      seating_capacity: 5,
      images: ['/placeholder.svg'],
      specifications: {
        engine: '1.5L Turbo',
        mileage: '13.8 kmpl',
        body_type: 'SUV',
        fuel_type: 'Petrol',
        transmission: 'CVT'
      },
      features: [
        'Power Steering',
        'Air Conditioning',
        'Power Windows', 
        'Central Locking',
        'ABS',
        'Airbags',
        'Touchscreen Infotainment',
        'Cruise Control'
      ],
      status: 'active'
    },
    {
      external_id: 'mg_hector_smart',
      brand: 'MG',
      model: 'Hector',
      variant: 'Smart',
      price_min: 1850000,
      price_max: 2100000,
      fuel_type: 'Hybrid',
      transmission: 'Manual',
      engine_capacity: '1.5L Turbo',
      mileage: '16.8 kmpl',
      body_type: 'SUV',
      seating_capacity: 5,
      images: ['/placeholder.svg'],
      specifications: {
        engine: '1.5L Turbo',
        mileage: '16.8 kmpl',
        body_type: 'SUV',
        fuel_type: 'Hybrid',
        transmission: 'Manual'
      },
      features: [
        'Power Steering',
        'Air Conditioning',
        'Power Windows',
        'Central Locking', 
        'ABS',
        'Airbags',
        'Hybrid Technology',
        'Premium Infotainment',
        'Smart Features'
      ],
      status: 'active'
    }
  ];

  try {
    // First check if MG Hector cars already exist
    const { data: existingCars, error: checkError } = await supabase
      .from('cars')
      .select('external_id')
      .eq('brand', 'MG')
      .eq('model', 'Hector');
      
    if (checkError) {
      console.error('❌ Error checking existing cars:', checkError);
      return { success: false, error: checkError };
    }
    
    const existingIds = existingCars?.map(car => car.external_id) || [];
    const newCars = mgHectorCars.filter(car => !existingIds.includes(car.external_id));
    
    if (newCars.length === 0) {
      console.log('✅ MG Hector cars already exist in database');
      return { success: true, message: 'Cars already exist' };
    }
    
    // Insert new cars
    const { data, error } = await supabase
      .from('cars')
      .insert(newCars);
      
    if (error) {
      console.error('❌ Error inserting MG Hector cars:', error);
      return { success: false, error };
    } else {
      console.log(`✅ Successfully added ${newCars.length} MG Hector cars to database`);
      newCars.forEach(car => {
        console.log(`  - ${car.brand} ${car.model} ${car.variant}`);
      });
      return { success: true, count: newCars.length };
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return { success: false, error: err };
  }
};
