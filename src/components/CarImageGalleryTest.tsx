import CarImageGallery from "./CarImageGallery";

const CarImageGalleryTest = () => {
  // Sample data for testing
  const sampleImages = [
    "https://example.com/car1.jpg",
    "https://example.com/car2.jpg",
  ];

  const sampleCar = {
    brand: "BMW",
    model: "X5",
    variant: "suv",
  };

  const sampleCurrentColor = {
    paintId: "1",
    paintDescription: "white",
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">CarImageGallery 360° View Test</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold">Expected Behavior:</h3>
          <ul className="list-disc list-inside text-sm mt-2">
            <li>You should see a <strong>"360° View"</strong> button next to other category buttons</li>
            <li>Click it to switch to interactive 360° car view</li>
            <li>The button has a rotate icon and should be clearly visible</li>
          </ul>
        </div>

        {/* Test CarImageGallery with 360° view enabled */}
        <CarImageGallery
          images={sampleImages}
          carName="BMW X5"
          isLoading={false}
          show360View={true} // This enables the 360° button
          car={sampleCar} // Car info for 360° view
          currentColor={sampleCurrentColor} // Color info for 360° view
        />

        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold">Debug Information:</h3>
          <p className="text-sm">
            If you don't see the 360° View button, check the browser console for debug info.
            The button should appear in the category filter row at the top.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CarImageGalleryTest;