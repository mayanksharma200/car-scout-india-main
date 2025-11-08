import { useState } from "react";
import {
  BarChart3,
  Car,
  FileText,
  Users,
  TrendingUp,
  Bell,
  Settings,
  LogOut,
  Menu,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useToast } from "@/hooks/use-toast";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, logout } = useAdminAuth();
  const { toast } = useToast();

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: BarChart3 },
    { name: "Manage Cars", href: "/admin/cars", icon: Car },
    { name: "Lead Management", href: "/admin/leads", icon: Users },
    { name: "Content Management", href: "/admin/content", icon: FileText },
    { name: "API Settings", href: "/admin/api-settings", icon: Globe },
    { name: "Analytics", href: "/admin/analytics", icon: TrendingUp },
  ];

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout Error",
        description: "There was an issue logging out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get user initials for avatar
  const getUserInitials = (email?: string) => {
    if (!email) return "A";
    const parts = email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 bg-card border-r border-border flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-foreground">Carlist360</h2>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span>{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* System Status */}
        {sidebarOpen && (
          <div className="p-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-2">
              System Status
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Data Sync</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>API Integration</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Admin Auth</span>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* User Menu */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
              {getUserInitials(adminUser?.email)}
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {adminUser?.email ? adminUser.email.split("@")[0] : "Admin User"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {adminUser?.email || "admin@Carlist360.com"}
                </p>
                <p className="text-xs text-primary font-medium capitalize">
                  {adminUser?.role || "Administrator"}
                </p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" size="sm" title="Settings">
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                title="Logout"
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-background border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Breadcrumb or current page indicator */}
            <div className="text-sm text-muted-foreground">
              {location.pathname === "/admin" && "Dashboard"}
              {location.pathname === "/admin/cars" && "Car Management"}
              {location.pathname === "/admin/leads" && "Lead Management"}
              {location.pathname === "/admin/content" && "Content Management"}
              {location.pathname === "/admin/api-settings" && "API Settings"}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              title="View Main Site"
            >
              View Site →
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
