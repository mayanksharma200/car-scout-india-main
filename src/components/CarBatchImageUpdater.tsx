import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Image, 
  Search, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  AlertCircle,
  Eye,
  Download,
  Filter,
  Car,
  Play
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { carAPI } from "@/services/api";

interface CarItem {
  id: string;
  brand: string;
  model: string;
  body_type: string;
  price: number;
  year: number;
  fuel_type: string;
  transmission: string;
  images?: string[];
  created_at: string;
}

interface ProcessedCar {
  id: string;
  name: string;
  status: 'success' | 'failed';
  images_count?: number;
  error?: string;
  processed_at: string;
}

const CarBatchImageUpdater = () => {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [filteredCars, setFilteredCars] = useState<CarItem[]>([]);
  const [selectedCars, setSelectedCars] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCars, setProcessedCars] = useState<ProcessedCar[]>([]);
  const [totalCars, setTotalCars] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Fetch cars from database - same pattern as Compare.tsx
  const fetchCars = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Loading cars for batch processing...");
      
      // Use the same pattern as Compare.tsx - try API first, then fallback to Supabase
      let carsData = null;
      let totalCount = 0;

      try {
        // Try API first if available - load more cars for better filtering
        const response = await carAPI.getAll({
          status: "active",
          limit: 500, // Load more cars for better filtering like Compare.tsx
        });

        if (response.success && response.data) {
          console.log("✅ Cars loaded from API:", response.data.length, "cars");
          carsData = response.data;
          totalCount = response.total || response.data.length;
        }
      } catch (apiError) {
        console.warn("⚠️ API not available, trying Supabase directly:", apiError.message);
      }

      // If API failed, try Supabase directly - same fallback pattern as Compare.tsx
      if (!carsData) {
        console.log("🔄 Falling back to Supabase direct access...");
        
        const { data: supabaseData, error: supabaseError } = await supabase
          .from('cars')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(500);

        if (supabaseError) {
          console.error("❌ Supabase error:", supabaseError);
          throw supabaseError;
        }

        carsData = supabaseData;
        totalCount = carsData?.length || 0;
        console.log("✅ Cars loaded from Supabase:", carsData?.length, "cars");
      }

      if (carsData && carsData.length > 0) {
        // Transform cars to ensure consistent data structure - same as Compare.tsx
        const transformedCars = carsData.map((car) => ({
          ...car,
          price: car.price_min || car.price || 0,
          fuelType: car.fuel_type || car.fuelType || 'Petrol',
          bodyType: car.body_type || car.bodyType || 'Hatchback',
          images: Array.isArray(car.images) ? car.images : []
        }));

        setCars(transformedCars);
        console.log("Transformed cars for batch processing:", transformedCars.length);
        
        // Extract brands from the actual cars data - same as Compare.tsx
        const brands = [...new Set(transformedCars.map((car) => car.brand))].sort();
        setAvailableBrands(brands);
        
        setTotalCars(totalCount);
      } else {
        console.log("No cars found in database");
        setCars([]);
        setAvailableBrands([]);
        setTotalCars(0);
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setError('Failed to fetch cars. Please try again.');
      setCars([]);
      setAvailableBrands([]);
      setTotalCars(0);
      toast.error('Failed to fetch cars');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique brands for filter dropdown
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  // Filter cars based on search and brand - same logic as Compare.tsx
  useEffect(() => {
    const filteredCars = cars.filter((car) => {
      const searchMatch =
        searchTerm === "" ||
        car.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (car.variant && car.variant.toLowerCase().includes(searchTerm.toLowerCase()));

      const brandMatch = brandFilter === "" || car.brand === brandFilter;

      return searchMatch && brandMatch;
    });

    setFilteredCars(filteredCars);
  }, [cars, searchTerm, brandFilter]);

  useEffect(() => {
    fetchCars();
  }, []);

  // Handle car selection
  const toggleCarSelection = (carId: string) => {
    setSelectedCars(prev => 
      prev.includes(carId) 
        ? prev.filter(id => id !== carId)
        : [...prev, carId]
    );
  };

  const selectAllCars = () => {
    const allCarIds = filteredCars.map(car => car.id);
    setSelectedCars(allCarIds);
  };

  const clearSelection = () => {
    setSelectedCars([]);
  };

  // Process selected cars for image generation
  const processSelectedCars = async () => {
    if (selectedCars.length === 0) {
      toast.error('Please select at least one car');
      return;
    }

    if (!confirm(`Process images for ${selectedCars.length} selected cars?`)) {
      return;
    }

    setIsProcessing(true);
    setProcessedCars([]);
    
    try {
      toast.info(`Starting image processing for ${selectedCars.length} cars...`);

      // Process cars in batches of 5 to avoid overwhelming the API
      const BATCH_SIZE = 5;
      const selectedCarData = cars.filter(car => selectedCars.includes(car.id));
      
      for (let i = 0; i < selectedCarData.length; i += BATCH_SIZE) {
        const batch = selectedCarData.slice(i, i + BATCH_SIZE);
        
        toast.info(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(selectedCarData.length / BATCH_SIZE)}`);
        
        // Process each car in the current batch
        const batchPromises = batch.map(async (car) => {
          try {
            // Call the backend API to generate images for this specific car
            const response = await fetch('http://localhost:3001/api/admin/cars/generate-images', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                carId: car.id,
                carData: {
                  brand: car.brand,
                  model: car.model,
                  body_type: car.body_type,
                  year: car.year,
                  fuel_type: car.fuel_type
                },
                angles: ['21', '01', '05', '09'] // Generate 4 angles
              })
            });

            if (!response.ok) {
              throw new Error(`Failed to process ${car.brand} ${car.model}`);
            }

            const result = await response.json();
            
            return {
              id: car.id,
              name: `${car.brand} ${car.model}`,
              status: 'success' as const,
              images_count: result.images?.length || 0,
              processed_at: new Date().toISOString()
            };
          } catch (error) {
            console.error(`Error processing car ${car.id}:`, error);
            return {
              id: car.id,
              name: `${car.brand} ${car.model}`,
              status: 'failed' as const,
              error: error.message,
              processed_at: new Date().toISOString()
            };
          }
        });

        // Wait for current batch to complete
        const batchResults = await Promise.all(batchPromises);
        setProcessedCars(prev => [...prev, ...batchResults]);

        // Add a small delay between batches
        if (i + BATCH_SIZE < selectedCarData.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      const successful = processedCars.filter(car => car.status === 'success').length;
      const failed = processedCars.filter(car => car.status === 'failed').length;
      
      toast.success(`Processing complete! ${successful} successful, ${failed} failed`);
      
      // Refresh cars list to show updated images
      fetchCars();
      
    } catch (error) {
      console.error('Batch processing error:', error);
      toast.error('Batch processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Selective Car Image Batch Processor
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select specific cars to generate IMAGIN.studio images for. Choose from your car inventory and process them in batches.
          </p>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search by brand or model..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <select 
                className="pl-10 pr-4 py-2 border rounded-md bg-background"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
              >
                <option value="">All Brands</option>
                {availableBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={selectAllCars} 
              variant="outline" 
              size="sm"
              disabled={filteredCars.length === 0}
            >
              Select All ({filteredCars.length})
            </Button>
            <Button 
              onClick={clearSelection} 
              variant="outline" 
              size="sm"
              disabled={selectedCars.length === 0}
            >
              Clear Selection
            </Button>
            <Badge variant="secondary">
              {selectedCars.length} selected
            </Badge>
            <Button 
              onClick={processSelectedCars}
              disabled={selectedCars.length === 0 || isProcessing}
              className="ml-auto flex items-center gap-2"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isProcessing ? 'Processing...' : `Process ${selectedCars.length} Cars`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cars List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Car Inventory ({filteredCars.length} 
            {searchTerm || brandFilter ? ` of ${totalCars}` : ''} cars)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading cars...
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-500 mb-2">{error}</p>
              <Button size="sm" onClick={() => fetchCars()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : cars.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No cars available</p>
              <Button
                size="sm"
                onClick={() => fetchCars()}
                variant="outline"
                className="mt-2"
              >
                Refresh
              </Button>
            </div>
          ) : filteredCars.length === 0 ? (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No cars match your search</p>
              <Button
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setBrandFilter("");
                }}
                variant="outline"
                className="mt-2"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredCars.map((car) => (
                  <div 
                    key={car.id} 
                    className={`flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                      selectedCars.includes(car.id) ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => toggleCarSelection(car.id)}
                  >
                    <Checkbox 
                      checked={selectedCars.includes(car.id)}
                      onChange={() => toggleCarSelection(car.id)}
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{car.brand} {car.model}</span>
                        <Badge variant="outline">{car.year}</Badge>
                        <Badge variant="secondary">{car.body_type}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(car.price)} • {car.fuel_type} • {car.transmission}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={car.images && car.images.length > 0 ? "default" : "destructive"}>
                        {car.images?.length || 0} images
                      </Badge>
                      {car.images && car.images.length > 0 && (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Processing Results */}
      {processedCars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Processing Results ({processedCars.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{processedCars.length}</div>
                <div className="text-sm text-gray-600">Processed</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {processedCars.filter(car => car.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">Successful</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {processedCars.filter(car => car.status === 'failed').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {processedCars.map((car, index) => (
                <div 
                  key={car.id} 
                  className={`flex items-center justify-between p-2 rounded ${
                    car.status === 'success' ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div>
                    <div className="font-medium">{car.name}</div>
                    {car.status === 'success' ? (
                      <div className="text-sm text-green-600">
                        {car.images_count} images generated
                      </div>
                    ) : (
                      <div className="text-sm text-red-600">{car.error}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {car.status === 'success' ? (
                      <>
                        <Badge variant="secondary">{car.images_count} imgs</Badge>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CarBatchImageUpdater;