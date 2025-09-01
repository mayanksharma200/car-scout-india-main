import CarViewContainer from "./CarViewContainer";

// Example usage of CarViewContainer in CarDetail.tsx
// Replace the existing CarImageGallery and CarColorSelector combination with this:

const ExampleUsage = () => {
  // Your existing car state and handlers
  const [car, setCar] = useState<any>(null);
  const [currentCarImages, setCurrentCarImages] = useState<string[]>([]);
  const [isColorChanging, setIsColorChanging] = useState(false);

  const handleColorChange = async (colorOption: any) => {
    // Your existing color change logic
    setIsColorChanging(true);
    // ... color change implementation
    setIsColorChanging(false);
  };

  // Replace this:
  /*
  <CarImageGallery
    images={currentCarImages}
    carName={`${car.brand} ${car.model}`}
    isLoading={isColorChanging}
  />
  
  <CarColorSelector
    currentColor={car.color}
    onColorChange={handleColorChange}
    car={{
      brand: car.brand,
      model: car.model,
      variant: car.variant,
      bodyType: car.bodyType,
    }}
    isChanging={isColorChanging}
  />
  */

  // With this single component:
  return (
    <CarViewContainer
      images={currentCarImages}
      carName={`${car.brand} ${car.model}`}
      car={{
        brand: car.brand,
        model: car.model,
        variant: car.variant,
        bodyType: car.bodyType,
      }}
      currentColor={car.color}
      onColorChange={handleColorChange}
      isChanging={isColorChanging}
      show360View={true} // Enable 360° view toggle
    />
  );
};

export default ExampleUsage;