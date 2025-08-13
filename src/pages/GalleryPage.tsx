import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const GalleryPage = () => {
  const car = {
    brand: "Maruti Suzuki",
    model: "Swift",
    variant: "ZXI+ AMT"
  };

  const galleryImages = [
    // Exterior Photos
    { id: "1", url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200", alt: "Front View - Bold and Dynamic Design", category: "exterior" },
    { id: "2", url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200", alt: "Side Profile - Sleek Silhouette", category: "exterior" },
    { id: "3", url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200", alt: "Rear View - Stylish Tail Lamps", category: "exterior" },
    { id: "4", url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200", alt: "45° Angle View", category: "exterior" },
    { id: "5", url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1200", alt: "Night Photography", category: "exterior" },
    { id: "6", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200", alt: "Urban Setting", category: "exterior" },
    
    // Interior Photos
    { id: "7", url: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1200", alt: "Dashboard and Steering", category: "interior" },
    { id: "8", url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200", alt: "Front Seats - Premium Upholstery", category: "interior" },
    { id: "9", url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200", alt: "Rear Seats - Spacious Comfort", category: "interior" },
    { id: "10", url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200", alt: "Infotainment System", category: "interior" },
    { id: "11", url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200", alt: "Storage Compartments", category: "interior" },
    
    // Engine & Technical
    { id: "12", url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1200", alt: "Engine Bay - 1.2L K-Series", category: "engine" },
    { id: "13", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200", alt: "Transmission Detail", category: "engine" },
    { id: "14", url: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1200", alt: "Suspension System", category: "engine" },
    
    // Features & Details
    { id: "15", url: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200", alt: "LED Headlamps", category: "features" },
    { id: "16", url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200", alt: "Alloy Wheels", category: "features" },
    { id: "17", url: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200", alt: "Smart Key System", category: "features" },
    { id: "18", url: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200", alt: "Climate Control", category: "features" },
    
    // Storage & Practicality
    { id: "19", url: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=1200", alt: "Trunk Space - 268 Liters", category: "storage" },
    { id: "20", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200", alt: "Cargo Area with Rear Seats Folded", category: "storage" },
    { id: "21", url: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1200", alt: "Door Pockets and Cup Holders", category: "storage" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/cars/1" className="text-primary hover:underline text-sm mb-2 block">
              ← Back to Car Details
            </Link>
            <h1 className="text-3xl font-bold text-foreground">
              {car.brand} {car.model} Gallery
            </h1>
            <p className="text-muted-foreground">{car.variant} - {galleryImages.length} Photos</p>
          </div>
          <Button variant="outline">
            Download All Photos
          </Button>
        </div>

        {/* Gallery Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Exterior", count: galleryImages.filter(img => img.category === "exterior").length },
            { label: "Interior", count: galleryImages.filter(img => img.category === "interior").length },
            { label: "Engine", count: galleryImages.filter(img => img.category === "engine").length },
            { label: "Features", count: galleryImages.filter(img => img.category === "features").length },
            { label: "Storage", count: galleryImages.filter(img => img.category === "storage").length }
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{stat.count}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Image Gallery Component */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Photo Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Gallery component would be imported here */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Interactive gallery with {galleryImages.length} high-resolution images
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Use arrow keys for navigation, click for fullscreen view
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GalleryPage;