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

interface CarFormData {
  brand: string;
  model: string;
  variant: string;
  price_min: string;
  price_max: string;
  fuel_type: string;
  transmission: string;
  body_type: string;
  seating_capacity: string;
  engine_type: string;
  max_power: string;
  max_torque: string;
  mileage: string;
  bootspace_litres: string;
  colors: string;
  color_codes: string;
  description: string;
  status: string;
  // Images (8 angles)
  image_url_1: string;
  image_url_2: string;
  image_url_3: string;
  image_url_4: string;
  image_url_5: string;
  image_url_6: string;
  image_url_7: string;
  image_url_8: string;
}

const AddEditCar = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<CarFormData>({
    brand: "",
    model: "",
    variant: "",
    price_min: "",
    price_max: "",
    fuel_type: "Petrol",
    transmission: "Manual",
    body_type: "Sedan",
    seating_capacity: "",
    engine_type: "",
    max_power: "",
    max_torque: "",
    mileage: "",
    bootspace_litres: "",
    colors: "",
    color_codes: "",
    description: "",
    status: "active",
    image_url_1: "",
    image_url_2: "",
    image_url_3: "",
    image_url_4: "",
    image_url_5: "",
    image_url_6: "",
    image_url_7: "",
    image_url_8: "",
  });

  // Fetch car data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchCar();
    }
  }, [id, isEditMode]);

  const fetchCar = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/cars/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch car");
      }

      const result = await response.json();

      if (result.success) {
        const car = result.data;
        setFormData({
          brand: car.brand || "",
          model: car.model || "",
          variant: car.variant || "",
          price_min: car.price_min?.toString() || "",
          price_max: car.price_max?.toString() || "",
          fuel_type: car.fuel_type || "Petrol",
          transmission: car.transmission || "Manual",
          body_type: car.body_type || "Sedan",
          seating_capacity: car.seating_capacity?.toString() || "",
          engine_type: car.engine_type || "",
          max_power: car.max_power || "",
          max_torque: car.max_torque || "",
          mileage: car.mileage || "",
          bootspace_litres: car.bootspace_litres || "",
          colors: car.colors || "",
          color_codes: car.color_codes || "",
          description: car.description || "",
          status: car.status || "active",
          // Handle both array format (old) and object format (new) for images
          image_url_1: (typeof car.images === 'object' && !Array.isArray(car.images))
            ? (car.images?.front_3_4 || "")
            : (car.images?.[0] || ""),
          image_url_2: (typeof car.images === 'object' && !Array.isArray(car.images))
            ? (car.images?.front_view || "")
            : (car.images?.[1] || ""),
          image_url_3: (typeof car.images === 'object' && !Array.isArray(car.images))
            ? (car.images?.left_side || "")
            : (car.images?.[2] || ""),
          image_url_4: (typeof car.images === 'object' && !Array.isArray(car.images))
            ? (car.images?.right_side || "")
            : (car.images?.[3] || ""),
          image_url_5: (typeof car.images === 'object' && !Array.isArray(car.images))
            ? (car.images?.rear_view || "")
            : (car.images?.[4] || ""),
          image_url_6: (typeof car.images === 'object' && !Array.isArray(car.images))
            ? (car.images?.interior_dash || "")
            : (car.images?.[5] || ""),
          image_url_7: (typeof car.images === 'object' && !Array.isArray(car.images))
            ? (car.images?.interior_cabin || "")
            : (car.images?.[6] || ""),
          image_url_8: (typeof car.images === 'object' && !Array.isArray(car.images))
            ? (car.images?.interior_steering || "")
            : (car.images?.[7] || ""),
        });
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
    const fieldName = `image_url_${imageIndex}` as keyof CarFormData;
    const imageUrl = formData[fieldName];

    // If it's an S3 URL and we're in edit mode, delete from S3
    if (imageUrl && isEditMode && id && imageUrl.includes('amazonaws.com')) {
      try {
        const response = await fetch(`http://localhost:3001/api/admin/cars/${id}/delete-image`, {
          method: 'POST',
          headers: {
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

    setFormData((prev) => ({
      ...prev,
      [fieldName]: "",
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
      const fieldName = `image_url_${imageIndex}` as keyof CarFormData;
      const currentImageUrl = formData[fieldName];

      // If we're in edit mode and there's an existing image, delete it first
      if (currentImageUrl && isEditMode && id && currentImageUrl.includes('amazonaws.com')) {
        try {
          const deleteResponse = await fetch(`http://localhost:3001/api/admin/cars/${id}/delete-image`, {
            method: 'POST',
            headers: {
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

      const response = await fetch('http://localhost:3001/api/admin/cars/ideogram-generate-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        setFormData((prev) => ({
          ...prev,
          [fieldName]: result.imageUrl,
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

      // Prepare data with angle-mapped images
      const angleKeys = [
        "front_3_4",
        "front_view",
        "left_side",
        "right_side",
        "rear_view",
        "interior_dash",
        "interior_cabin",
        "interior_steering"
      ];

      const images = {};
      if (formData.image_url_1) images[angleKeys[0]] = formData.image_url_1;
      if (formData.image_url_2) images[angleKeys[1]] = formData.image_url_2;
      if (formData.image_url_3) images[angleKeys[2]] = formData.image_url_3;
      if (formData.image_url_4) images[angleKeys[3]] = formData.image_url_4;
      if (formData.image_url_5) images[angleKeys[4]] = formData.image_url_5;
      if (formData.image_url_6) images[angleKeys[5]] = formData.image_url_6;
      if (formData.image_url_7) images[angleKeys[6]] = formData.image_url_7;
      if (formData.image_url_8) images[angleKeys[7]] = formData.image_url_8;

      const carData = {
        brand: formData.brand,
        model: formData.model,
        variant: formData.variant,
        price_min: formData.price_min ? parseInt(formData.price_min) : null,
        price_max: formData.price_max ? parseInt(formData.price_max) : null,
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        body_type: formData.body_type,
        seating_capacity: formData.seating_capacity
          ? parseInt(formData.seating_capacity)
          : null,
        engine_type: formData.engine_type,
        max_power: formData.max_power,
        max_torque: formData.max_torque,
        mileage: formData.mileage,
        bootspace_litres: formData.bootspace_litres,
        colors: formData.colors,
        color_codes: formData.color_codes,
        description: formData.description,
        status: formData.status,
        images: Object.keys(images).length > 0 ? images : null,
      };

      let response;
      if (isEditMode) {
        response = await fetch(`http://localhost:3001/api/admin/cars/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(carData),
        });
      } else {
        response = await fetch("http://localhost:3001/api/admin/cars", {
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
              const fieldName = `image_url_${index}` as keyof CarFormData;
              const imageUrl = formData[fieldName];
              const isGenerating = generatingImage && generatingIndex === index;

              return (
                <div key={index} className="space-y-2 p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={fieldName} className="font-medium">
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
                        src={imageUrl}
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
                          onClick={() => window.open(imageUrl, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Full
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Image URL Input */}
                  <Input
                    id={fieldName}
                    name={fieldName}
                    type="url"
                    value={imageUrl}
                    onChange={handleChange}
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
