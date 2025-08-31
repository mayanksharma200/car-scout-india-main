import dotenv from 'dotenv';

dotenv.config();

// Test with simple cars and basic IMAGIN parameters
const testCars = [
  { brand: 'BMW', model: '3 Series', body_type: 'sedan', fuel_type: 'petrol' },
  { brand: 'Audi', model: 'A4', body_type: 'sedan', fuel_type: 'petrol' },
  { brand: 'Mercedes-Benz', model: 'C-Class', body_type: 'sedan', fuel_type: 'petrol' },
  { brand: 'MG', model: 'Hector', body_type: 'suv', fuel_type: 'petrol' }
];

function generateSimpleImageURL(car) {
  const customer = process.env.IMAGIN_CUSTOMER_KEY;
  const tailoring = process.env.IMAGIN_TAILORING_KEY;
  
  const params = new URLSearchParams({
    customer: customer,
    tailoring: tailoring,
    make: car.brand.toLowerCase(),
    modelFamily: car.model.toLowerCase().replace(/\s+/g, ''),
    modelVariant: car.body_type.toLowerCase(),
    angle: '21',
    fileType: 'png',
    width: '800'
  });

  return `https://s3-eu-west-1.amazonaws.com/images.wheel.ag/s3/c?${params.toString()}`;
}

async function testImages() {
  console.log('🧪 Testing simple IMAGIN URLs...\n');
  
  for (const car of testCars) {
    const url = generateSimpleImageURL(car);
    console.log(`\n${car.brand} ${car.model}:`);
    console.log(`URL: ${url}`);
    
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log(`Status: ${response.status} ${response.ok ? '✅' : '❌'}`);
      
      if (response.ok) {
        console.log('🎉 This car has a valid image!');
        // You can use this URL for the car
        break;
      }
    } catch (error) {
      console.log(`Error: ${error.message} ❌`);
    }
  }
}

testImages();