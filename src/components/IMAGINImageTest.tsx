import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import IMAGINImage from "./IMAGINImage";

const IMAGINImageTest = () => {
  const [testImages, setTestImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Test with direct IMAGIN CDN URLs (from your Nissan Magnite data)
  const directImageUrls = [
    "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=nissan&modelFamily=magnite&modelVariant=suv&angle=21&fileType=png&width=800&zoomType=fullscreen&safeMode=true&randomPaint=true&modelYear=2024",
    "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=nissan&modelFamily=magnite&modelVariant=suv&angle=01&fileType=png&width=800&zoomType=fullscreen&safeMode=true&randomPaint=true&modelYear=2024",
    "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=nissan&modelFamily=magnite&modelVariant=suv&angle=05&fileType=png&width=800&zoomType=fullscreen&safeMode=true&randomPaint=true&modelYear=2024",
    "https://cdn.imagin.studio/getimage?customer=sg-zorbitads&make=nissan&modelFamily=magnite&modelVariant=suv&angle=09&fileType=png&width=800&zoomType=fullscreen&safeMode=true&randomPaint=true&modelYear=2024"
  ];

  const fetchCarsWithIMAGIN = async () => {
    setLoading(true);
    try {
      // Fetch cars with IMAGIN images from your API
      const response = await fetch('http://localhost:3001/api/cars/featured');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Extract image URLs from cars that have IMAGIN images
          const imaginUrls = data.data
            .filter((car: any) => car.images && car.images.some((img: string) => img.includes('imagin-proxy')))
            .map((car: any) => car.images.find((img: string) => img.includes('imagin-proxy')))
            .filter(Boolean)
            .slice(0, 6); // Take first 6
          
          setTestImages(imaginUrls);
        }
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      // Fallback to direct URLs
      setTestImages(directImageUrls);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Start with direct URLs immediately for testing
    setTestImages(directImageUrls);
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>IMAGIN Image Test</CardTitle>
        <p className="text-sm text-muted-foreground">
          Testing IMAGIN proxy URLs in React components
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={fetchCarsWithIMAGIN} disabled={loading}>
            {loading ? "Loading..." : "Refresh Test Images"}
          </Button>

          {/* Test with a simple image first */}
          <div className="mb-6">
            <h3 className="font-medium mb-2">Simple Test Image</h3>
            <div className="aspect-video border rounded-lg overflow-hidden max-w-sm">
              <IMAGINImage
                src="https://via.placeholder.com/400x300/007bff/ffffff?text=Test+Image"
                alt="Test placeholder"
                className="w-full h-full object-cover"
                onLoad={() => console.log(`✅ Placeholder loaded successfully`)}
                onError={() => console.log(`❌ Placeholder failed to load`)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testImages.map((imageUrl, index) => (
              <div key={index} className="space-y-2">
                <div className="aspect-video border rounded-lg overflow-hidden">
                  <IMAGINImage
                    src={imageUrl}
                    alt={`Test car ${index + 1}`}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log(`✅ Image ${index + 1} loaded successfully`)}
                    onError={() => console.log(`❌ Image ${index + 1} failed to load`)}
                  />
                </div>
                <div className="text-xs text-gray-500 break-all">
                  URL: {imageUrl}
                </div>
              </div>
            ))}
          </div>

          {testImages.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <p>No IMAGIN images found. Run the bulk updater first!</p>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Debug Info:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Images loaded: {testImages.length}</li>
              <li>• Backend: http://localhost:3001</li>
              <li>• Proxy endpoint: /api/imagin-proxy</li>
              <li>• Check browser DevTools Network tab for errors</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IMAGINImageTest;