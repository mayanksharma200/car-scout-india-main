import { useState, useEffect } from "react";
import { Settings, Save, TestTube, Globe, Key, Webhook, Zap, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import AdminLayout from "@/components/AdminLayout";
import { supabase } from "@/integrations/supabase/client";

interface APIConfig {
  apiKey: string;
  baseUrl: string;
  syncInterval: string;
  endpoints: Record<string, string>;
}

interface BrandAPI {
  brand: string;
  endpoint: string;
  apiKey: string;
  enabled: boolean;
  method: string;
  headers: Record<string, string>;
}

interface GeneralSettings {
  autoSendToAPI: boolean;
  sendDelay: number;
  retryAttempts: number;
  enableWebhooks: boolean;
  logApiCalls: boolean;
}

const APISettings = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for different API configurations
  const [carwaleConfig, setCarwaleConfig] = useState<APIConfig>({
    apiKey: "",
    baseUrl: "https://api.carwale.com/v1",
    syncInterval: "daily",
    endpoints: {
      cars: "/cars",
      carDetails: "/cars/{id}",
      pricing: "/cars/{id}/pricing",
      variants: "/cars/{id}/variants",
      images: "/cars/{id}/images",
      brands: "/brands",
      search: "/cars/search"
    }
  });

  const [brandAPIs, setBrandAPIs] = useState<BrandAPI[]>([]);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    autoSendToAPI: true,
    sendDelay: 5,
    retryAttempts: 3,
    enableWebhooks: true,
    logApiCalls: true
  });

  const [syncStats, setSyncStats] = useState({
    lastSync: null as string | null,
    totalCarsSync: 0,
    enabled: false
  });

  // Load settings from database
  useEffect(() => {
    loadAPISettings();
  }, []);

  const loadAPISettings = async () => {
    try {
      setLoading(true);
      
      const { data: settings, error } = await supabase
        .from('api_settings')
        .select('*');

      if (error) {
        console.error('Error loading API settings:', error);
        toast({
          title: "Error",
          description: "Failed to load API settings",
          variant: "destructive",
        });
        return;
      }

      // Process loaded settings
      settings?.forEach((setting) => {
        switch (setting.setting_key) {
          case 'carwale_api':
            setCarwaleConfig(setting.setting_value as unknown as APIConfig);
            setSyncStats(prev => ({ 
              ...prev, 
              enabled: setting.enabled 
            }));
            break;
          case 'brand_apis':
            setBrandAPIs((setting.setting_value as any)?.apis || []);
            break;
          case 'general_settings':
            setGeneralSettings(setting.setting_value as unknown as GeneralSettings);
            break;
        }
      });

      // Load sync statistics from cars table
      const { data: carsData } = await supabase
        .from('cars')
        .select('id, last_synced')
        .order('last_synced', { ascending: false })
        .limit(1);

      if (carsData && carsData.length > 0) {
        setSyncStats(prev => ({
          ...prev,
          lastSync: carsData[0].last_synced,
          totalCarsSync: prev.totalCarsSync
        }));
      }

      const { count } = await supabase
        .from('cars')
        .select('*', { count: 'exact', head: true });

      setSyncStats(prev => ({
        ...prev,
        totalCarsSync: count || 0
      }));

    } catch (error) {
      console.error('Error in loadAPISettings:', error);
      toast({
        title: "Error",
        description: "Failed to load API settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAPISettings = async () => {
    try {
      setSaving(true);

      // Save CarWale API settings
      const { error: carwaleError } = await supabase
        .from('api_settings')
        .upsert({
          setting_key: 'carwale_api',
          setting_value: carwaleConfig as any,
          enabled: syncStats.enabled
        });

      if (carwaleError) throw carwaleError;

      // Save Brand APIs
      const { error: brandError } = await supabase
        .from('api_settings')
        .upsert({
          setting_key: 'brand_apis',
          setting_value: { apis: brandAPIs } as any,
          enabled: brandAPIs.some(api => api.enabled)
        });

      if (brandError) throw brandError;

      // Save General Settings
      const { error: generalError } = await supabase
        .from('api_settings')
        .upsert({
          setting_key: 'general_settings',
          setting_value: generalSettings as any,
          enabled: true
        });

      if (generalError) throw generalError;

      toast({
        title: "Settings Saved",
        description: "API settings have been updated successfully.",
      });

    } catch (error) {
      console.error('Error saving API settings:', error);
      toast({
        title: "Error",
        description: "Failed to save API settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const testApiNinjas = async () => {
    try {
      toast({
        title: "Testing API-Ninjas API...",
        description: "Connecting to API-Ninjas servers",
      });

      // Call our edge function to test the API
      const { data, error } = await supabase.functions.invoke('sync-api-ninjas-data', {
        body: { test: true }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "API-Ninjas Test Successful",
        description: "API connection verified. Ready to sync car data.",
      });
    } catch (error) {
      console.error('API-Ninjas test error:', error);
      toast({
        title: "API-Ninjas Test Failed",
        description: "Please check your API key configuration",
        variant: "destructive",
      });
    }
  };

  const syncApiNinjasData = async () => {
    try {
      toast({
        title: "Syncing Car Data...",
        description: "Fetching latest car data from API-Ninjas",
      });

      // Call our edge function to handle the sync
      const { data, error } = await supabase.functions.invoke('sync-api-ninjas-data');

      if (error) throw error;

      // Refresh the featured cars display
      window.location.reload();

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${data.newCars || 0} new cars and updated ${data.updatedCars || 0} existing cars.`,
      });

    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync car data from API-Ninjas",
        variant: "destructive",
      });
    }
  };

  const testCarWaleAPI = async () => {
    if (!carwaleConfig.apiKey) {
      toast({
        title: "Error",
        description: "Please enter your CarWale API key first",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Testing CarWale API...",
        description: "Connecting to CarWale servers",
      });

      // Make a real API call to test the connection
      const testUrl = `${carwaleConfig.baseUrl}${carwaleConfig.endpoints.brands}`;
      const response = await fetch(testUrl, {
        headers: {
          'Authorization': `Bearer ${carwaleConfig.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast({
          title: "CarWale API Test Successful",
          description: "API connection verified. Ready to sync car data.",
        });
      } else {
        toast({
          title: "CarWale API Test Failed",
          description: `API returned status: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('CarWale API test error:', error);
      toast({
        title: "CarWale API Test Failed",
        description: "Please check your API key and network connection",
        variant: "destructive",
      });
    }
  };

  const syncCarWaleData = async () => {
    if (!carwaleConfig.apiKey || !syncStats.enabled) {
      toast({
        title: "Error", 
        description: "Please configure and enable CarWale API first",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Syncing Car Data...",
        description: "Fetching latest car data from CarWale",
      });

      // Call our edge function to handle the sync
      const { data, error } = await supabase.functions.invoke('sync-carwale-data', {
        body: {
          apiKey: carwaleConfig.apiKey,
          baseUrl: carwaleConfig.baseUrl,
          endpoints: carwaleConfig.endpoints
        }
      });

      if (error) throw error;

      // Update sync statistics
      setSyncStats(prev => ({
        ...prev,
        lastSync: new Date().toISOString(),
        totalCarsSync: data.totalCars || prev.totalCarsSync
      }));

      toast({
        title: "Sync Complete",
        description: `Successfully synced ${data.newCars || 0} new cars and updated ${data.updatedCars || 0} existing cars.`,
      });

    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: "Failed to sync car data from CarWale API",
        variant: "destructive",
      });
    }
  };

  const testBrandAPI = async (brandIndex: number) => {
    const brand = brandAPIs[brandIndex];
    
    if (!brand.endpoint || !brand.apiKey) {
      toast({
        title: "Error",
        description: "Please configure the API endpoint and key first",
        variant: "destructive",
      });
      return;
    }

    const testData = {
      name: "Test User",
      email: "test@example.com",
      phone: "+91 99999 99999",
      city: "Mumbai",
      interestedCar: {
        brand: brand.brand,
        model: "Test Model",
        variant: "Test Variant"
      },
      budget: "₹10-15 Lakh",
      timeline: "Within 1 month",
      source: "website_test"
    };

    try {
      toast({
        title: "Testing API...",
        description: `Sending test lead to ${brand.brand}`,
      });

      const response = await fetch(brand.endpoint, {
        method: brand.method,
        headers: {
          ...brand.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        toast({
          title: "Test Successful",
          description: `${brand.brand} API responded successfully`,
        });
      } else {
        toast({
          title: "Test Failed",
          description: `${brand.brand} API returned status: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Brand API test error:', error);
      toast({
        title: "Test Failed",
        description: `Failed to connect to ${brand.brand} API`,
        variant: "destructive",
      });
    }
  };

  const addBrandAPI = () => {
    const newAPI: BrandAPI = {
      brand: "",
      endpoint: "",
      apiKey: "",
      enabled: false,
      method: "POST",
      headers: { "Content-Type": "application/json" }
    };
    
    setBrandAPIs(prev => [...prev, newAPI]);
  };

  const removeBrandAPI = (index: number) => {
    setBrandAPIs(prev => prev.filter((_, i) => i !== index));
  };

  const updateBrandAPI = (index: number, field: string, value: any) => {
    setBrandAPIs(prev => prev.map((api, i) => 
      i === index ? { ...api, [field]: value } : api
    ));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading API settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">API Settings</h1>
            <p className="text-muted-foreground">Configure lead routing and integrations</p>
          </div>
          <Button 
            onClick={saveAPISettings} 
            disabled={saving}
            className="bg-gradient-primary hover:opacity-90"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        <Tabs defaultValue="api-ninjas" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="api-ninjas">API-Ninjas</TabsTrigger>
            
            <TabsTrigger value="brand-apis">Brand APIs</TabsTrigger>
            <TabsTrigger value="general">General Settings</TabsTrigger>
          </TabsList>

          {/* API-Ninjas Tab */}
          <TabsContent value="api-ninjas" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    API-Ninjas Integration
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">
                      Connected
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold text-sm mb-2">API Configuration</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    API-Ninjas cars API provides comprehensive vehicle data including specifications, fuel efficiency, and engine details.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p><strong>Base URL:</strong> https://api.api-ninjas.com/v1</p>
                    <p><strong>Endpoint:</strong> /cars</p>
                    <p><strong>Status:</strong> <span className="text-green-600">API Key Configured</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t">
                  <Button 
                    onClick={testApiNinjas}
                    variant="outline"
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test API Connection
                  </Button>
                  <Button 
                    onClick={syncApiNinjasData}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Sync Car Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Brand APIs Tab */}
          <TabsContent value="brand-apis" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Brand API Endpoints</h3>
                <p className="text-sm text-muted-foreground">Configure lead routing to OEM APIs</p>
              </div>
              <Button onClick={addBrandAPI} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Brand API
              </Button>
            </div>

            <div className="space-y-4">
              {brandAPIs.map((api, index) => (
                <Card key={index}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={api.enabled ? "default" : "secondary"}>
                          {api.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <span className="font-medium">{api.brand || "New Brand API"}</span>
                      </div>
                      <Button
                        onClick={() => removeBrandAPI(index)}
                        variant="ghost"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Brand Name</Label>
                        <Input
                          value={api.brand}
                          onChange={(e) => updateBrandAPI(index, 'brand', e.target.value)}
                          placeholder="e.g., Maruti Suzuki"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>API Endpoint</Label>
                        <Input
                          value={api.endpoint}
                          onChange={(e) => updateBrandAPI(index, 'endpoint', e.target.value)}
                          placeholder="https://api.brand.com/leads"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>API Key</Label>
                        <Input
                          type="password"
                          value={api.apiKey}
                          onChange={(e) => updateBrandAPI(index, 'apiKey', e.target.value)}
                          placeholder="Enter API key"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>HTTP Method</Label>
                        <Select
                          value={api.method}
                          onValueChange={(value) => updateBrandAPI(index, 'method', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="POST">POST</SelectItem>
                            <SelectItem value="PUT">PUT</SelectItem>
                            <SelectItem value="PATCH">PATCH</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={api.enabled}
                          onCheckedChange={(checked) => updateBrandAPI(index, 'enabled', checked)}
                        />
                        <Label>Enable API</Label>
                      </div>
                      <Button
                        onClick={() => testBrandAPI(index)}
                        variant="outline"
                        size="sm"
                        disabled={!api.endpoint || !api.apiKey}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        Test API
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  General API Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-send leads to API</Label>
                    <p className="text-sm text-muted-foreground">Automatically send new leads to configured APIs</p>
                  </div>
                  <Switch
                    checked={generalSettings.autoSendToAPI}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({...prev, autoSendToAPI: checked}))}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Send Delay (minutes)</Label>
                    <Input
                      type="number"
                      value={generalSettings.sendDelay}
                      onChange={(e) => setGeneralSettings(prev => ({...prev, sendDelay: parseInt(e.target.value) || 0}))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Retry Attempts</Label>
                    <Input
                      type="number"
                      value={generalSettings.retryAttempts}
                      onChange={(e) => setGeneralSettings(prev => ({...prev, retryAttempts: parseInt(e.target.value) || 0}))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Log API Calls</Label>
                    <p className="text-sm text-muted-foreground">Keep detailed logs of all API interactions</p>
                  </div>
                  <Switch
                    checked={generalSettings.logApiCalls}
                    onCheckedChange={(checked) => setGeneralSettings(prev => ({...prev, logApiCalls: checked}))}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default APISettings;