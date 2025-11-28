import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2, X, Wand2, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface CarFormData {
  // Basic Information
  external_id: string;
  brand: string;
  model: string;
  variant: string;
  body_type: string;
  fuel_type: string;
  transmission: string;
  seating_capacity: string;
  engine_capacity: string;
  status: string;
  api_source: string;

  // Pricing
  price_min: string;
  price_max: string;
  exact_price: string;
  ex_showroom_price: string;
  rto_charges: string;
  insurance_cost: string;
  mumbai_price: string;
  bangalore_price: string;
  delhi_price: string;
  pune_price: string;
  hyderabad_price: string;
  chennai_price: string;
  kolkata_price: string;
  ahmedabad_price: string;

  // Specifications
  engine_type: string;
  max_power: string;
  max_torque: string;
  mileage: string;
  top_speed: string;
  acceleration: string;
  length_mm: string;
  width_mm: string;
  height_mm: string;
  wheelbase_mm: string;
  ground_clearance_mm: string;
  bootspace_litres: string;
  fuel_tank_capacity_litres: string;

  // Safety & Features
  airbags: string;
  ncap_rating: string;
  abs: boolean;
  esc: boolean;
  sunroof: string;
  ac_type: string;
  cruise_control: boolean;

  // Warranty
  warranty_years: string;
  warranty_km: string;
  battery_warranty_years: string;
  battery_warranty_km: string;

  // Colors & Description
  colors: string;
  color_codes: string;
  description: string;

  // Images
  color_images: Record<string, string[]>; // Map of color name to array of 8 images
}

