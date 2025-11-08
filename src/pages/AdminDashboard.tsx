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
} from "lucide-react";
import IMAGINBulkUpdater from "@/components/IMAGINBulkUpdater";
import IMAGINImageTest from "@/components/IMAGINImageTest";
import ImageDebugTest from "@/components/ImageDebugTest";
import CarBatchImageUpdater from "@/components/CarBatchImageUpdater";
import { useStats } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const liveStats = useStats();
  const mainContentRef = useRef<HTMLDivElement>(null);

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

  const stats = [
    {
      title: "Total Cars",
      value: liveStats.totalCars.toString(),
      change: "+12%",
      trend: "up",
      icon: Car,
    },
    {
      title: "Active Leads",
      value: liveStats.totalLeads.toString(),
      change: "+8%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Published Content",
      value: liveStats.publishedContent.toString(),
      change: "+5%",
      trend: "up",
      icon: FileText,
    },
    {
      title: "Avg Car Price",
      value: formatPrice(liveStats.averagePrice),
      change: "+15%",
      trend: "up",
      icon: TrendingUp,
    },
  ];

  const recentActivity = [
    {
      action: "New car added",
      details: "2024 Tata Nexon EV Max",
      time: "2 hours ago",
      type: "car",
    },
    {
      action: "Lead assigned",
      details: "Rajesh Kumar - Swift inquiry",
      time: "4 hours ago",
      type: "lead",
    },
    {
      action: "Article published",
      details: "Electric Vehicle Sales Surge",
      time: "1 day ago",
      type: "content",
    },
    {
      action: "Price updated",
      details: "Hyundai Creta variants",
      time: "2 days ago",
      type: "car",
    },
    {
      action: "New dealer registered",
      details: "Prime Motors, Chennai",
      time: "3 days ago",
      type: "dealer",
    },
  ];

  const pendingTasks = [
    {
      task: "Review 15 pending car listings",
      priority: "high",
      deadline: "Today",
    },
    {
      task: "Approve dealer responses to reviews",
      priority: "medium",
      deadline: "Tomorrow",
    },
    {
      task: "Update festival pricing offers",
      priority: "high",
      deadline: "This week",
    },
    {
      task: "Generate monthly analytics report",
      priority: "low",
      deadline: "End of month",
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
        className={`${
          sidebarOpen ? "w-64" : "w-20"
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
                to="/admin/content"
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-foreground"
              >
                <FileText className="w-5 h-5" />
                {sidebarOpen && <span>Content Management</span>}
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
              <Button variant="ghost" size="sm">
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
                        className={`text-sm ${
                          stat.trend === "up"
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
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          activity.type === "car"
                            ? "bg-blue-500"
                            : activity.type === "lead"
                            ? "bg-green-500"
                            : activity.type === "content"
                            ? "bg-purple-500"
                            : "bg-orange-500"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{activity.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.details}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending Tasks */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingTasks.map((task, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.task}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {task.deadline}
                        </p>
                      </div>
                      <Badge
                        variant={
                          task.priority === "high"
                            ? "destructive"
                            : task.priority === "medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
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

          {/* Car Batch Image Updater - NEW SELECTIVE FEATURE */}
          <CarBatchImageUpdater />

          {/* IMAGIN Bulk Updater */}
          <div className="mt-8">
            <IMAGINBulkUpdater />
          </div>

          {/* IMAGIN Image Test */}
          <div className="mt-8">
            <IMAGINImageTest />
          </div>

          {/* Image Debug Test */}
          <div className="mt-8">
            <ImageDebugTest />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
