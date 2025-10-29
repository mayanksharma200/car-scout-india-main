import { useState } from "react";
import { useCars } from "@/hooks/useSupabaseData";
import { Plus, Edit, Trash2, Eye, Search, Filter, MoreHorizontal, Car as CarIcon, Image, IndianRupee } from "lucide-react";
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
import AdminLayout from "@/components/AdminLayout";
import { BulkCarInsertionUI } from "@/components/BulkCarInsertionUI";
import { SQLDumpParser } from "@/components/SQLDumpParser";
import { CSVFileUploader } from "@/components/CSVFileUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CarManagement = () => {
  const { toast } = useToast();
  const { cars, addCar: addCarToDb, loading } = useCars();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  
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

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} Lakh`;
    }
    return `₹${price.toLocaleString()}`;
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

  const filteredCars = cars.filter(car => {
    const matchesSearch = car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         car.variant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || car.status === statusFilter;
    const matchesBrand = brandFilter === "all" || car.brand === brandFilter;
    
    return matchesSearch && matchesStatus && matchesBrand;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center">
          <div>Loading cars...</div>
        </div>
      </AdminLayout>
    );
  }

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
      
      // Add car using Supabase
      const carData = {
        brand: newCar.brand,
        model: newCar.model,
        variant: newCar.variant,
        price: parseInt(newCar.price),
        status: newCar.status as 'published' | 'draft' | 'review',
        images: 0,
        fuel_type: newCar.fuelType,
        transmission: newCar.transmission,
        mileage: newCar.mileage,
        seating: newCar.seating,
        description: newCar.description,
        views: 0,
        leads: 0
      };
      
      const addedCar = await addCarToDb(carData);
      
      toast({
        title: "Success",
        description: `${addedCar?.brand} ${addedCar?.model} has been created successfully and synced across all systems.`,
      });
      
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

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Car Management</h1>
            <p className="text-muted-foreground">Manage your car inventory and listings</p>
          </div>
          
          {/* Add New Car Dialog */}
          <Dialog open={isAddCarOpen} onOpenChange={setIsAddCarOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add New Car
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Car</DialogTitle>
                <DialogDescription>
                  Create a new car listing with all the details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
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
                        <SelectItem value="DCT">DCT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seating">Seating</Label>
                    <Select value={newCar.seating} onValueChange={(value) => setNewCar(prev => ({ ...prev, seating: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border border-border z-50">
                        <SelectItem value="2">2 Seater</SelectItem>
                        <SelectItem value="4">4 Seater</SelectItem>
                        <SelectItem value="5">5 Seater</SelectItem>
                        <SelectItem value="7">7 Seater</SelectItem>
                        <SelectItem value="8">8 Seater</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mileage">Mileage (km/l)</Label>
                    <Input
                      id="mileage"
                      value={newCar.mileage}
                      onChange={(e) => setNewCar(prev => ({ ...prev, mileage: e.target.value }))}
                      placeholder="e.g., 23.2"
                      type="number"
                      step="0.1"
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

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newCar.description}
                    onChange={(e) => setNewCar(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter car description and key features..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setIsAddCarOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleAddCar} className="flex-1 bg-gradient-primary hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Car
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search cars..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                </SelectContent>
              </Select>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  <SelectItem value="Maruti Suzuki">Maruti Suzuki</SelectItem>
                  <SelectItem value="Hyundai">Hyundai</SelectItem>
                  <SelectItem value="Tata">Tata</SelectItem>
                  <SelectItem value="Mahindra">Mahindra</SelectItem>
                  <SelectItem value="Honda">Honda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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

        {/* Cars Table */}
        <Card>
          <CardHeader>
            <CardTitle>Car Listings ({filteredCars.length})</CardTitle>
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
                {filteredCars.map((car) => (
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
                      <p className="font-medium">{formatPrice(car.price)}</p>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(car.status)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Eye className="w-3 h-3" />
                          <span>{car.views.toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <IndianRupee className="w-3 h-3" />
                          <span>{car.leads} leads</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Image className="w-3 h-3" />
                          <span>{car.images} photos</span>
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
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Car
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Image className="w-4 h-4 mr-2" />
                            Manage Photos
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Car
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CarManagement;