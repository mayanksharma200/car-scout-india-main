import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Eye, Search, Filter, MoreHorizontal, Car as CarIcon, Image, IndianRupee, ChevronLeft, ChevronRight, X, Wand2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
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

  // Sorting States
  const [sortBy, setSortBy] = useState("updated_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  // Stats States
  const [stats, setStats] = useState({
    totalCars: 0,
    totalBrands: 0,
    carsWithImages: 0,
    averagePrice: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Delete Dialog States
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Bulk Action States
  const [selectedCars, setSelectedCars] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const response = await fetch(
        `/api/admin/cars?limit=10000&sort_by=brand`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const result = await response.json();

      if (result.success) {
        const allCars = result.data;

        // Calculate total cars
        const totalCars = allCars.length;

        // Calculate unique brands
        const brands = allCars
          .map((car: Car) => car.brand)
          .filter(Boolean);
        const uniqueBrands = Array.from(new Set(brands));
        const totalBrands = uniqueBrands.length;

        // Calculate cars with images
        const carsWithImages = allCars.filter((car: any) =>
          car.images &&
          ((Array.isArray(car.images) && car.images.length > 0) ||
            (typeof car.images === 'object' && Object.keys(car.images).length > 0))
        ).length;

        // Calculate average price
        const carsWithValidPrices = allCars.filter((car: any) => {
          const price = car.exact_price || car.ex_showroom_price || car.price_min;
          return price !== null &&
            price !== undefined &&
            !isNaN(Number(price)) &&
            price !== "N/A" &&
            Number(price) > 0;
        });

        const averagePrice = carsWithValidPrices.length > 0
          ? Math.round(carsWithValidPrices.reduce((sum: number, car: any) => {
            const price = Number(car.exact_price) || Number(car.ex_showroom_price) || Number(car.price_min);
            return sum + price;
          }, 0) / carsWithValidPrices.length)
          : 0;

        setStats({
          totalCars,
          totalBrands,
          carsWithImages,
          averagePrice,
        });

        // Also set brands for the filter
        setAllBrands(uniqueBrands.sort() as string[]);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch all unique brands from API
  const fetchAllBrands = async () => {
    try {
      const response = await fetch(
        `/api/admin/cars?limit=1000&sort_by=brand`
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
        setAllBrands(uniqueBrands as string[]);
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
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (searchQuery) params.append("search", searchQuery);
      if (brandFilter !== "all") params.append("brand", brandFilter);

      const response = await fetch(
        `/api/admin/cars?${params.toString()}`
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

  // Fetch stats and brands on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch cars when page, search, or filters change
  useEffect(() => {
    fetchCars();
  }, [page, searchQuery, brandFilter, sortBy, sortOrder]);

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
        `/api/admin/cars/${carToDelete.id}`,
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

  // Handle status toggle
  const handleStatusToggle = async (carId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

      // Optimistic update
      setCars(cars.map(car =>
        car.id === carId ? { ...car, status: newStatus } : car
      ));

      const response = await fetch(`/api/admin/cars/${carId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast({
        title: "Success",
        description: `Car marked as ${newStatus}`,
      });

      // Refresh stats to keep counts accurate
      fetchStats();
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert optimistic update
      setCars(cars.map(car =>
        car.id === carId ? { ...car, status: currentStatus } : car
      ));
      toast({
        title: "Error",
        description: "Failed to update car status",
        variant: "destructive",
      });
    }
  };

  // Handle Select All
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedCars);
      cars.forEach(car => newSelected.add(car.id));
      setSelectedCars(newSelected);
    } else {
      const newSelected = new Set(selectedCars);
      cars.forEach(car => newSelected.delete(car.id));
      setSelectedCars(newSelected);
    }
  };

  // Handle Select Single Car
  const handleSelectCar = (carId: string, checked: boolean) => {
    const newSelected = new Set(selectedCars);
    if (checked) {
      newSelected.add(carId);
    } else {
      newSelected.delete(carId);
    }
    setSelectedCars(newSelected);
  };

  // Handle Bulk Action
  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedCars.size === 0) return;

    try {
      setBulkActionLoading(true);
      const response = await fetch('/api/admin/cars/bulk-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          carIds: Array.from(selectedCars),
          action
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setSelectedCars(new Set());
        fetchCars();
        fetchStats();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error performing bulk action:", error);
      toast({
        title: "Error",
        description: "Failed to perform bulk action",
        variant: "destructive",
      });
    } finally {
      setBulkActionLoading(false);
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
                  <p className="text-2xl font-bold">{loadingStats ? "..." : stats.totalCars}</p>
                  <p className="text-sm text-muted-foreground">Total Cars</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loadingStats ? "..." : stats.totalBrands}</p>
                  <p className="text-sm text-muted-foreground">Total Brands</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Image className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{loadingStats ? "..." : stats.carsWithImages}</p>
                  <p className="text-sm text-muted-foreground">Cars with Images</p>
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
                  <p className="text-2xl font-bold">{loadingStats ? "..." : formatPrice(stats.averagePrice)}</p>
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
            {/* <TabsTrigger value="sql">SQL Dump</TabsTrigger> */}
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
              <Link to="/admin/cars/new">
                <Button className="gap-2 whitespace-nowrap">
                  <Plus className="w-4 h-4" />
                  Add New Car
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedCars.size > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg mb-6 flex items-center justify-between border animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{selectedCars.size} cars selected</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCars(new Set())}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear selection
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('activate')}
                disabled={bulkActionLoading}
                className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              >
                Mark as Active
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('deactivate')}
                disabled={bulkActionLoading}
                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200"
              >
                Mark as Inactive
              </Button>
              {/* <Button
                variant="destructive"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                disabled={bulkActionLoading}
              >
                Delete Selected
              </Button> */}
            </div>
          </div>
        )}

        {/* Cars Table */}
        <Card>
          <CardHeader>
            <CardTitle>Car Listings ({totalCars})</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={cars.length > 0 && cars.every(car => selectedCars.has(car.id))}
                      onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                    />
                  </TableHead>
                  <TableHead>Car Details</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('image_count')}
                  >
                    <div className="flex items-center gap-1">
                      Photos
                      {sortBy === 'image_count' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSort('updated_at')}
                  >
                    <div className="flex items-center gap-1">
                      Last Updated
                      {sortBy === 'updated_at' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </div>
                  </TableHead>
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
                    <TableRow key={car.id} className={selectedCars.has(car.id) ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedCars.has(car.id)}
                          onCheckedChange={(checked) => handleSelectCar(car.id, checked as boolean)}
                        />
                      </TableCell>
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
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={car.status === 'active'}
                            onCheckedChange={() => handleStatusToggle(car.id, car.status)}
                          />
                          <span className={`text-sm ${car.status === 'active' ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                            {car.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Image className="w-3 h-3" />
                          <span>{(() => {
                            // Calculate total image count checking color_variant_images first
                            let imageCount = 0;

                            // Check color_variant_images first (new multi-color format)
                            const colorVariantImages = (car as any).color_variant_images;
                            if (colorVariantImages && typeof colorVariantImages === 'object') {
                              Object.values(colorVariantImages).forEach((colorData: any) => {
                                if (colorData && colorData.images && typeof colorData.images === 'object') {
                                  imageCount += Object.keys(colorData.images).length;
                                }
                              });
                            }
                            // Fallback to images field
                            else if (Array.isArray(car.images)) {
                              imageCount = car.images.length;
                            }
                            else if (car.images && typeof car.images === 'object') {
                              imageCount = Object.keys(car.images).length;
                            }

                            return imageCount;
                          })()} photos</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">
                          {new Date(car.updated_at).toLocaleString('en-IN', {
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
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
                            {/* <DropdownMenuItem
                              className="text-red-600 cursor-pointer"
                              onClick={() => handleDeleteClick(car)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Car
                            </DropdownMenuItem> */}
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