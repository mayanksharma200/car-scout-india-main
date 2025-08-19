import { useState } from "react";
import {
  Heart,
  Star,
  Share2,
  Fuel,
  Users,
  Gauge,
  Zap,
  Eye,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ShareModal from "./ShareModal";
import { getCarSlugFromCar } from "@/utils/carSlugUtils";

interface Car {
  id: string;
  brand: string;
  model: string;
  variant: string;
  price: number;
  onRoadPrice?: number;
  image: string;
  rating: number;
  fuelType: string;
  transmission: string;
  mileage: number;
  seating: number;
  bodyType: string;
  color: string;
  year: number;
  features: string[];
  isPopular?: boolean;
  isBestSeller?: boolean;
}

interface CarCardProps {
  car: Car;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  wishlistLoading?: boolean;
}

const CarCard = ({
  car,
  isWishlisted = false,
  onToggleWishlist,
  wishlistLoading = false,
}: CarCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    const slug = getCarSlugFromCar(car);
    navigate(`/cars/${slug}`);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleWishlist) {
      onToggleWishlist();
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(2)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };

  return (
    <>
      <Card
        className="group relative overflow-hidden bg-card hover:shadow-xl transition-all duration-500 hover:-translate-y-2 cursor-pointer border-0 shadow-lg animate-fade-in hover:shadow-primary/10"
        onClick={handleCardClick}
      >
        {/* Gradient border effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute inset-[1px] bg-card rounded-lg" />

        {/* Badges */}
        <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
          {car.isPopular && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 shadow-lg">
              <Zap className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
          {car.isBestSeller && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
              <Star className="w-3 h-3 mr-1 fill-white" />
              Best Seller
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
            onClick={handleWishlistClick}
            disabled={wishlistLoading}
          >
            {wishlistLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            ) : (
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground"
                } transition-colors`}
              />
            )}
          </Button>
          <ShareModal
            title={`${car.brand} ${car.model} ${car.variant}`}
            description={`Check out this ${car.brand} ${
              car.model
            } starting from ${formatPrice(car.price)}`}
            url={`/cars/${getCarSlugFromCar(car)}`}
            image={car.image}
          >
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </ShareModal>
        </div>

        {/* Car Image */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-muted/30 to-muted/60">
          <img
            src={car.image}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Quick specs overlay */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="flex gap-1">
              <Badge
                variant="secondary"
                className="text-xs bg-background/80 backdrop-blur-sm"
              >
                <Eye className="w-3 h-3 mr-1" />
                {car.year}
              </Badge>
            </div>
            <Badge
              variant="secondary"
              className="text-xs bg-background/80 backdrop-blur-sm"
            >
              {car.color}
            </Badge>
          </div>
        </div>

        <CardContent className="relative z-10 p-6">
          {/* Brand and Model */}
          <div className="mb-4">
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">
              {car.brand} {car.model}
            </h3>
            <p className="text-sm text-muted-foreground font-medium">
              {car.variant}
            </p>
          </div>

          {/* Rating and Reviews */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="font-medium">{car.rating.toFixed(2)}</span>
            </div>
            <span className="text-sm text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground">142 Reviews</span>
          </div>

          {/* Key Specs */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Fuel className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fuel</p>
                <p className="text-sm font-medium">{car.fuelType}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Gauge className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Mileage</p>
                <p className="text-sm font-medium">{car.mileage} km/l</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Seating</p>
                <p className="text-sm font-medium">{car.seating} Seater</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium">{car.transmission}</p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(car.price)}
              </span>
              {car.onRoadPrice && (
                <span className="text-sm text-muted-foreground">onwards</span>
              )}
            </div>
            {car.onRoadPrice && (
              <p className="text-xs text-muted-foreground">
                On-road price: {formatPrice(car.onRoadPrice)}
              </p>
            )}
          </div>

          {/* Action Button */}
          <Button
            className="w-full group/btn bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={handleCardClick}
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </Button>
        </CardContent>

        {/* Hover glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </Card>
    </>
  );
};

export default CarCard;
