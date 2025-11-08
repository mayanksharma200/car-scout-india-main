import {
  Search,
  Car,
  Phone,
  MapPin,
  Heart,
  Menu,
  X,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useRef, useCallback } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUserAuth } from "@/contexts/UserAuthContext";
import ProfileModal from "@/components/ProfileModal";
import AutoPulsesLogo from "@/assets/360carlistbg.png";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");

  // Use the actual auth context instead of mock data
  const { user, loading, logout } = useUserAuth();

  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Debug: Log user data
  useEffect(() => {
    console.log("Header - User data:", user);
    console.log("Header - Loading state:", loading);
  }, [user, loading]);
  // Popular search suggestions
  const popularSearches = [
    "BMW",
    "Mercedes",
    "Audi",
    "Honda City",
    "Hyundai Creta",
    "Maruti Swift",
    "Toyota Innova",
    "Tata Nexon",
    "Mahindra XUV700",
    "Hyundai Venue",
  ];

  // Generate car slug from car object
  const getCarSlugFromCar = (car) => {
    const brand = car.brand || "unknown";
    const model = car.model || "unknown";
    const variant = car.variant || "";

    const slug = `${brand}-${model}${variant ? "-" + variant : ""}`
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    return slug;
  };

  // Navigate to car detail page
  const navigateToCarDetail = (car) => {
    const slug = getCarSlugFromCar(car);
    console.log(
      `🚗 Navigating to car: ${car.brand} ${car.model} ${car.variant} (slug: ${slug})`
    );
    window.location.href = `/cars/${slug}`;
  };

  // Perform the actual API search (simplified, no aggressive race condition handling)
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    try {
      console.log("🔍 Background searching for:", query);

      const searchParams = new URLSearchParams();
      searchParams.append("q", query.trim());
      searchParams.append("limit", "10");

      const apiUrl = `/api/cars/search?${searchParams.toString()}`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success) {
        setSearchResults(result.data || []);
        setShowSuggestions(true);
        setSearchError("");
        console.log(`✅ Found ${result.data.length} cars for "${query}"`);
      } else {
        console.error("❌ Search failed:", result.error);
        setSearchError(result.error || "Search failed");
        setSearchResults([]);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error("💥 Search error:", error);
      setSearchError(error.message);
      setSearchResults([]);
      setShowSuggestions(true);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback((query) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setIsSearching(true);
      setSearchError("");
      performSearch(query);
    }, 300);
  }, []);

  // Handle search input change (never blocks typing)
  const handleSearchChange = (value) => {
    // Always update the input immediately - never block typing
    setSearchQuery(value);

    if (value.trim().length === 0) {
      // Clear results immediately when input is empty
      setSearchResults([]);
      setShowSuggestions(false);
      setIsSearching(false);
      setSearchError("");
      // Cancel any pending search
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      return;
    }

    // ALWAYS show dropdown when there's any input
    setShowSuggestions(true);

    // Start background search (doesn't block typing)
    if (value.trim().length >= 2) {
      debouncedSearch(value);
    } else {
      // For 1 character, clear previous API results but show popular searches
      setSearchResults([]);
      setSearchError("");
      setIsSearching(false);
    }
  };

  // Handle mobile search input change (never blocks typing)
  const handleMobileSearchChange = (value) => {
    // Always update immediately
    setMobileSearchQuery(value);

    if (value.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError("");
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      return;
    }

    // Background search for mobile
    if (value.trim().length >= 2) {
      debouncedSearch(value);
    } else {
      // For 1 character, clear previous API results
      setSearchResults([]);
      setSearchError("");
      setIsSearching(false);
    }
  };

  // Filter popular suggestions based on query
  const getFilteredSuggestions = (query) => {
    if (!query.trim()) {
      return popularSearches.slice(0, 5);
    }

    const searchTerm = query.toLowerCase();
    return popularSearches
      .filter((suggestion) => suggestion.toLowerCase().includes(searchTerm))
      .slice(0, 5);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await logout();
      window.location.href = "/"; // Redirect to home after logout
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Handle car selection from dropdown
  const handleCarSelection = (car) => {
    setShowSuggestions(false);
    setSearchQuery("");
    navigateToCarDetail(car);
  };

  // Handle popular search selection
  const handlePopularSearchClick = (searchTerm) => {
    setSearchQuery(searchTerm);
    debouncedSearch(searchTerm);
  };

  // Handle form submission (Enter key)
  const handleSearchSubmit = () => {
    if (searchResults.length > 0) {
      handleCarSelection(searchResults[0]);
    } else if (searchQuery.trim()) {
      window.location.href = `/cars?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-0">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img
              src={`${AutoPulsesLogo}?v=${Date.now()}`}
              alt="AutoPulses"
              className="w-20 h-20 md:w-20 md:h-20 object-contain hover:scale-105 transition-transform"
            />
          </a>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Type to search cars..."
                className="pl-10 bg-background border-border focus:border-primary"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => {
                  // Always show suggestions when focusing if there's any input
                  if (searchQuery.trim().length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
                autoComplete="off"
              />

              {/* Subtle loading indicator - doesn't block input */}
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg shadow-lg mt-1 z-50 max-h-80 overflow-y-auto">
                  {/* Lookup Results */}
                  {searchResults.length > 0 && (
                    <div>
                      <div className="px-3 py-2 bg-muted/50 border-b border-border">
                        <p className="text-xs font-medium text-muted-foreground">
                          Found {searchResults.length} cars
                        </p>
                      </div>
                      {searchResults.map((car, index) => (
                        <div
                          key={car.id || index}
                          className="px-4 py-3 hover:bg-muted cursor-pointer transition-colors border-b border-border/50 last:border-b-0 flex items-center"
                          onClick={() => handleCarSelection(car)}
                        >
                          <div className="text-lg mr-3">🚗</div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              <span className="text-primary font-semibold">
                                {car.brand}
                              </span>{" "}
                              {car.model} {car.variant}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {car.fuelType || car.fuel_type} •{" "}
                              {car.transmission} • ₹
                              {((car.price || car.price_min) / 100000).toFixed(
                                1
                              )}
                              L
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Popular Searches / No Results */}
                  {searchResults.length === 0 && !searchError && (
                    <div>
                      <div className="px-3 py-2 bg-muted/50 border-b border-border">
                        <p className="text-xs font-medium text-muted-foreground">
                          {searchQuery.trim()
                            ? "Popular searches"
                            : "Popular searches"}
                        </p>
                      </div>
                      {getFilteredSuggestions(searchQuery).length > 0 ? (
                        getFilteredSuggestions(searchQuery).map(
                          (suggestion, index) => (
                            <div
                              key={index}
                              className="px-4 py-3 hover:bg-muted cursor-pointer transition-colors border-b border-border/50 last:border-b-0 flex items-center"
                              onClick={() =>
                                handlePopularSearchClick(suggestion)
                              }
                            >
                              <Search className="w-4 h-4 mr-3 text-muted-foreground" />
                              <span className="text-sm">{suggestion}</span>
                            </div>
                          )
                        )
                      ) : searchQuery.trim() ? (
                        <div className="px-4 py-3 text-center text-muted-foreground">
                          <p className="text-sm">
                            No cars found for "{searchQuery}"
                          </p>
                          <p className="text-xs mt-1">
                            Try a different search term
                          </p>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <a
              href="/cars"
              className="text-sm text-foreground hover:text-primary transition-colors"
            >
              New Cars
            </a>
            <a
              href="/compare"
              className="text-sm text-foreground hover:text-primary transition-colors"
            >
              Compare
            </a>
            <a
              href="/emi-calculator"
              className="text-sm text-foreground hover:text-primary transition-colors"
            >
              EMI
            </a>
            <a
              href="/news"
              className="text-sm text-foreground hover:text-primary transition-colors"
            >
              News
            </a>
          </nav>

          {/* Mobile & Desktop Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="w-4 h-4" />
            </Button>

            {/* Wishlist */}
            <a href="/wishlist" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="px-2">
                <Heart className="w-4 h-4" />
                <span className="hidden md:ml-2 md:inline">Wishlist</span>
              </Button>
            </a>

            {/* Authentication */}
            {loading ? (
              <Button
                size="sm"
                disabled
                className="bg-gray-400 text-white text-xs md:text-sm px-4 py-2"
              >
                Loading...
              </Button>
            ) : user ? (
              // Show ProfileModal when user is logged in
              <ProfileModal />
            ) : (
              // Show Login button when user is not logged in
              <a href="/login">
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs md:text-sm px-4 py-2 rounded-lg shadow-sm"
                >
                  Login
                </Button>
              </a>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-6">
                  <a
                    href="/cars"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  >
                    New Cars
                  </a>
                  <a
                    href="/compare"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  >
                    Compare Cars
                  </a>
                  <a
                    href="/emi-calculator"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  >
                    EMI Calculator
                  </a>
                  <a
                    href="/news"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2"
                  >
                    News & Reviews
                  </a>
                  <a
                    href="/wishlist"
                    className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 sm:hidden"
                  >
                    Wishlist
                  </a>

                  {/* Mobile Auth */}
                  {user ? (
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.firstName ||
                              user.email?.split("@")[0] ||
                              "User"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleSignOut}
                        className="w-full justify-start"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t">
                      <a href="/login" className="w-full">
                        <Button className="w-full">Login</Button>
                      </a>
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div
          className="lg:hidden border-t border-border/50 p-4"
          ref={mobileSearchRef}
        >
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Type to search cars..."
                className="pl-10 bg-background border-border focus:border-primary"
                value={mobileSearchQuery}
                onChange={(e) => handleMobileSearchChange(e.target.value)}
                autoFocus
                autoComplete="off"
              />

              {/* Subtle mobile loading indicator */}
              {isSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <Button
              onClick={() => setIsSearchOpen(false)}
              size="sm"
              variant="outline"
              className="px-4"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Search Results - Show when user is typing */}
          {mobileSearchQuery.trim().length > 0 && (
            <div className="mt-3 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {searchResults.length > 0 ? (
                /* Show actual search results */
                searchResults.map((car, index) => (
                  <div
                    key={car.id || index}
                    className="px-4 py-3 hover:bg-muted cursor-pointer transition-colors border-b border-border/50 last:border-b-0 flex items-center"
                    onClick={() => {
                      setIsSearchOpen(false);
                      handleCarSelection(car);
                    }}
                  >
                    <div className="text-lg mr-3">🚗</div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        <span className="text-primary font-semibold">
                          {car.brand}
                        </span>{" "}
                        {car.model} {car.variant}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {car.fuelType || car.fuel_type} • {car.transmission} • ₹
                        {((car.price || car.price_min) / 100000).toFixed(1)}L
                      </div>
                    </div>
                  </div>
                ))
              ) : mobileSearchQuery.trim().length >= 2 ? (
                /* 2+ characters: show search state */
                <div className="px-4 py-3 text-center text-muted-foreground">
                  {isSearching ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-sm">
                        Searching for "{mobileSearchQuery}"...
                      </p>
                    </div>
                  ) : searchError ? (
                    <p className="text-sm text-red-600">❌ {searchError}</p>
                  ) : (
                    <p className="text-sm">
                      No cars found for "{mobileSearchQuery}"
                    </p>
                  )}
                </div>
              ) : (
                /* 1 character: show filtered popular searches */
                <>
                  <div className="px-3 py-2 bg-muted/50 border-b border-border">
                    <p className="text-xs font-medium text-muted-foreground">
                      Popular searches
                    </p>
                  </div>
                  {getFilteredSuggestions(mobileSearchQuery)
                    .slice(0, 3)
                    .map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-3 hover:bg-muted cursor-pointer transition-colors border-b border-border/50 last:border-b-0 flex items-center"
                        onClick={() => {
                          setMobileSearchQuery(suggestion);
                          debouncedSearch(suggestion);
                        }}
                      >
                        <Search className="w-4 h-4 mr-3 text-muted-foreground" />
                        <span className="text-sm">{suggestion}</span>
                      </div>
                    ))}
                </>
              )}
            </div>
          )}

          {/* Mobile Popular Searches */}
          {!mobileSearchQuery.trim() && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">
                Popular searches:
              </p>
              <div className="flex flex-wrap gap-1">
                {popularSearches.slice(0, 4).map((search, index) => (
                  <button
                    key={index}
                    className="px-2 py-1 text-xs bg-muted rounded-md hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => {
                      setMobileSearchQuery(search);
                      debouncedSearch(search);
                    }}
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
