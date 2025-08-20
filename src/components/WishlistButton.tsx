// src/components/WishlistButton.tsx
// Reusable wishlist button component for car cards

import React from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/useWishlist";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  carId: string;
  variant?: "default" | "icon" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  initialStatus?: {
    inWishlist: boolean;
    addedAt: string | null;
  } | null;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  carId,
  variant = "icon",
  size = "md",
  className,
  showText = false,
  initialStatus = null,
}) => {
  const { isAuthenticated } = useUserAuth();
  const { isInWishlist, toggleWishlist, actionLoading } = useWishlist();
  const navigate = useNavigate();

  // Use initialStatus if provided, otherwise fall back to useWishlist hook
  const inWishlist = initialStatus
    ? initialStatus.inWishlist
    : isInWishlist(carId);
  const loading =
    actionLoading === `add-${carId}` || actionLoading === `remove-${carId}`;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: { pathname: window.location.pathname } },
      });
      return;
    }

    await toggleWishlist(carId);
  };

  const getButtonProps = () => {
    const baseProps = {
      onClick: handleClick,
      disabled: loading,
      className: cn(className),
    };

    switch (variant) {
      case "icon":
        return {
          ...baseProps,
          variant: "ghost" as const,
          size: "sm" as const,
          className: cn(
            "w-8 h-8 rounded-full p-0 bg-white/80 backdrop-blur-sm border shadow-sm hover:shadow-md transition-all",
            inWishlist
              ? "bg-red-50 border-red-200 hover:bg-red-100"
              : "hover:bg-white",
            className
          ),
        };
      case "ghost":
        return {
          ...baseProps,
          variant: "ghost" as const,
          size: size as any,
          className: cn(
            "transition-colors",
            inWishlist
              ? "text-red-500 hover:text-red-600"
              : "hover:text-red-500",
            className
          ),
        };
      default:
        return {
          ...baseProps,
          variant: inWishlist ? ("secondary" as const) : ("outline" as const),
          size: size as any,
          className: cn(
            "transition-all",
            inWishlist
              ? "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              : "hover:bg-red-50 hover:border-red-200 hover:text-red-700",
            className
          ),
        };
    }
  };

  const getIconProps = () => ({
    className: cn(
      "transition-all",
      variant === "icon" ? "w-4 h-4" : "w-4 h-4",
      inWishlist ? "text-red-500 fill-red-500" : "text-gray-600"
    ),
  });

  const buttonProps = getButtonProps();

  return (
    <Button {...buttonProps}>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart {...getIconProps()} />
      )}
      {showText && (
        <span className="ml-2">
          {loading
            ? inWishlist
              ? "Removing..."
              : "Adding..."
            : inWishlist
            ? "Saved"
            : "Save"}
        </span>
      )}
    </Button>
  );
};

export default WishlistButton;
