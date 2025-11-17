import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Car,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

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
  created_at: string;
  updated_at: string;
}

const ManageCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [fuelFilter, setFuelFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCars, setTotalCars] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);
  const [deleting, setDeleting] = useState(false);

  const limit = 20;

  // Fetch cars
  const fetchCars = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: "updated_at",
        sort_order: "desc",
      });

      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (brandFilter !== "all") params.append("brand", brandFilter);
      if (fuelFilter !== "all") params.append("fuel_type", fuelFilter);

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
      toast.error("Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, [page, search, statusFilter, brandFilter, fuelFilter]);

  // Handle delete
  const handleDeleteClick = (car: Car) => {
    setCarToDelete(car);
    setDeleteDialogOpen(true);
  };

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
        toast.success("Car deleted successfully");
        fetchCars();
        setDeleteDialogOpen(false);
        setCarToDelete(null);
      } else {
        toast.error(result.error || "Failed to delete car");
      }
    } catch (error) {
      console.error("Error deleting car:", error);
      toast.error("Failed to delete car");
    } finally {
      setDeleting(false);
    }
  };

  // Format price
  const formatPrice = (min?: number, max?: number) => {
    if (!min && !max) return "N/A";
    if (min && max && min !== max) {
      return `₹${(min / 100000).toFixed(2)}L - ₹${(max / 100000).toFixed(2)}L`;
    }
    if (min) return `₹${(min / 100000).toFixed(2)}L`;
    if (max) return `₹${(max / 100000).toFixed(2)}L`;
    return "N/A";
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Manage Cars</h1>
          <p className="text-muted-foreground mt-1">
            Total {totalCars} cars in inventory
          </p>
        </div>
        <Link to="/admin/cars/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Car
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search brand, model, variant..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            {/* Brand Filter */}
            <Select
              value={brandFilter}
              onValueChange={(value) => {
                setBrandFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                <SelectItem value="Maruti Suzuki">Maruti Suzuki</SelectItem>
                <SelectItem value="Hyundai">Hyundai</SelectItem>
                <SelectItem value="Tata">Tata</SelectItem>
                <SelectItem value="Mahindra">Mahindra</SelectItem>
                <SelectItem value="Honda">Honda</SelectItem>
                <SelectItem value="Toyota">Toyota</SelectItem>
                <SelectItem value="Kia">Kia</SelectItem>
              </SelectContent>
            </Select>

            {/* Fuel Type Filter */}
            <Select
              value={fuelFilter}
              onValueChange={(value) => {
                setFuelFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fuel Types</SelectItem>
                <SelectItem value="Petrol">Petrol</SelectItem>
                <SelectItem value="Diesel">Diesel</SelectItem>
                <SelectItem value="Electric">Electric</SelectItem>
                <SelectItem value="CNG">CNG</SelectItem>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cars Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : cars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No cars found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or add a new car
              </p>
              <Link to="/admin/cars/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Car
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Brand & Model</TableHead>
                  <TableHead>Variant</TableHead>
                  <TableHead>Price Range</TableHead>
                  <TableHead>Fuel/Trans</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cars.map((car) => (
                  <TableRow key={car.id}>
                    <TableCell>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                        {(() => {
                          // Handle both old array format and new angle-mapped object format
                          if (car.images) {
                            // If images is an object with angle keys (new format)
                            if (typeof car.images === 'object' && !Array.isArray(car.images)) {
                              // Try to get the front_3_4 angle first, then any available angle
                              const imageUrl = (car.images as any).front_3_4 ||
                                             (car.images as any).front_view ||
                                             (car.images as any).left_side ||
                                             (car.images as any).right_side ||
                                             (car.images as any).rear_view ||
                                             (car.images as any).interior_dash ||
                                             (car.images as any).interior_cabin ||
                                             (car.images as any).interior_steering ||
                                             "/placeholder.svg";
                              
                              return (
                                <img
                                  src={imageUrl}
                                  alt={`${car.brand} ${car.model}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg";
                                  }}
                                />
                              );
                            }
                            // If images is an array (old format)
                            else if (Array.isArray(car.images) && car.images.length > 0) {
                              return (
                                <img
                                  src={car.images[0]}
                                  alt={`${car.brand} ${car.model}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg";
                                  }}
                                />
                              );
                            }
                          }
                          
                          // Fallback to placeholder
                          return (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="w-8 h-8 text-gray-400" />
                            </div>
                          );
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{car.brand}</div>
                        <div className="text-sm text-muted-foreground">
                          {car.model}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{car.variant || "N/A"}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {formatPrice(car.price_min, car.price_max)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{car.fuel_type}</div>
                        <div className="text-muted-foreground">
                          {car.transmission}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          car.status === "active"
                            ? "default"
                            : car.status === "inactive"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {car.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/cars/${car.id}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link to={`/admin/cars/edit/${car.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(car)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

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
    </div>
  );
};

export default ManageCars;
