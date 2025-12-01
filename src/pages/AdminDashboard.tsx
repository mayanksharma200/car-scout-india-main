import { useState, useEffect, useRef } from "react";
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
  Search,
  Upload,
  Database,
  MonitorPlay,
  Image as ImageIcon,
} from "lucide-react";
import ImageDebugTest from "@/components/ImageDebugTest";
// import CarBatchImageUpdater from "@/components/CarBatchImageUpdater";
import IdeogramCarImageGenerator from "@/components/IdeogramCarImageGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface Activity {
  id: string;
  action_type: string;
  action_title: string;
  action_details: string;
  entity_type: string;
  created_at: string;
  metadata?: any;
}

interface NewLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [newLeads, setNewLeads] = useState<NewLead[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalCars: 0,
    recentActivitiesCount: 0,
    pendingNewLeadsCount: 0,
    averagePrice: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const { logout } = useAdminAuth();

  // Fetch recent activities
  const fetchActivities = async () => {
    try {
      setLoadingActivities(true);
      const response = await fetch('/api/admin/activities?limit=20');
      const result = await response.json();

      if (result.success) {
        setActivities(result.data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Fetch new leads
  const fetchNewLeads = async () => {
    try {
      setLoadingLeads(true);
      const response = await fetch('/api/admin/new-leads?limit=20');
      const result = await response.json();

      if (result.success) {
        setNewLeads(result.data);
      }
    } catch (error) {
      console.error('Error fetching new leads:', error);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true);

      // Fetch recent activities count using the API endpoint
      const activitiesResponse = await fetch('/api/admin/activities?limit=1000');
      const activitiesResult = await activitiesResponse.json();
      const recentActivitiesCount = activitiesResult.success ? activitiesResult.data.length : 0;

      // Fetch pending new leads count using the API endpoint
      const newLeadsResponse = await fetch('/api/admin/new-leads?limit=1000');
      const newLeadsResult = await newLeadsResponse.json();
      const pendingNewLeadsCount = newLeadsResult.success ? newLeadsResult.data.length : 0;

      // Fetch stats from backend (now includes average price from AWS RDS)
      const statsResponse = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const statsResult = await statsResponse.json();

      if (statsResult.success) {
        setDashboardStats({
          totalCars: statsResult.data.totalCars,
          recentActivitiesCount: recentActivitiesCount,
          pendingNewLeadsCount: pendingNewLeadsCount,
          averagePrice: statsResult.data.averagePrice,
        });
      }

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Load activities and leads on mount
  useEffect(() => {
    fetchActivities();
    fetchNewLeads();
    fetchDashboardStats();
  }, []);

  // Prevent auto-scroll on page load
  useEffect(() => {
    // Disable scroll restoration
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Force scroll to top immediately
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
    }

    // Force scroll to top after a small delay to override any child component scrolls
    const timeoutId = setTimeout(() => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop = 0;
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
    return `₹${(price / 1000).toFixed(0)}K`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  };

  const getActivityColor = (entityType: string) => {
    switch (entityType) {
      case 'car':
        return 'bg-blue-500';
      case 'lead':
        return 'bg-green-500';
      case 'content':
        return 'bg-purple-500';
      case 'dealer':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const stats = [
    {
      title: "Total Cars",
      value: loadingStats ? "..." : dashboardStats.totalCars.toString(),
      change: "+12%",
      trend: "up",
      icon: Car,
    },
    {
      title: "Recent Activity",
      value: loadingStats ? "..." : dashboardStats.recentActivitiesCount.toString(),
      change: "+20%",
      trend: "up",
      icon: BarChart3,
    },
    {
      title: "Pending New Leads",
      value: loadingStats ? "..." : dashboardStats.pendingNewLeadsCount.toString(),
      change: "+8%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Avg Car Price",
      value: loadingStats ? "..." : formatPrice(dashboardStats.averagePrice),
      change: "+15%",
      trend: "up",
      icon: TrendingUp,
    },
  ];

  const handleImportCars = async () => {
    setIsImporting(true);
    try {
      toast.info("Starting car data import...");

      const { data, error } = await supabase.functions.invoke(
        "import-comprehensive-cars"
      );

      if (error) {
        throw error;
      }

      toast.success(
        data.message || `Successfully imported ${data.totalCars} cars!`
      );

      // Refresh the page stats
      window.location.reload();
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import car data. Please try again.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-20"
          } transition-all duration-300 bg-card border-r border-border flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-foreground">Carlist360</h2>
                <p className="text-xs text-muted-foreground">Admin Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary"
              >
                <BarChart3 className="w-5 h-5" />
                {sidebarOpen && <span>Dashboard</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/cars"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <Car className="w-5 h-5" />
                {sidebarOpen && <span>Manage Cars</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/leads"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <Users className="w-5 h-5" />
                {sidebarOpen && <span>Lead Management</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/users"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <Users className="w-5 h-5" />
                {sidebarOpen && <span>User Management</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/content"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <FileText className="w-5 h-5" />
                {sidebarOpen && <span>Content Management</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/ads"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <MonitorPlay className="w-5 h-5" />
                {sidebarOpen && <span>Ads Management</span>}
              </Link>
            </li>
            <li>
              <Link
                to="/admin/image-logs"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <ImageIcon className="w-5 h-5" />
                {sidebarOpen && <span>Image Logs</span>}
              </Link>
            </li>
            {/* <li>
              <Link
                to="/admin/analytics"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <TrendingUp className="w-5 h-5" />
                {sidebarOpen && <span>Analytics</span>}
              </Link>
            </li> */}
          </ul>
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold">
              A
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-muted-foreground">
                  admin@Carlist360.com
                </p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div ref={mainContentRef} className="flex-1 flex flex-col overflow-auto">
        {/* Header */}
        <header className="bg-background border-b border-border p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">
              Dashboard Overview
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input placeholder="Search..." className="pl-10 w-64" />
            </div> */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs">
                3
              </Badge>
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                      <p
                        className={`text-sm ${stat.trend === "up"
                          ? "text-green-600"
                          : "text-red-600"
                          }`}
                      >
                        {stat.change} from last month
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-2 space-y-4">
                  {loadingActivities ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : activities.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No recent activity
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(
                            activity.entity_type
                          )}`}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{activity.action_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {activity.action_details}
                          </p>
                          {activity.metadata?.count && (
                            <p className="text-xs text-muted-foreground">
                              {activity.metadata.count} items
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending New Leads */}
            <Card>
              <CardHeader>
                <CardTitle>Pending New Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] overflow-y-auto pr-2 space-y-4">
                  {loadingLeads ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : newLeads.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      No pending new leads
                    </div>
                  ) : (
                    newLeads.map((lead) => (
                      <Link
                        key={lead.id}
                        to="/admin/leads"
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors block"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{lead.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {lead.phone} • {lead.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(lead.created_at)}
                          </p>
                        </div>
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          {lead.source}
                        </Badge>
                      </Link>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link to="/admin/cars/new">
                  <Button className="w-full h-20 flex flex-col gap-2 bg-gradient-primary hover:opacity-90">
                    <Car className="w-6 h-6" />
                    <span>Add New Car</span>
                  </Button>
                </Link>
                {/* <Button
                  onClick={handleImportCars}
                  disabled={isImporting}
                  className="w-full h-20 flex flex-col gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {isImporting ? (
                    <Upload className="w-6 h-6 animate-spin" />
                  ) : (
                    <Database className="w-6 h-6" />
                  )}
                  <span>
                    {isImporting ? "Importing..." : "Import 1000+ Cars"}
                  </span>
                </Button> */}
                <Link to="/admin/content/news/new">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col gap-2"
                  >
                    <FileText className="w-6 h-6" />
                    <span>Write Article</span>
                  </Button>
                </Link>
                <Link to="/admin/leads">
                  <Button
                    variant="outline"
                    className="w-full h-20 flex flex-col gap-2"
                  >
                    <Users className="w-6 h-6" />
                    <span>Review Leads</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Ideogram AI Car Image Generator - NEW AI-POWERED FEATURE */}
          <div className="mt-8">
            <IdeogramCarImageGenerator />
          </div>

          {/* Car Batch Image Updater - IMAGIN SELECTIVE FEATURE */}
          {/* <div className="mt-8">
            <CarBatchImageUpdater />
          </div> */}

          {/* Image Debug Test */}
          {/* <div className="mt-8">
            <ImageDebugTest />
          </div> */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
