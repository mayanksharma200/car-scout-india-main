import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
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
  engine_capacity: string;
  power: string;
  torque: string;
  mileage: string;
  boot_space: string;
  colors: string;
  color_codes: string;
  description: string;
  status: string;
  // Images
  image_url_1: string;
  image_url_2: string;
  image_url_3: string;
  image_url_4: string;
}

const AddEditCar = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
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
    engine_capacity: "",
    power: "",
    torque: "",
    mileage: "",
    boot_space: "",
    colors: "",
    color_codes: "",
    description: "",
    status: "active",
    image_url_1: "",
    image_url_2: "",
    image_url_3: "",
    image_url_4: "",
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
          engine_capacity: car.engine_capacity || "",
          power: car.power || "",
          torque: car.torque || "",
          mileage: car.mileage || "",
          boot_space: car.boot_space || "",
          colors: car.colors || "",
          color_codes: car.color_codes || "",
          description: car.description || "",
          status: car.status || "active",
          image_url_1: car.images?.[0] || "",
          image_url_2: car.images?.[1] || "",
          image_url_3: car.images?.[2] || "",
          image_url_4: car.images?.[3] || "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.brand || !formData.model) {
      toast.error("Brand and Model are required");
      return;
    }

    try {
      setSaving(true);

      // Prepare data
      const images: string[] = [];
      if (formData.image_url_1) images.push(formData.image_url_1);
      if (formData.image_url_2) images.push(formData.image_url_2);
      if (formData.image_url_3) images.push(formData.image_url_3);
      if (formData.image_url_4) images.push(formData.image_url_4);

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
        engine_capacity: formData.engine_capacity,
        power: formData.power,
        torque: formData.torque,
        mileage: formData.mileage,
        boot_space: formData.boot_space,
        colors: formData.colors,
        color_codes: formData.color_codes,
        description: formData.description,
        status: formData.status,
        images: images.length > 0 ? images : null,
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
              <Label htmlFor="engine_capacity">Engine Capacity</Label>
              <Input
                id="engine_capacity"
                name="engine_capacity"
                value={formData.engine_capacity}
                onChange={handleChange}
                placeholder="e.g., 1197cc"
              />
            </div>

            <div>
              <Label htmlFor="power">Power</Label>
              <Input
                id="power"
                name="power"
                value={formData.power}
                onChange={handleChange}
                placeholder="e.g., 88.5 bhp @ 6000 rpm"
              />
            </div>

            <div>
              <Label htmlFor="torque">Torque</Label>
              <Input
                id="torque"
                name="torque"
                value={formData.torque}
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
              <Label htmlFor="boot_space">Boot Space</Label>
              <Input
                id="boot_space"
                name="boot_space"
                value={formData.boot_space}
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
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="image_url_1">Image URL 1 (Primary)</Label>
              <Input
                id="image_url_1"
                name="image_url_1"
                type="url"
                value={formData.image_url_1}
                onChange={handleChange}
                placeholder="https://example.com/image1.jpg"
              />
            </div>

            <div>
              <Label htmlFor="image_url_2">Image URL 2</Label>
              <Input
                id="image_url_2"
                name="image_url_2"
                type="url"
                value={formData.image_url_2}
                onChange={handleChange}
                placeholder="https://example.com/image2.jpg"
              />
            </div>

            <div>
              <Label htmlFor="image_url_3">Image URL 3</Label>
              <Input
                id="image_url_3"
                name="image_url_3"
                type="url"
                value={formData.image_url_3}
                onChange={handleChange}
                placeholder="https://example.com/image3.jpg"
              />
            </div>

            <div>
              <Label htmlFor="image_url_4">Image URL 4</Label>
              <Input
                id="image_url_4"
                name="image_url_4"
                type="url"
                value={formData.image_url_4}
                onChange={handleChange}
                placeholder="https://example.com/image4.jpg"
              />
            </div>
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
