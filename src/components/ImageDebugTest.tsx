import React from 'react';
import CarImageGallery from './CarImageGallery';
import IMAGINImage from './IMAGINImage';

const ImageDebugTest = () => {
  // Test data - exact URLs from your Nissan Magnite
  const testImages = [
    "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=nissan&modelFamily=magnite&modelVariant=suv&angle=21&fileType=png&width=800&zoomType=fullscreen&safeMode=true&randomPaint=true&modelYear=2024",
    "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=nissan&modelFamily=magnite&modelVariant=suv&angle=01&fileType=png&width=800&zoomType=fullscreen&safeMode=true&randomPaint=true&modelYear=2024"
  ];

  const proxyImages = [
    "http://localhost:3001/api/imagin-proxy?url=https%3A%2F%2Fcdn.imagin.studio%2Fgetimage%3Fcustomer%3Dsg-zorbitads%26make%3Dnissan%26modelFamily%3Dmagnite%26modelVariant%3Dsuv%26angle%3D21%26fileType%3Dpng%26width%3D800%26zoomType%3Dfullscreen%26safeMode%3Dtrue%26randomPaint%3Dtrue%26modelYear%3D2024"
  ];

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">🔍 Image Debug Test</h1>
      
      {/* Test 1: Direct IMAGINImage with direct URL */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Test 1: Direct IMAGINImage (Direct URL)</h2>
        <div className="w-64 h-40 border rounded">
          <IMAGINImage
            src={testImages[0]}
            alt="Test Direct URL"
            className="w-full h-full object-cover"
            fallback="/placeholder.svg"
          />
        </div>
      </div>

      {/* Test 2: Direct IMAGINImage with proxy URL */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Test 2: Direct IMAGINImage (Proxy URL)</h2>
        <div className="w-64 h-40 border rounded">
          <IMAGINImage
            src={proxyImages[0]}
            alt="Test Proxy URL"
            className="w-full h-full object-cover"
            fallback="/placeholder.svg"
          />
        </div>
      </div>

      {/* Test 3: CarImageGallery with direct URLs */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Test 3: CarImageGallery (Direct URLs)</h2>
        <div className="max-w-2xl">
          <CarImageGallery
            images={testImages}
            carName="Test Nissan Magnite"
          />
        </div>
      </div>

      {/* Test 4: CarImageGallery with proxy URLs */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Test 4: CarImageGallery (Proxy URLs)</h2>
        <div className="max-w-2xl">
          <CarImageGallery
            images={proxyImages}
            carName="Test Nissan Magnite Proxy"
          />
        </div>
      </div>
    </div>
  );
};

export default ImageDebugTest;