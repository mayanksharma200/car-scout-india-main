
// Utility functions for creating and parsing SEO-friendly car URL slugs

export const createCarSlug = (brand: string, model: string, variant?: string): string => {
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
};

export const parseCarSlug = (slug: string): { brand: string; model: string; variant?: string } => {
  const parts = slug.split('-').map(part => 
    part.charAt(0).toUpperCase() + part.slice(1)
  );
  
  return {
    brand: parts[0] || '',
    model: parts[1] || '',
    variant: parts.length > 2 ? parts.slice(2).join(' ') : undefined
  };
};

// Function to find car by slug in the cars array
export const findCarBySlug = (cars: any[], slug: string) => {
  return cars.find(car => {
    const carSlug = createCarSlug(car.brand, car.model, car.variant);
    return carSlug === slug;
  });
};

// Function to generate slug from car object
export const getCarSlugFromCar = (car: any): string => {
  return createCarSlug(car.brand, car.model, car.variant);
};
