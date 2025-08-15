import { Search, Car, Phone, MapPin, Heart, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import autoscopeLogo from "@/assets/autoscope-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ProfileModal from "@/components/ProfileModal";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 shadow-sm">
      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={`${autoscopeLogo}?v=${Date.now()}`} alt="AutoScope" className="w-10 h-10 md:w-12 md:h-12 object-contain hover:scale-105 transition-transform" />
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search cars, brands..." 
                className="pl-10 bg-background border-border focus:border-primary"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link to="/cars" className="text-sm text-foreground hover:text-primary transition-colors">New Cars</Link>
            <Link to="/compare" className="text-sm text-foreground hover:text-primary transition-colors">Compare</Link>
            <Link to="/emi-calculator" className="text-sm text-foreground hover:text-primary transition-colors">EMI</Link>
            <Link to="/news" className="text-sm text-foreground hover:text-primary transition-colors">News</Link>
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

            {/* Wishlist - Hide on small mobile */}
            <Link to="/wishlist" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="px-2">
                <Heart className="w-4 h-4" />
                <span className="hidden md:ml-2 md:inline">Wishlist</span>
              </Button>
            </Link>

            {/* Authentication - Always visible */}
            {loading ? (
              <Button size="sm" disabled className="bg-gradient-accent text-xs md:text-sm">
                Loading...
              </Button>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline text-sm">
                      {user.user_metadata?.firstName || user.email?.split('@')[0] || 'User'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <div>
                      <ProfileModal />
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wishlist" className="flex items-center w-full">
                      <Heart className="w-4 h-4 mr-2" />
                      My Wishlist
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs md:text-sm px-4 py-2 rounded-lg shadow-sm">
                  Login
                </Button>
              </Link>
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
                  <Link to="/cars" className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2">
                    New Cars
                  </Link>
                  <Link to="/compare" className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2">
                    Compare Cars
                  </Link>
                  <Link to="/emi-calculator" className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2">
                    EMI Calculator
                  </Link>
                  <Link to="/news" className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2">
                    News & Reviews
                  </Link>
                  <Link to="/wishlist" className="text-lg font-medium text-foreground hover:text-primary transition-colors py-2 sm:hidden">
                    Wishlist
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="lg:hidden border-t border-border/50 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search cars, brands..." 
              className="pl-10 bg-background border-border focus:border-primary"
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