const AddEditCar = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAuthHeaders } = useAdminAuth();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [activeColor, setActiveColor] = useState<string>("default");
  const [selectedColorForGeneration, setSelectedColorForGeneration] = useState<string>("");

  const [formData, setFormData] = useState<CarFormData>({
    // Basic Information
    external_id: "",
    brand: "",
    model: "",
    variant: "",
    body_type: "Sedan",
    fuel_type: "Petrol",
    transmission: "Manual",
    seating_capacity: "",
    engine_capacity: "",
    status: "active",
    api_source: "manual",

    // Pricing
    price_min: "",
    price_max: "",
    exact_price: "",
    ex_showroom_price: "",
    rto_charges: "",
    insurance_cost: "",
    mumbai_price: "",
    bangalore_price: "",
    delhi_price: "",
    pune_price: "",
    hyderabad_price: "",
    chennai_price: "",
    kolkata_price: "",
    ahmedabad_price: "",

    // Specifications
    engine_type: "",
    max_power: "",
    max_torque: "",
    mileage: "",
    top_speed: "",
    acceleration: "",
    length_mm: "",
    width_mm: "",
    height_mm: "",
    wheelbase_mm: "",
    ground_clearance_mm: "",
    bootspace_litres: "",
    fuel_tank_capacity_litres: "",

    // Safety & Features
    airbags: "",
    ncap_rating: "",
    abs: false,
    esc: false,
    sunroof: "",
    ac_type: "",
    cruise_control: false,

    // Warranty
    warranty_years: "",
    warranty_km: "",
    battery_warranty_years: "",
    battery_warranty_km: "",

    // Colors & Description
    colors: "",
    color_codes: "",
    description: "",

    // Images
    color_images: {
      default: Array(8).fill("")
    },
  });

  // Fetch car data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchCar();
    }
  }, [id, isEditMode]);

  // Debugging logs
  useEffect(() => {
    console.log("🎨 Active Color Changed:", activeColor);
    console.log("🖼️ Current Color Images Map:", formData.color_images);
    console.log("🔍 Images for Active Color:", formData.color_images[activeColor]);
  }, [activeColor, formData.color_images]);

  const fetchCar = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cars/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch car");
      }

      const result = await response.json();

      if (result.success) {
        const car = result.data;
        console.log("🚗 Raw Car Data Images:", car.images);
        // Handle images - support both legacy array/object and new color map
        let colorImages: Record<string, string[]> = { default: Array(8).fill("") };

        // Check for the new structured format first
        if (car.color_variant_images && Object.keys(car.color_variant_images).length > 0) {
          console.log("🌈 Using color_variant_images:", car.color_variant_images);

          const angleOrder = [
            "front_3_4", "front_view", "left_side", "right_side",
            "rear_view", "interior_dash", "interior_cabin", "interior_steering"
          ];

          Object.keys(car.color_variant_images).forEach(color => {
            const colorData = car.color_variant_images[color];
            if (colorData && colorData.images) {
              // Trim the color name to match UI
              const trimmedColor = color.trim();

              // Convert object to array based on angle order
              const imagesArray = angleOrder.map(angle => colorData.images[angle] || "");
              colorImages[trimmedColor] = imagesArray;
            }
          });
        }
        // Fallback to legacy images field
        else if (car.images) {
          console.log("⚠️ Using legacy images field");
          if (Array.isArray(car.images)) {
            // Legacy array format -> assign to default
            colorImages.default = [...car.images, ...Array(8).fill("")].slice(0, 8);
          } else if (typeof car.images === 'object') {
            // Check if it's the old single-object format (keys are angles) or new color map
            const keys = Object.keys(car.images);
            const isAngleKeys = keys.some(k => ['front_3_4', 'front_view'].includes(k));

            if (isAngleKeys) {
              // Old single object format -> convert to array and assign to default
              const angles = [
                "front_3_4", "front_view", "left_side", "right_side",
                "rear_view", "interior_dash", "interior_cabin", "interior_steering"
              ];
              colorImages.default = angles.map(angle => car.images[angle] || "");
            } else {
              // New color map format -> assign directly
              // Ensure each color has exactly 8 images
              Object.keys(car.images).forEach(color => {
                if (Array.isArray(car.images[color])) {
                  // Trim the color name to match what we do in the UI (splitting by ; and trimming)
                  const trimmedColor = color.trim();
                  colorImages[trimmedColor] = [...car.images[color], ...Array(8).fill("")].slice(0, 8);
                }
              });
            }
          }
        }

        // If default is missing but we have other colors, we can keep default empty or set it to first color
        if (!colorImages.default && Object.keys(colorImages).length > 0) {
          // Ensure default exists for UI consistency if needed
          colorImages.default = Array(8).fill("");
        }

        setFormData({
          // Basic Information
          external_id: car.external_id || "",
          brand: car.brand || "",
          model: car.model || "",
          variant: car.variant || "",
          body_type: car.body_type || "Sedan",
          fuel_type: car.fuel_type || "Petrol",
          transmission: car.transmission || "Manual",
          seating_capacity: car.seating_capacity?.toString() || "",
          engine_capacity: car.engine_capacity || "",
          status: car.status || "active",
          api_source: car.api_source || "manual",

          // Pricing
          price_min: car.price_min?.toString() || "",
          price_max: car.price_max?.toString() || "",
          exact_price: car.exact_price || car.specifications?.["Price"] || "",
          ex_showroom_price: car.ex_showroom_price || car.specifications?.["Ex-Showroom price"] || "",
          rto_charges: car.rto_charges || car.specifications?.["RTO"] || "",
          insurance_cost: car.insurance_cost || car.specifications?.["Insurance"] || "",
          mumbai_price: car.mumbai_price || car.specifications?.["Mumbai"] || "",
          bangalore_price: car.bangalore_price || car.specifications?.["Bangalore"] || "",
          delhi_price: car.delhi_price || car.specifications?.["Delhi"] || "",
          pune_price: car.pune_price || car.specifications?.["Pune"] || "",
          hyderabad_price: car.hyderabad_price || car.specifications?.["Hyderabad"] || "",
          chennai_price: car.chennai_price || car.specifications?.["Chennai"] || "",
          kolkata_price: car.kolkata_price || car.specifications?.["Kolkata"] || "",
          ahmedabad_price: car.ahmedabad_price || car.specifications?.["Ahmedabad"] || "",

          // Specifications
          engine_type: car.engine_type || car.specifications?.["Engine"] || "",
          max_power: car.max_power || car.specifications?.["Max Motor Performance"] || "",
          max_torque: car.max_torque || "",
          mileage: car.mileage || "",
          top_speed: car.top_speed?.toString() || "",
          acceleration: car.acceleration?.toString() || car.specifications?.["Acceleration (0-100 kmph)"]?.toString() || "",
          length_mm: car.length_mm || car.specifications?.["Length"]?.replace(' mm', '') || "",
          width_mm: car.width_mm || car.specifications?.["Width"]?.replace(' mm', '') || "",
          height_mm: car.height_mm || car.specifications?.["Height"]?.replace(' mm', '') || "",
          wheelbase_mm: car.wheelbase_mm || car.specifications?.["Wheelbase"]?.replace(' mm', '') || "",
          ground_clearance_mm: car.ground_clearance_mm || car.specifications?.["Ground Clearance"]?.replace(' mm', '') || "",
          bootspace_litres: car.bootspace_litres || car.specifications?.["Bootspace"]?.replace(' litres', '') || "",
          fuel_tank_capacity_litres: car.fuel_tank_capacity_litres || "",

          // Safety & Features
          airbags: car.airbags || car.specifications?.["Airbags"] || "",
          ncap_rating: car.ncap_rating || car.specifications?.["NCAP Rating"] || "",
          abs: car.abs || (car.specifications?.["Anti-Lock Braking System (ABS)"] === "Yes"),
          esc: car.esc || (car.specifications?.["Electronic Stability Program (ESP)"] === "Yes"),
          sunroof: car.sunroof || car.specifications?.["Sunroof / Moonroof"] || "",
          ac_type: car.ac_type || car.specifications?.["Air Conditioner"] || "",
          cruise_control: car.cruise_control || (car.specifications?.["Cruise Control"] === "Yes"),

          // Warranty
          warranty_years: car.warranty_years?.toString() || car.specifications?.["Warranty (Years)"]?.toString() || "",
          warranty_km: car.warranty_km?.toString() || car.specifications?.["Warranty (Kilometres)"]?.toString() || "",
          battery_warranty_years: car.battery_warranty_years?.toString() || car.specifications?.["Battery Warranty (Years)"]?.toString() || "",
          battery_warranty_km: car.battery_warranty_km?.toString() || car.specifications?.["Battery Warranty (Kilometres)"]?.toString() || "",

          // Colors & Description
          colors: car.colors || car.specifications?.["Color Name"] || "",
          color_codes: car.color_codes || car.specifications?.["Color RGB"] || "",
          description: car.description || car.specifications?.["Description"] || "",

          // Images
          color_images: colorImages,
        });

        // Set first color as active by default
        if (car.colors) {
          const firstColor = car.colors.split(';')[0].trim();
          if (firstColor) {
            setActiveColor(firstColor);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching car:", error);
      toast.error("Failed to load car details");
      navigate("/admin/cars");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Delete specific image
  const handleDeleteImage = async (imageIndex: number) => {
    // 1-based index to 0-based
    const arrayIndex = imageIndex - 1;
    const currentImages = formData.color_images[activeColor] || Array(8).fill("");
    const imageUrl = currentImages[arrayIndex];

    // If it's an S3 URL and we're in edit mode, delete from S3
    if (imageUrl && typeof imageUrl === 'string' && isEditMode && id && imageUrl.includes('amazonaws.com')) {
      try {
        // Get auth headers
        const headers = getAuthHeaders();

        if (!headers.Authorization) {
          console.error("No auth token found for delete");
          return;
        }

        const response = await fetch(`/api/admin/cars/${id}/delete-image`, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageUrl }),
        });

        if (!response.ok) {
          console.error('Failed to delete image from S3');
        }
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }

    const newImages = [...currentImages];
    newImages[arrayIndex] = "";

    setFormData((prev) => ({
      ...prev,
      color_images: {
        ...prev.color_images,
        [activeColor]: newImages
      }
    }));
    toast.success(`Image ${imageIndex} deleted`);
  };

  // Generate image using Ideogram AI for specific angle
  const handleGenerateImage = async (imageIndex: number) => {
    if (!formData.brand || !formData.model) {
      toast.error("Please fill in Brand and Model first");
      return;
    }

    setGeneratingImage(true);
    setGeneratingIndex(imageIndex);

    try {
      // 1-based index to 0-based
      const arrayIndex = imageIndex - 1;
      const currentImages = formData.color_images[activeColor] || Array(8).fill("");
      const currentImageUrl = currentImages[arrayIndex];

      // If we're in edit mode and there's an existing image, delete it first
      if (currentImageUrl && typeof currentImageUrl === 'string' && isEditMode && id && currentImageUrl.includes('amazonaws.com')) {
        try {
          // Get auth headers
          const headers = getAuthHeaders();

          if (!headers.Authorization) {
            console.error("No auth token found for delete old image");
            return;
          }

          const deleteResponse = await fetch(`/api/admin/cars/${id}/delete-image`, {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ imageUrl: currentImageUrl }),
          });

          if (deleteResponse.ok) {
            console.log(`✅ Deleted old image from S3: ${currentImageUrl}`);
          } else {
            console.error('Failed to delete old image from S3');
          }
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }

      const angleNames = [
        "front_3_4",
        "front_view",
        "left_side",
        "right_side",
        "rear_view",
        "interior_dash",
        "interior_cabin",
        "interior_steering"
      ];

      // Parse colors to get selected color code
      // Use activeColor if it's not default, otherwise try selectedColorForGeneration
      let selectedColorName = activeColor !== 'default' ? activeColor : selectedColorForGeneration;
      let selectedColorCode = null;

      if (formData.colors && formData.color_codes && selectedColorName) {
        const colorNames = formData.colors.split(';').map(c => c.trim());
        const colorCodes = formData.color_codes.split(';').map(c => c.trim());
        const colorIndex = colorNames.indexOf(selectedColorName);
        if (colorIndex !== -1 && colorCodes[colorIndex]) {
          selectedColorCode = colorCodes[colorIndex].startsWith('#')
            ? colorCodes[colorIndex]
            : `#${colorCodes[colorIndex]}`;
        }
      }

      // Get auth headers from AdminAuthContext
      const headers = getAuthHeaders();

      if (!headers.Authorization) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch('/api/admin/cars/ideogram-generate-single', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carId: id,
          carData: {
            brand: formData.brand,
            model: formData.model,
            variant: formData.variant || '',
            body_type: formData.body_type,
            fuel_type: formData.fuel_type,
            colors: formData.colors || '',
            color_codes: formData.color_codes || ''
          },
          angle: angleNames[imageIndex - 1], // 1-indexed to 0-indexed
          colorName: selectedColorName || null,
          colorCode: selectedColorCode || null,
          options: {
            num_images: 1,
            aspect_ratio: '16x9',
            rendering_speed: 'TURBO',
            style_type: 'REALISTIC'
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate image');
      }

      const result = await response.json();

      if (result.success && result.imageUrl) {
        const newImages = [...currentImages];
        newImages[arrayIndex] = result.imageUrl;

        setFormData((prev) => ({
          ...prev,
          color_images: {
            ...prev.color_images,
            [activeColor]: newImages
          }
        }));
        toast.success(`Image ${imageIndex} generated and uploaded successfully!`);
      } else {
        throw new Error('No image URL returned');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error(`Failed to generate image: ${error.message}`);
    } finally {
      setGeneratingImage(false);
      setGeneratingIndex(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.brand || !formData.model) {
      toast.error("Brand and Model are required");
      return;
    }

    try {
      setSaving(true);

      // Construct color_variant_images from formData.color_images
      const colorVariantImages: Record<string, any> = {};

      if (formData.color_images) {
        // Parse colors and color codes to map color names to their codes
        const colorNames = formData.colors ? formData.colors.split(';').map(c => c.trim()) : [];
        const colorCodes = formData.color_codes ? formData.color_codes.split(';').map(c => c.trim()) : [];

        // Create a map of color name to color code
        const colorCodeMap: Record<string, string> = {};
        colorNames.forEach((name, index) => {
          if (name && colorCodes[index]) {
            colorCodeMap[name] = colorCodes[index].startsWith('#') ? colorCodes[index] : `#${colorCodes[index]}`;
          }
        });

        Object.keys(formData.color_images).forEach(colorName => {
          // Skip the default color as it's not a real color
          if (colorName === 'default') return;

          const imagesArray = formData.color_images[colorName];
          if (Array.isArray(imagesArray) && imagesArray.length > 0) {
            const angleOrder = [
              'front_3_4', 'front_view', 'left_side', 'right_side',
              'rear_view', 'interior_dash', 'interior_cabin', 'interior_steering'
            ];

            const imagesObj: Record<string, string> = {};
            angleOrder.forEach((angle, index) => {
              if (imagesArray[index]) {
                imagesObj[angle] = imagesArray[index];
              }
            });

            // Get the color code for this color
            const colorCode = colorCodeMap[colorName] || null;

            colorVariantImages[colorName] = {
              color_code: colorCode,
              images: imagesObj
            };
          }
        });
      }

      // Prepare data
      const carData = {
        // Basic Information
        external_id: formData.external_id || null,
        brand: formData.brand,
        model: formData.model,
        variant: formData.variant,
        body_type: formData.body_type,
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        seating_capacity: formData.seating_capacity
          ? parseInt(formData.seating_capacity)
          : null,
        engine_capacity: formData.engine_capacity,
        status: formData.status,
        api_source: formData.api_source,

        // Pricing
        price_min: formData.price_min ? parseInt(formData.price_min) : null,
        price_max: formData.price_max ? parseInt(formData.price_max) : null,
        exact_price: formData.exact_price || null,
        ex_showroom_price: formData.ex_showroom_price || null,
        rto_charges: formData.rto_charges || null,
        insurance_cost: formData.insurance_cost || null,
        mumbai_price: formData.mumbai_price || null,
        bangalore_price: formData.bangalore_price || null,
        delhi_price: formData.delhi_price || null,
        pune_price: formData.pune_price || null,
        hyderabad_price: formData.hyderabad_price || null,
        chennai_price: formData.chennai_price || null,
        kolkata_price: formData.kolkata_price || null,
        ahmedabad_price: formData.ahmedabad_price || null,

        // Specifications
        engine_type: formData.engine_type,
        max_power: formData.max_power,
        max_torque: formData.max_torque,
        mileage: formData.mileage,
        top_speed: formData.top_speed ? parseInt(formData.top_speed) : null,
        acceleration: formData.acceleration ? parseFloat(formData.acceleration) : null,
        length_mm: formData.length_mm,
        width_mm: formData.width_mm,
        height_mm: formData.height_mm,
        wheelbase_mm: formData.wheelbase_mm,
        ground_clearance_mm: formData.ground_clearance_mm,
        bootspace_litres: formData.bootspace_litres,
        fuel_tank_capacity_litres: formData.fuel_tank_capacity_litres,

        // Safety & Features
        airbags: formData.airbags || null,
        ncap_rating: formData.ncap_rating || null,
        abs: formData.abs,
        esc: formData.esc,
        sunroof: formData.sunroof || null,
        ac_type: formData.ac_type || null,
        cruise_control: formData.cruise_control,

        // Warranty
        warranty_years: formData.warranty_years ? parseInt(formData.warranty_years) : null,
        warranty_km: formData.warranty_km ? parseInt(formData.warranty_km) : null,
        battery_warranty_years: formData.battery_warranty_years ? parseInt(formData.battery_warranty_years) : null,
        battery_warranty_km: formData.battery_warranty_km ? parseInt(formData.battery_warranty_km) : null,

        // Colors & Description
        colors: formData.colors,
        color_codes: formData.color_codes,
        description: formData.description,

        // Images - send both formats for compatibility, but prioritize color_variant_images
        images: formData.color_images,
        color_variant_images: colorVariantImages,

        // Add ideogram_images metadata if we have color_variant_images with data
        ideogram_images: Object.keys(colorVariantImages).length > 0 ? {
          valid: true,
          source: 'ideogram',
          last_updated: new Date().toISOString(),
          total_colors: Object.keys(colorVariantImages).length,
          total_images: Object.values(colorVariantImages).reduce((total, color) => {
            return total + (color.images ? Object.keys(color.images).length : 0);
          }, 0)
        } : null,
      };

      let response;
      if (isEditMode) {
        response = await fetch(`/api/admin/cars/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(carData),
        });
      } else {
        response = await fetch("/api/admin/cars", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(carData),
        });
      }

      const result = await response.json();

      if (result.success) {
        toast.success(
          isEditMode ? "Car updated successfully" : "Car created successfully"
        );
        navigate("/admin/cars");
      } else {
        toast.error(result.error || "Failed to save car");
      }
    } catch (error) {
      console.error("Error saving car:", error);
      toast.error("Failed to save car");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/admin/cars">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Edit Car" : "Add New Car"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode
              ? "Update car details in your inventory"
              : "Add a new car to your inventory"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="external_id">External ID</Label>
              <Input
                id="external_id"
                name="external_id"
                value={formData.external_id}
                onChange={handleChange}
                placeholder="e.g., bmw_3_series_320d_luxury_edition"
              />
            </div>

            <div>
              <Label htmlFor="brand">
                Brand <span className="text-destructive">*</span>
              </Label>
              <Input
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                placeholder="e.g., Maruti Suzuki"
                required
              />
            </div>

            <div>
              <Label htmlFor="model">
                Model <span className="text-destructive">*</span>
              </Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="e.g., Swift"
                required
              />
            </div>

            <div>
              <Label htmlFor="variant">Variant</Label>
              <Input
                id="variant"
                name="variant"
                value={formData.variant}
                onChange={handleChange}
                placeholder="e.g., VXI, ZXI"
              />
            </div>

            <div>
              <Label htmlFor="engine_capacity">Engine Capacity</Label>
              <Input
                id="engine_capacity"
                name="engine_capacity"
                value={formData.engine_capacity}
                onChange={handleChange}
                placeholder="e.g., 1995 cc"
              />
            </div>

            <div>
              <Label htmlFor="body_type">Body Type</Label>
              <Select
                value={formData.body_type}
                onValueChange={(value) => handleSelectChange("body_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hatchback">Hatchback</SelectItem>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="MUV">MUV</SelectItem>
                  <SelectItem value="Coupe">Coupe</SelectItem>
                  <SelectItem value="Convertible">Convertible</SelectItem>
                  <SelectItem value="Pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fuel_type">Fuel Type</Label>
              <Select
                value={formData.fuel_type}
                onValueChange={(value) => handleSelectChange("fuel_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Petrol">Petrol</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Electric">Electric</SelectItem>
                  <SelectItem value="CNG">CNG</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                  <SelectItem value="Petrol+CNG">Petrol+CNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transmission">Transmission</Label>
              <Select
                value={formData.transmission}
                onValueChange={(value) =>
                  handleSelectChange("transmission", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manual">Manual</SelectItem>
                  <SelectItem value="Automatic">Automatic</SelectItem>
                  <SelectItem value="AMT">AMT</SelectItem>
                  <SelectItem value="CVT">CVT</SelectItem>
                  <SelectItem value="DCT">DCT</SelectItem>
                  <SelectItem value="Automatic (TC)">Automatic (TC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="seating_capacity">Seating Capacity</Label>
              <Input
                id="seating_capacity"
                name="seating_capacity"
                type="number"
                value={formData.seating_capacity}
                onChange={handleChange}
                placeholder="e.g., 5"
              />
            </div>

            <div>
              <Label htmlFor="api_source">API Source</Label>
              <Select
                value={formData.api_source}
                onValueChange={(value) => handleSelectChange("api_source", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="csv_import">CSV Import</SelectItem>
                  <SelectItem value="api_scrape">API Scrape</SelectItem>
                  <SelectItem value="dealer_feed">Dealer Feed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing (in Rupees)</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="exact_price">Exact Price</Label>
              <Input
                id="exact_price"
                name="exact_price"
                value={formData.exact_price}
                onChange={handleChange}
                placeholder="e.g., ₹ 50.88 Lakh"
              />
            </div>

            <div>
              <Label htmlFor="price_min">Minimum Price</Label>
              <Input
                id="price_min"
                name="price_min"
                type="number"
                value={formData.price_min}
                onChange={handleChange}
                placeholder="e.g., 600000"
              />
            </div>

            <div>
              <Label htmlFor="price_max">Maximum Price</Label>
              <Input
                id="price_max"
                name="price_max"
                type="number"
                value={formData.price_max}
                onChange={handleChange}
                placeholder="e.g., 850000"
              />
            </div>

            <div>
              <Label htmlFor="ex_showroom_price">Ex-Showroom Price</Label>
              <Input
                id="ex_showroom_price"
                name="ex_showroom_price"
                value={formData.ex_showroom_price}
                onChange={handleChange}
                placeholder="e.g., ₹46,90,000.00"
              />
            </div>

            <div>
              <Label htmlFor="rto_charges">RTO Charges</Label>
              <Input
                id="rto_charges"
                name="rto_charges"
                value={formData.rto_charges}
                onChange={handleChange}
                placeholder="e.g., ₹5,62,800.00"
              />
            </div>

            <div>
              <Label htmlFor="insurance_cost">Insurance Cost</Label>
              <Input
                id="insurance_cost"
                name="insurance_cost"
                value={formData.insurance_cost}
                onChange={handleChange}
                placeholder="e.g., ₹1,37,066.00"
              />
            </div>

            <div>
              <Label htmlFor="mumbai_price">Mumbai Price</Label>
              <Input
                id="mumbai_price"
                name="mumbai_price"
                value={formData.mumbai_price}
                onChange={handleChange}
                placeholder="e.g., ₹ 56.52 Lakh onwards"
              />
            </div>

            <div>
              <Label htmlFor="bangalore_price">Bangalore Price</Label>
              <Input
                id="bangalore_price"
                name="bangalore_price"
                value={formData.bangalore_price}
                onChange={handleChange}
                placeholder="e.g., ₹ 59.86 Lakh onwards"
              />
            </div>

            <div>
              <Label htmlFor="delhi_price">Delhi Price</Label>
              <Input
                id="delhi_price"
                name="delhi_price"
                value={formData.delhi_price}
                onChange={handleChange}
                placeholder="e.g., ₹ 54.69 Lakh onwards"
              />
            </div>

            <div>
              <Label htmlFor="pune_price">Pune Price</Label>
              <Input
                id="pune_price"
                name="pune_price"
                value={formData.pune_price}
                onChange={handleChange}
                placeholder="e.g., ₹ 57.23 Lakh onwards"
              />
            </div>

            <div>
              <Label htmlFor="hyderabad_price">Hyderabad Price</Label>
              <Input
                id="hyderabad_price"
                name="hyderabad_price"
                value={formData.hyderabad_price}
                onChange={handleChange}
                placeholder="e.g., ₹ 58.20 Lakh onwards"
              />
            </div>

            <div>
              <Label htmlFor="chennai_price">Chennai Price</Label>
              <Input
                id="chennai_price"
                name="chennai_price"
                value={formData.chennai_price}
                onChange={handleChange}
                placeholder="e.g., ₹ 57.69 Lakh onwards"
              />
            </div>

            <div>
              <Label htmlFor="kolkata_price">Kolkata Price</Label>
              <Input
                id="kolkata_price"
                name="kolkata_price"
                value={formData.kolkata_price}
                onChange={handleChange}
                placeholder="e.g., ₹ 54.98 Lakh onwards"
              />
            </div>

            <div>
              <Label htmlFor="ahmedabad_price">Ahmedabad Price</Label>
              <Input
                id="ahmedabad_price"
                name="ahmedabad_price"
                value={formData.ahmedabad_price}
                onChange={handleChange}
                placeholder="e.g., ₹ 53.16 Lakh onwards"
              />
            </div>
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="engine_type">Engine Type</Label>
              <Input
                id="engine_type"
                name="engine_type"
                value={formData.engine_type}
                onChange={handleChange}
                placeholder="e.g., 1197cc"
              />
            </div>

            <div>
              <Label htmlFor="max_power">Power</Label>
              <Input
                id="max_power"
                name="max_power"
                value={formData.max_power}
                onChange={handleChange}
                placeholder="e.g., 88.5 bhp @ 6000 rpm"
              />
            </div>

            <div>
              <Label htmlFor="max_torque">Torque</Label>
              <Input
                id="max_torque"
                name="max_torque"
                value={formData.max_torque}
                onChange={handleChange}
                placeholder="e.g., 113 Nm @ 4400 rpm"
              />
            </div>

            <div>
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="e.g., 22.56 kmpl"
              />
            </div>

            <div>
              <Label htmlFor="bootspace_litres">Boot Space</Label>
              <Input
                id="bootspace_litres"
                name="bootspace_litres"
                value={formData.bootspace_litres}
                onChange={handleChange}
                placeholder="e.g., 268 litres"
              />
            </div>

            <div>
              <Label htmlFor="fuel_tank_capacity_litres">Fuel Tank Capacity</Label>
              <Input
                id="fuel_tank_capacity_litres"
                name="fuel_tank_capacity_litres"
                value={formData.fuel_tank_capacity_litres}
                onChange={handleChange}
                placeholder="e.g., 59 litres"
              />
            </div>
          </CardContent>
        </Card>

        {/* Safety & Features */}
        <Card>
          <CardHeader>
            <CardTitle>Safety & Features</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="airbags">Airbags</Label>
              <Input
                id="airbags"
                name="airbags"
                value={formData.airbags}
                onChange={handleChange}
                placeholder="e.g., 6 Airbags (Driver, Passenger, 2 Curtain, Driver Side, Front Passenger Side)"
              />
            </div>

            <div>
              <Label htmlFor="ncap_rating">NCAP Rating</Label>
              <Input
                id="ncap_rating"
                name="ncap_rating"
                value={formData.ncap_rating}
                onChange={handleChange}
                placeholder="e.g., 5 Star (Euro NCAP)"
              />
            </div>

            <div>
              <Label htmlFor="abs">Anti-lock Braking System (ABS)</Label>
              <Select
                value={formData.abs.toString()}
                onValueChange={(value) => handleSelectChange("abs", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="esc">Electronic Stability Control (ESC)</Label>
              <Select
                value={formData.esc.toString()}
                onValueChange={(value) => handleSelectChange("esc", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sunroof">Sunroof</Label>
              <Input
                id="sunroof"
                name="sunroof"
                value={formData.sunroof}
                onChange={handleChange}
                placeholder="e.g., Electrically Adjustable"
              />
            </div>

            <div>
              <Label htmlFor="ac_type">Air Conditioning Type</Label>
              <Input
                id="ac_type"
                name="ac_type"
                value={formData.ac_type}
                onChange={handleChange}
                placeholder="e.g., Yes (Automatic Three Zone)"
              />
            </div>

            <div>
              <Label htmlFor="cruise_control">Cruise Control</Label>
              <Select
                value={formData.cruise_control.toString()}
                onValueChange={(value) => handleSelectChange("cruise_control", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Warranty */}
        <Card>
          <CardHeader>
            <CardTitle>Warranty</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="warranty_years">Warranty Years</Label>
              <Input
                id="warranty_years"
                name="warranty_years"
                type="number"
                value={formData.warranty_years}
                onChange={handleChange}
                placeholder="e.g., 3"
              />
            </div>

            <div>
              <Label htmlFor="warranty_km">Warranty Kilometers</Label>
              <Input
                id="warranty_km"
                name="warranty_km"
                type="number"
                value={formData.warranty_km}
                onChange={handleChange}
                placeholder="e.g., 40000"
              />
            </div>

            <div>
              <Label htmlFor="battery_warranty_years">Battery Warranty Years</Label>
              <Input
                id="battery_warranty_years"
                name="battery_warranty_years"
                type="number"
                value={formData.battery_warranty_years}
                onChange={handleChange}
                placeholder="e.g., 8 (for EVs)"
              />
            </div>

            <div>
              <Label htmlFor="battery_warranty_km">Battery Warranty Kilometers</Label>
              <Input
                id="battery_warranty_km"
                name="battery_warranty_km"
                type="number"
                value={formData.battery_warranty_km}
                onChange={handleChange}
                placeholder="e.g., 160000 (for EVs)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Colors */}
        <Card>
          <CardHeader>
            <CardTitle>Colors</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="colors">Color Names (semicolon separated)</Label>
              <Input
                id="colors"
                name="colors"
                value={formData.colors}
                onChange={handleChange}
                placeholder="e.g., Pearl Arctic White;Grandeur Grey;Solid Fire Red"
              />
            </div>

            <div>
              <Label htmlFor="color_codes">Color Codes (semicolon separated)</Label>
              <Input
                id="color_codes"
                name="color_codes"
                value={formData.color_codes}
                onChange={handleChange}
                placeholder="e.g., #FFFFFF;#808080;#FF0000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>Car Images (8 angles)</span>
              <span className="text-sm text-muted-foreground font-normal">
                - Professional automotive photography
              </span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload or generate professional studio images for different car angles using Ideogram AI
            </p>

            {/* Color Selector Tabs */}
            <div className="mt-6 border-b">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {/* Default tab removed as per request */}

                {formData.colors && formData.colors.split(';').map((color, index) => {
                  const colorName = color.trim();
                  if (!colorName) return null;

                  const colorCodes = formData.color_codes?.split(';') || [];
                  const colorCode = colorCodes[index]?.trim() || '';
                  const hexCode = colorCode.startsWith('#') ? colorCode : `#${colorCode}`;

                  return (
                    <Button
                      key={index}
                      type="button"
                      variant={activeColor === colorName ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveColor(colorName)}
                      className="whitespace-nowrap flex items-center gap-2"
                    >
                      {colorCode && (
                        <div
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: hexCode }}
                        />
                      )}
                      {colorName}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Color Generation Selector - Removed as Default tab is gone */}
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
              const angleNames = [
                "Front 3/4",
                "Front View",
                "Left Side",
                "Right Side",
                "Rear View",
                "Interior Dash",
                "Interior Cabin",
                "Interior Steering"
              ];

              // Get current image for active color
              const currentImages = formData.color_images[activeColor] || Array(8).fill("");
              const imageUrl = currentImages[index - 1];

              const isGenerating = generatingImage && generatingIndex === index;

              return (
                <div key={index} className="space-y-2 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">
                      {index}. {angleNames[index - 1]}
                      {index === 1 && <span className="text-xs text-purple-600 ml-1">(Primary)</span>}
                    </Label>
                    {imageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteImage(index)}
                        className="h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Image Preview */}
                  {imageUrl && (
                    <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden group">
                      <img
                        src={typeof imageUrl === 'string' ? imageUrl : ''}
                        alt={angleNames[index - 1]}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => typeof imageUrl === 'string' && window.open(imageUrl, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Full
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Image URL Input */}
                  <Input
                    type="url"
                    value={typeof imageUrl === 'string' ? imageUrl : ''}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      const newImages = [...currentImages];
                      newImages[index - 1] = newUrl;

                      setFormData(prev => ({
                        ...prev,
                        color_images: {
                          ...prev.color_images,
                          [activeColor]: newImages
                        }
                      }));
                    }}
                    placeholder={`https://example.com/${angleNames[index - 1].toLowerCase().replace(/ /g, '-')}.jpg`}
                    className="text-sm"
                  />

                  {/* Generate with Ideogram Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateImage(index)}
                    disabled={isGenerating || !formData.brand || !formData.model}
                    className="w-full border-purple-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : imageUrl ? (
                      <>
                        <Wand2 className="w-3 h-3 mr-2" />
                        Replace with AI
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3 h-3 mr-2" />
                        Generate with Ideogram
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter car description..."
              rows={6}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Link to="/admin/cars">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditMode ? "Update Car" : "Create Car"}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddEditCar;
