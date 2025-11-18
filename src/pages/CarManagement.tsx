import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, Search, Filter, MoreHorizontal, Car as CarIcon, Image, IndianRupee, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AdminLayout from "@/components/AdminLayout";
import { BulkCarInsertionUI } from "@/components/BulkCarInsertionUI";
import { SQLDumpParser } from "@/components/SQLDumpParser";
import { CSVFileUploader } from "@/components/CSVFileUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Car {
  id: string;
  brand: string;
  model: string;
  variant: string;
  price_min?: number;
  price_max?: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  images?: string[];
  status: string;
  views?: number;
  leads?: number;
  created_at: string;
  updated_at: string;
}

const CarManagement = () => {
  const { toast } = useToast();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [allBrands, setAllBrands] = useState<string[]>([]);

  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const limit = 20;

  // Add New Car Dialog States
  const [isAddCarOpen, setIsAddCarOpen] = useState(false);
  const [newCar, setNewCar] = useState({
    brand: "",
    model: "",
    variant: "",
    price: "",
    fuelType: "Petrol",
    transmission: "Manual",
    mileage: "",
    seating: "5",
    description: "",
    status: "draft"
  });

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch all unique brands from API
  const fetchAllBrands = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/admin/cars?limit=1000&sort_by=brand`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }

      const result = await response.json();

      if (result.success) {
        const brands = result.data
          .map((car: Car) => car.brand)
          .filter(Boolean); // Remove empty/null brands
        const uniqueBrands = Array.from(new Set(brands)).sort(); // Remove duplicates and sort
        setAllBrands(uniqueBrands);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  // Fetch cars from API
  const fetchCars = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: "updated_at",
        sort_order: "desc",
      });

      if (searchQuery) params.append("search", searchQuery);
      if (brandFilter !== "all") params.append("brand", brandFilter);

      const response = await fetch(
        `http://localhost:3001/api/admin/cars?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cars");
      }

      const result = await response.json();

      if (result.success) {
        setCars(result.data);
        setTotalPages(result.pagination.totalPages);
        setTotalCars(result.pagination.total);
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast({
        title: "Error",
        description: "Failed to load cars from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all brands on component mount
  useEffect(() => {
    fetchAllBrands();
  }, []);

  // Fetch cars when page, search, or filters change
  useEffect(() => {
    fetchCars();
  }, [page, searchQuery, brandFilter]);

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lakh`;
    }
    return `₹${price.toLocaleString()}`;
  };

  // Create slug from brand, model, variant
  const createSlug = (brand: string, model: string, variant?: string) => {
    const parts = [brand, model];
    if (variant && variant !== model) {
      parts.push(variant);
    }

    return parts
      .join('-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'review':
        return <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Handle add new car
  const handleAddCar = async () => {
    if (!newCar.brand || !newCar.model || !newCar.variant || !newCar.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Brand, Model, Variant, Price)",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Adding new car:", newCar);

      // Add car using API
      const carData = {
        brand: newCar.brand,
        model: newCar.model,
        variant: newCar.variant,
        price_min: parseInt(newCar.price),
        price_max: parseInt(newCar.price),
        status: newCar.status,
        fuel_type: newCar.fuelType,
        transmission: newCar.transmission,
        body_type: "Sedan", // Default value
        mileage: newCar.mileage,
        seating_capacity: newCar.seating,
        description: newCar.description,
      };

      const response = await fetch("http://localhost:3001/api/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(carData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: `${result.data.brand} ${result.data.model} has been created successfully.`,
        });

        // Refresh car list
        fetchCars();
      } else {
        throw new Error(result.error || "Failed to add car");
      }
      
      // Reset form
      setNewCar({
        brand: "",
        model: "",
        variant: "",
        price: "",
        fuelType: "Petrol",
        transmission: "Manual",
        mileage: "",
        seating: "5",
        description: "",
        status: "draft"
      });
      
      setIsAddCarOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create car listing",
        variant: "destructive",
      });
    }
  };

  // Handle delete click
  const handleDeleteClick = (car: any) => {
    setCarToDelete(car);
    setDeleteDialogOpen(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!carToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(
        `http://localhost:3001/api/admin/cars/${carToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: "Car deleted successfully",
        });
        setDeleteDialogOpen(false);
        setCarToDelete(null);
        // Refresh car list
        fetchCars();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete car",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      toast({
        title: "Error",
        description: "Failed to delete car",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Car Management</h1>
          <p className="text-muted-foreground">Manage your car inventory and listings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                   <CarIcon className="w-5 h-5 text-blue-600" />
                 </div>
                <div>
                  <p className="text-2xl font-bold">{cars.length}</p>
                  <p className="text-sm text-muted-foreground">Total Cars</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{cars.filter(c => c.status === 'published').length}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{cars.filter(c => c.status === 'draft').length}</p>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <IndianRupee className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹18.2L</p>
                  <p className="text-sm text-muted-foreground">Avg Price</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bulk Import Tabs */}
        <Tabs defaultValue="csv" className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="csv">Excel / CSV Upload</TabsTrigger>
            <TabsTrigger value="sql">SQL Dump</TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="csv">
            <CSVFileUploader />
          </TabsContent>
          <TabsContent value="sql">
            <SQLDumpParser />
          </TabsContent>
          <TabsContent value="json">
            <BulkCarInsertionUI />
          </TabsContent>
        </Tabs>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Select value={brandFilter} onValueChange={(value) => {
                setBrandFilter(value);
                setPage(1);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {allBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search cars..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <Dialog open={isAddCarOpen} onOpenChange={setIsAddCarOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    Add New Car
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Car</DialogTitle>
                    <DialogDescription>
                      Add a new car to your inventory. Fill in the required details below.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand *</Label>
                        <Input
                          id="brand"
                          value={newCar.brand}
                          onChange={(e) => setNewCar(prev => ({ ...prev, brand: e.target.value }))}
                          placeholder="e.g., Maruti Suzuki"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="model">Model *</Label>
                        <Input
                          id="model"
                          value={newCar.model}
                          onChange={(e) => setNewCar(prev => ({ ...prev, model: e.target.value }))}
                          placeholder="e.g., Swift"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="variant">Variant *</Label>
                        <Input
                          id="variant"
                          value={newCar.variant}
                          onChange={(e) => setNewCar(prev => ({ ...prev, variant: e.target.value }))}
                          placeholder="e.g., ZXI+ AMT"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price *</Label>
                        <Input
                          id="price"
                          value={newCar.price}
                          onChange={(e) => setNewCar(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="e.g., 849000"
                          type="number"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fuelType">Fuel Type</Label>
                        <Select value={newCar.fuelType} onValueChange={(value) => setNewCar(prev => ({ ...prev, fuelType: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border z-50">
                            <SelectItem value="Petrol">Petrol</SelectItem>
                            <SelectItem value="Diesel">Diesel</SelectItem>
                            <SelectItem value="CNG">CNG</SelectItem>
                            <SelectItem value="Electric">Electric</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transmission">Transmission</Label>
                        <Select value={newCar.transmission} onValueChange={(value) => setNewCar(prev => ({ ...prev, transmission: value }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background border border-border z-50">
                            <SelectItem value="Manual">Manual</SelectItem>
                            <SelectItem value="Automatic">Automatic</SelectItem>
                            <SelectItem value="AMT">AMT</SelectItem>
                            <SelectItem value="CVT">CVT</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seating">Seating</Label>
                        <Input
                          id="seating"
                          value={newCar.seating}
                          onChange={(e) => setNewCar(prev => ({ ...prev, seating: e.target.value }))}
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mileage">Mileage</Label>
                      <Input
                        id="mileage"
                        value={newCar.mileage}
                        onChange={(e) => setNewCar(prev => ({ ...prev, mileage: e.target.value }))}
                        placeholder="e.g., 23.2 km/l"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newCar.description}
                        onChange={(e) => setNewCar(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the car..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={newCar.status} onValueChange={(value) => setNewCar(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-50">
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="review">Under Review</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsAddCarOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleAddCar} className="flex-1 bg-gradient-primary hover:opacity-90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Car
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Cars Table */}
        <Card>
          <CardHeader>
            <CardTitle>Car Listings ({totalCars})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Car Details</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-muted-foreground">Loading cars...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : cars.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <CarIcon className="w-12 h-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No cars found</p>
                        <p className="text-sm text-muted-foreground">Try adjusting your filters or add a new car</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  cars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-8 bg-muted rounded flex items-center justify-center">
                           <CarIcon className="w-4 h-4" />
                         </div>
                        <div>
                          <p className="font-medium">{car.brand} {car.model}</p>
                          <p className="text-sm text-muted-foreground">{car.variant}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{car.price_min ? formatPrice(car.price_min) : 'N/A'}</p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(car.status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-3 h-3" />
                          <span>{car.views?.toLocaleString() || 0} views</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <IndianRupee className="w-3 h-3" />
                          <span>{car.leads || 0} leads</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Image className="w-3 h-3" />
                          <span>{car.images?.length || 0} photos</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{new Date(car.updated_at).toLocaleDateString()}</p>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/cars/${createSlug(car.brand, car.model, car.variant)}`} className="flex items-center cursor-pointer">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/cars/edit/${car.id}`} className="flex items-center cursor-pointer">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Car
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/cars/edit/${car.id}`} className="flex items-center cursor-pointer">
                              <Image className="w-4 h-4 mr-2" />
                              Manage Photos
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 cursor-pointer"
                            onClick={() => handleDeleteClick(car)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Car
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {!loading && cars.length > 0 && (
              <div className="flex items-center justify-between border-t px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1} to{" "}
                  {Math.min(page * limit, totalCars)} of {totalCars} cars
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the car "{carToDelete?.brand}{" "}
              {carToDelete?.model} {carToDelete?.variant}" from your inventory.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default CarManagement;