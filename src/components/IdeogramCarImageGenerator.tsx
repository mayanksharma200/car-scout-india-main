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
  Filter,
  Car,
  Sparkles,
  Wand2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { carAPI } from "@/services/api";

interface CarItem {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  body_type: string;
  price: number;
  year: number;
  fuel_type: string;
  transmission: string;
  images?: string[];
  colors?: string;
  color_codes?: string;
  created_at: string;
}

interface GeneratedImage {
  url: string;
  angle: string;
  resolution: string;
  is_safe: boolean;
  seed: number;
  colorName?: string;
  colorCode?: string;
}

interface ColorResult {
  colorCode: string;
  images: GeneratedImage[];
  masterSeed: number;
  totalImages: number;
  primaryImage: string;
  errors?: any[];
}

interface ProcessedCar {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'pending_approval';
  images_count?: number;
  total_colors?: number;
  error?: string;
  processed_at: string;
  primary_image?: string;
  generated_images?: GeneratedImage[]; // Legacy format
  color_results?: Record<string, ColorResult>; // New multi-color format
  generationLogs?: GenerationLog[]; // Logs for each angle
}

interface GenerationLog {
  angle: string;
  color: string;
  status: 'success' | 'failed' | 'generating';
  message: string;
  timestamp: string;
}

interface GenerationOptions {
  num_images: number;
  aspect_ratio: string;
  rendering_speed: 'FLASH' | 'TURBO' | 'DEFAULT' | 'QUALITY';
  style_type: 'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN' | 'FICTION';
}

const IdeogramCarImageGenerator = () => {
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
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);

  // Image preview and selection state
  const [currentCarForReview, setCurrentCarForReview] = useState<ProcessedCar | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedColorImages, setSelectedColorImages] = useState<Record<string, string[]>>({});
  const [isUploading, setIsUploading] = useState(false);

  // Generation options
  const [options, setOptions] = useState<GenerationOptions>({
    num_images: 8,
    aspect_ratio: '16x9',
    rendering_speed: 'TURBO',
    style_type: 'REALISTIC'
  });

  // Fetch cars from database
  const fetchCars = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Loading cars for Ideogram AI generation...");

      let carsData = null;
      let totalCount = 0;

      try {
        // Try API first
        const response = await carAPI.getAll({
          status: "active",
          limit: 500,
        });

        if (response.success && response.data) {
          console.log("✅ Cars loaded from API:", response.data.length, "cars");
          carsData = response.data;
          totalCount = response.total || response.data.length;
        }
      } catch (apiError) {
        console.warn("⚠️ API not available, trying Supabase directly:", apiError.message);
      }

      // Fallback to Supabase
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
        const transformedCars = carsData.map((car) => ({
          ...car,
          price: car.price_min || car.price || 0,
          fuelType: car.fuel_type || car.fuelType || 'Petrol',
          bodyType: car.body_type || car.bodyType || 'Hatchback',
          images: Array.isArray(car.images) ? car.images : []
        }));

        setCars(transformedCars);
        console.log("Transformed cars for Ideogram generation:", transformedCars.length);

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

  // Filter cars based on search and brand
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

  // Process selected cars for Ideogram AI generation
  const processSelectedCars = async () => {
    if (selectedCars.length === 0) {
      toast.error('Please select at least one car');
      return;
    }

    if (!confirm(`Generate AI images with Ideogram for ${selectedCars.length} selected cars?\n\nThis will create ${options.num_images} high-quality studio photos for each car.`)) {
      return;
    }

    setIsProcessing(true);
    setProcessedCars([]);

    try {
      toast.info(`Starting Ideogram AI image generation for ${selectedCars.length} cars...`);

      const selectedCarData = cars.filter(car => selectedCars.includes(car.id));

      // Process cars one by one (Ideogram API has rate limits)
      for (let i = 0; i < selectedCarData.length; i++) {
        const car = selectedCarData[i];
        const carName = `${car.brand} ${car.model}`;

        toast.info(`Processing ${i + 1}/${selectedCarData.length}: ${carName}`);

        // Initialize processed car with empty logs
        const processingCarIndex = i;
        const initialProcessedCar: ProcessedCar = {
          id: car.id,
          name: carName,
          status: 'pending_approval',
          images_count: 0,
          total_colors: 0,
          generationLogs: [],
          processed_at: new Date().toISOString()
        };

        setProcessedCars(prev => [...prev, initialProcessedCar]);

        try {
          // Parse colors to show in logs
          const colors = car.colors ? car.colors.split(';').map(c => c.trim()).filter(c => c) : [];
          const totalAngles = options.num_images;

          // Add initial logs for each color and angle
          const initialLogs: GenerationLog[] = [];
          colors.forEach(color => {
            for (let angleIndex = 0; angleIndex < totalAngles; angleIndex++) {
              const angleNames = ['Front 3/4', 'Front View', 'Left Side', 'Right Side', 'Rear View', 'Interior Dash', 'Interior Cabin', 'Interior Steering'];
              initialLogs.push({
                angle: angleNames[angleIndex] || `Angle ${angleIndex + 1}`,
                color: color,
                status: 'generating',
                message: 'Waiting to generate...',
                timestamp: new Date().toISOString()
              });
            }
          });

          // Use fetch with streaming for POST request
          const response = await fetch('/api/admin/cars/ideogram-generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              carId: car.id,
              carData: {
                brand: car.brand,
                model: car.model,
                variant: car.variant || '',
                body_type: car.body_type,
                year: car.year,
                fuel_type: car.fuel_type,
                colors: car.colors || '',
                color_codes: car.color_codes || ''
              },
              options: options
            })
          });

          if (!response.ok) {
            throw new Error(`Failed to process ${carName}`);
          }

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let finalResult: any = null;
          const realtimeLogs: GenerationLog[] = [];

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6));

                    if (data.type === 'progress') {
                      // Update logs in real-time based on progress events
                      if (data.status === 'angle_start') {
                        realtimeLogs.push({
                          angle: data.angle.replace(/_/g, ' '),
                          color: data.color,
                          status: 'generating',
                          message: data.message,
                          timestamp: new Date().toISOString()
                        });
                      } else if (data.status === 'angle_success') {
                        // Update the existing log or add new one
                        const existingIndex = realtimeLogs.findIndex(
                          log => log.angle === data.angle.replace(/_/g, ' ') && log.color === data.color
                        );
                        if (existingIndex >= 0) {
                          realtimeLogs[existingIndex] = {
                            angle: data.angle.replace(/_/g, ' '),
                            color: data.color,
                            status: 'success',
                            message: data.message,
                            timestamp: new Date().toISOString()
                          };
                        } else {
                          realtimeLogs.push({
                            angle: data.angle.replace(/_/g, ' '),
                            color: data.color,
                            status: 'success',
                            message: data.message,
                            timestamp: new Date().toISOString()
                          });
                        }
                      } else if (data.status === 'angle_failed') {
                        const existingIndex = realtimeLogs.findIndex(
                          log => log.angle === data.angle.replace(/_/g, ' ') && log.color === data.color
                        );
                        if (existingIndex >= 0) {
                          realtimeLogs[existingIndex] = {
                            angle: data.angle.replace(/_/g, ' '),
                            color: data.color,
                            status: 'failed',
                            message: data.message,
                            timestamp: new Date().toISOString()
                          };
                        } else {
                          realtimeLogs.push({
                            angle: data.angle.replace(/_/g, ' '),
                            color: data.color,
                            status: 'failed',
                            message: data.message,
                            timestamp: new Date().toISOString()
                          });
                        }
                      }

                      // Update UI in real-time
                      setProcessedCars(prev => {
                        const updated = [...prev];
                        if (updated[processingCarIndex]) {
                          updated[processingCarIndex] = {
                            ...updated[processingCarIndex],
                            generationLogs: [...realtimeLogs]
                          };
                        }
                        return updated;
                      });
                    } else if (data.type === 'complete') {
                      finalResult = data;
                    } else if (data.type === 'error') {
                      throw new Error(data.message || 'Generation failed');
                    }
                  } catch (e) {
                    console.error('Error parsing SSE data:', e);
                  }
                }
              }
            }
          }

          if (!finalResult) {
            throw new Error('No final result received');
          }

          // Update processed car with final results
          const finalProcessedCar: ProcessedCar = {
            id: car.id,
            name: carName,
            status: 'pending_approval',
            images_count: finalResult.totalImages || 0,
            total_colors: finalResult.totalColors || 0,
            primary_image: finalResult.colorResults ? Object.values(finalResult.colorResults)[0]?.primaryImage : null,
            color_results: finalResult.colorResults,
            generationLogs: realtimeLogs,
            processed_at: new Date().toISOString()
          };

          setProcessedCars(prev => {
            const updated = [...prev];
            updated[processingCarIndex] = finalProcessedCar;
            return updated;
          });

          const successCount = realtimeLogs.filter(log => log.status === 'success').length;
          const failedCount = realtimeLogs.filter(log => log.status === 'failed').length;

          toast.success(`✅ ${carName}: ${successCount} images generated successfully${failedCount > 0 ? `, ${failedCount} failed` : ''}`);
        } catch (error: any) {
          console.error(`Error processing car ${car.id}:`, error);

          setProcessedCars(prev => {
            const updated = [...prev];
            updated[processingCarIndex] = {
              id: car.id,
              name: carName,
              status: 'failed',
              error: error.message,
              generationLogs: [{
                angle: 'All',
                color: 'All',
                status: 'failed',
                message: `❌ ${error.message}`,
                timestamp: new Date().toISOString()
              }],
              processed_at: new Date().toISOString()
            };
            return updated;
          });

          toast.error(`❌ Failed: ${carName}`);
        }

        // Add delay between requests to respect rate limits
        if (i < selectedCarData.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }

      const successful = processedCars.filter(car => car.status === 'success').length;
      const failed = processedCars.filter(car => car.status === 'failed').length;

      toast.success(`Ideogram generation complete! ${successful} successful, ${failed} failed`);

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

  // Open image review modal
  const openImageReview = (car: ProcessedCar) => {
    setCurrentCarForReview(car);

    // Pre-select all images by default for multi-color format
    if (car.color_results) {
      const colorSelections: Record<string, string[]> = {};
      Object.entries(car.color_results).forEach(([colorName, colorData]) => {
        colorSelections[colorName] = colorData.images.map(img => img.url);
      });
      setSelectedColorImages(colorSelections);
    } else {
      // Legacy format fallback
      setSelectedImages(car.generated_images?.map(img => img.url) || []);
    }
  };

  // Close review modal
  const closeImageReview = () => {
    setCurrentCarForReview(null);
    setSelectedImages([]);
    setSelectedColorImages({});
  };

  // Toggle image selection (legacy)
  const toggleImageSelection = (imageUrl: string) => {
    setSelectedImages(prev =>
      prev.includes(imageUrl)
        ? prev.filter(url => url !== imageUrl)
        : [...prev, imageUrl]
    );
  };

  // Toggle image selection for specific color
  const toggleColorImageSelection = (colorName: string, imageUrl: string) => {
    setSelectedColorImages(prev => {
      const colorImages = prev[colorName] || [];
      const newColorImages = colorImages.includes(imageUrl)
        ? colorImages.filter(url => url !== imageUrl)
        : [...colorImages, imageUrl];

      return {
        ...prev,
        [colorName]: newColorImages
      };
    });
  };

  // Select all images for a color
  const selectAllColorImages = (colorName: string) => {
    if (!currentCarForReview?.color_results) return;

    const colorData = currentCarForReview.color_results[colorName];
    if (colorData) {
      setSelectedColorImages(prev => ({
        ...prev,
        [colorName]: colorData.images.map(img => img.url)
      }));
    }
  };

  // Clear all selections for a color
  const clearColorSelections = (colorName: string) => {
    setSelectedColorImages(prev => ({
      ...prev,
      [colorName]: []
    }));
  };

  // Select all images (legacy)
  const selectAllImages = () => {
    setSelectedImages(currentCarForReview?.generated_images?.map(img => img.url) || []);
  };

  // Clear all selections (legacy)
  const clearAllSelections = () => {
    setSelectedImages([]);
  };

  // Upload approved images to S3 and save to car
  const uploadApprovedImages = async () => {
    setIsUploading(true);

    try {
      let approvedData: any;
      let totalImages = 0;

      // Check if using new multi-color format
      if (currentCarForReview?.color_results) {
        // Build approvedColorImages structure
        const approvedColorImages: Record<string, any> = {};

        Object.entries(currentCarForReview.color_results).forEach(([colorName, colorData]) => {
          const selectedUrls = selectedColorImages[colorName] || [];
          if (selectedUrls.length > 0) {
            const approvedImages = colorData.images.filter(img => selectedUrls.includes(img.url));
            approvedColorImages[colorName] = {
              colorCode: colorData.colorCode,
              images: approvedImages
            };
            totalImages += approvedImages.length;
          }
        });

        if (totalImages === 0) {
          toast.error('Please select at least one image to upload');
          setIsUploading(false);
          return;
        }

        approvedData = { approvedColorImages };
        toast.info(`Uploading ${totalImages} images across ${Object.keys(approvedColorImages).length} colors to S3...`);
      } else {
        // Legacy format
        if (selectedImages.length === 0) {
          toast.error('Please select at least one image to upload');
          setIsUploading(false);
          return;
        }

        const approvedImages = currentCarForReview?.generated_images?.filter(img =>
          selectedImages.includes(img.url)
        ) || [];
        totalImages = approvedImages.length;
        approvedData = { approvedImages };
        toast.info(`Uploading ${totalImages} images to S3...`);
      }

      const response = await fetch('/api/admin/cars/ideogram-approve-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId: currentCarForReview.id,
          ...approvedData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload images');
      }

      const result = await response.json();

      const uploadedCount = result.totalUploaded || result.uploadedCount || 0;
      const uploadedColors = result.totalColors || 0;

      if (uploadedColors > 0) {
        toast.success(`✅ Successfully uploaded ${uploadedCount} images across ${uploadedColors} colors!`);
      } else {
        toast.success(`✅ Successfully uploaded ${uploadedCount} images!`);
      }

      // Update the processed car status
      setProcessedCars(prev => prev.map(car =>
        car.id === currentCarForReview.id
          ? { ...car, status: 'success' as const }
          : car
      ));

      // Close the review modal
      closeImageReview();

      // Refresh car list
      fetchCars();

    } catch (error) {
      console.error('Error uploading approved images:', error);
      toast.error(`Failed to upload images: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Ideogram AI Car Image Generator
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate professional studio photoshoot images using Ideogram AI. Create high-quality automotive photography with multiple angles for each selected car.
          </p>
        </CardHeader>
        <CardContent>
          {/* Generation Options */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div>
              <label className="text-sm font-medium text-gray-700">Images per car</label>
              <select
                className="w-full mt-1 p-2 border rounded-md bg-white"
                value={options.num_images}
                onChange={(e) => setOptions({...options, num_images: parseInt(e.target.value)})}
              >
                <option value="4">4 angles</option>
                <option value="8">8 angles (Full)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Aspect Ratio</label>
              <select
                className="w-full mt-1 p-2 border rounded-md bg-white"
                value={options.aspect_ratio}
                onChange={(e) => setOptions({...options, aspect_ratio: e.target.value})}
              >
                <option value="16x9">16:9 (Wide)</option>
                <option value="4x3">4:3</option>
                <option value="1x1">1:1 (Square)</option>
                <option value="9x16">9:16 (Portrait)</option>
                <option value="3x4">3:4</option>
                <option value="4x5">4:5</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Quality</label>
              <select
                className="w-full mt-1 p-2 border rounded-md bg-white"
                value={options.rendering_speed}
                onChange={(e) => setOptions({...options, rendering_speed: e.target.value as GenerationOptions['rendering_speed']})}
              >
                <option value="FLASH">Flash (Fast)</option>
                <option value="TURBO">Turbo (Balanced)</option>
                <option value="DEFAULT">Default</option>
                <option value="QUALITY">Quality (Slow)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Style</label>
              <select
                className="w-full mt-1 p-2 border rounded-md bg-white"
                value={options.style_type}
                onChange={(e) => setOptions({...options, style_type: e.target.value as GenerationOptions['style_type']})}
              >
                <option value="REALISTIC">Realistic</option>
                <option value="AUTO">Auto</option>
                <option value="GENERAL">General</option>
              </select>
            </div>
          </div>

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
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {selectedCars.length} selected
            </Badge>
            <Button
              onClick={processSelectedCars}
              disabled={selectedCars.length === 0 || isProcessing}
              className="ml-auto flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              {isProcessing ? 'Generating...' : `Generate for ${selectedCars.length} Cars`}
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
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredCars.map((car) => (
                <div
                  key={car.id}
                  className={`flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors ${
                    selectedCars.includes(car.id) ? 'bg-purple-50 border-purple-200' : ''
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
                      {car.variant && <span className="text-sm text-gray-500">{car.variant}</span>}
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
          )}
        </CardContent>
      </Card>

      {/* Processing Results */}
      {processedCars.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Generation Results ({processedCars.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold">{processedCars.length}</div>
                <div className="text-sm text-gray-600">Processed</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {processedCars.filter(car => car.status === 'pending_approval').length}
                </div>
                <div className="text-sm text-gray-600">Pending Review</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {processedCars.filter(car => car.status === 'success').length}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {processedCars.filter(car => car.status === 'failed').length}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {processedCars.map((car) => (
                <div
                  key={car.id}
                  className={`rounded border ${
                    car.status === 'pending_approval' ? 'bg-yellow-50 border-yellow-200' :
                    car.status === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between p-3">
                    <div className="flex-1">
                      <div className="font-medium">{car.name}</div>
                      {car.status === 'pending_approval' ? (
                        <div className="text-sm text-yellow-600">
                          {car.images_count} images generated - Click Review to approve
                        </div>
                      ) : car.status === 'success' ? (
                        <div className="text-sm text-green-600">
                          {car.images_count} images uploaded to S3
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">{car.error}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {car.status === 'pending_approval' && (
                        <Button
                          size="sm"
                          onClick={() => openImageReview(car)}
                          className="bg-yellow-600 hover:bg-yellow-700"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review Images
                        </Button>
                      )}
                      {car.status === 'success' && (
                        <>
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {car.images_count} imgs
                          </Badge>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </>
                      )}
                      {car.status === 'failed' && (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                  </div>

                  {/* Generation Logs */}
                  {car.generationLogs && car.generationLogs.length > 0 && (
                    <div className="border-t px-3 py-2 bg-white bg-opacity-50">
                      <div className="text-xs font-semibold text-gray-600 mb-2">Generation Logs:</div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {car.generationLogs.map((log, idx) => (
                          <div
                            key={idx}
                            className={`flex items-start gap-2 text-xs p-1.5 rounded ${
                              log.status === 'success' ? 'bg-green-100' :
                              log.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                            }`}
                          >
                            {log.status === 'success' ? (
                              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                            ) : log.status === 'failed' ? (
                              <XCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                            ) : (
                              <RefreshCw className="h-3 w-3 text-gray-600 mt-0.5 flex-shrink-0 animate-spin" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium capitalize">
                                {log.color} - {log.angle}
                              </div>
                              <div className={`${
                                log.status === 'success' ? 'text-green-700' :
                                log.status === 'failed' ? 'text-red-700' : 'text-gray-600'
                              }`}>
                                {log.message}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        ✅ {car.generationLogs.filter(log => log.status === 'success').length} succeeded
                        {car.generationLogs.filter(log => log.status === 'failed').length > 0 && (
                          <> • ❌ {car.generationLogs.filter(log => log.status === 'failed').length} failed</>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Review Modal */}
      {currentCarForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-500" />
                  Review Generated Images for {currentCarForReview.name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeImageReview}
                  className="hover:bg-gray-100"
                >
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>
              <div className="flex items-center gap-4 mt-4">
                {currentCarForReview.color_results ? (
                  <>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {Object.values(selectedColorImages).reduce((sum, imgs) => sum + imgs.length, 0)} of {currentCarForReview.images_count} selected
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {currentCarForReview.total_colors} Colors
                    </Badge>
                  </>
                ) : (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {selectedImages.length} of {currentCarForReview.images_count} selected
                  </Badge>
                )}
                <Button
                  size="sm"
                  onClick={uploadApprovedImages}
                  disabled={isUploading}
                  className="ml-auto bg-purple-600 hover:bg-purple-700"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading to S3...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Upload to S3
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Multi-color format */}
              {currentCarForReview.color_results ? (
                <div className="space-y-6">
                  {Object.entries(currentCarForReview.color_results).map(([colorName, colorData]) => {
                    const colorSelectedImages = selectedColorImages[colorName] || [];
                    return (
                      <div key={colorName} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-6 h-6 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: colorData.colorCode }}
                            />
                            <h3 className="font-semibold text-lg">{colorName}</h3>
                            <Badge variant="outline">
                              {colorSelectedImages.length} of {colorData.totalImages} selected
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => selectAllColorImages(colorName)}
                            >
                              Select All
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => clearColorSelections(colorName)}
                            >
                              Clear
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {colorData.images.map((image, index) => (
                            <div
                              key={index}
                              className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                                colorSelectedImages.includes(image.url)
                                  ? 'border-purple-500 ring-2 ring-purple-200'
                                  : 'border-gray-200 hover:border-gray-400'
                              }`}
                              onClick={() => toggleColorImageSelection(colorName, image.url)}
                            >
                              <div className="aspect-video bg-gray-100 relative">
                                <img
                                  src={image.url}
                                  alt={`${currentCarForReview.name} - ${colorName} - ${image.angle}`}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                                {colorSelectedImages.includes(image.url) && (
                                  <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                                    <CheckCircle className="h-5 w-5" />
                                  </div>
                                )}
                                {!image.is_safe && (
                                  <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
                                    ⚠️ Unsafe
                                  </div>
                                )}
                              </div>
                              <div className="p-2 bg-white">
                                <div className="font-medium text-sm capitalize">
                                  {image.angle.replace(/_/g, ' ')}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {image.resolution}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Legacy format */
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Button size="sm" variant="outline" onClick={selectAllImages}>
                      Select All
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearAllSelections}>
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {currentCarForReview.generated_images?.map((image, index) => (
                      <div
                        key={index}
                        className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                          selectedImages.includes(image.url)
                            ? 'border-purple-500 ring-2 ring-purple-200'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                        onClick={() => toggleImageSelection(image.url)}
                      >
                        <div className="aspect-video bg-gray-100 relative">
                          <img
                            src={image.url}
                            alt={`${currentCarForReview.name} - ${image.angle}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          {selectedImages.includes(image.url) && (
                            <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full p-1">
                              <CheckCircle className="h-5 w-5" />
                            </div>
                          )}
                          {!image.is_safe && (
                            <div className="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded text-xs">
                              ⚠️ Unsafe
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-white">
                          <div className="font-medium text-sm capitalize">
                            {image.angle.replace(/_/g, ' ')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {image.resolution}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default IdeogramCarImageGenerator;
