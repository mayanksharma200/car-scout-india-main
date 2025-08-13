import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Database, HardDrive, Globe } from "lucide-react";
import { isLocalStorageAvailable } from "@/utils/safeStorage";
import { isSupabaseConfigured, supabaseError } from "@/integrations/supabase/client";

const SystemStatus = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [storageStatus, setStorageStatus] = useState<'checking' | 'available' | 'fallback'>('checking');
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline'>('online');

  useEffect(() => {
    // Check storage availability
    setStorageStatus(isLocalStorageAvailable() ? 'available' : 'fallback');
    
    // Check network status
    const updateNetworkStatus = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
    };
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Only show in development mode
  const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_DEBUG_MODE === 'true';
  
  if (!isDevelopment) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
      case 'online':
        return 'bg-green-500';
      case 'fallback':
        return 'bg-yellow-500';
      case 'offline':
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <span>System Status</span>
                <div className="flex gap-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(storageStatus)}`} />
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(isSupabaseConfigured ? 'available' : 'error')}`} />
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(networkStatus)}`} />
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </Card>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <Card className="mt-2 min-w-[300px]">
            <CardContent className="space-y-3 pt-4">
              
              {/* Storage Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Storage className="w-4 h-4" />
                  <span className="text-sm">Local Storage</span>
                </div>
                <Badge variant={storageStatus === 'available' ? 'default' : 'secondary'}>
                  {storageStatus === 'available' ? 'Available' : 'Memory Fallback'}
                </Badge>
              </div>

              {/* Database Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span className="text-sm">Database</span>
                </div>
                <Badge variant={isSupabaseConfigured ? 'default' : 'destructive'}>
                  {isSupabaseConfigured ? 'Connected' : 'Mock Data'}
                </Badge>
              </div>

              {/* Network Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">Network</span>
                </div>
                <Badge variant={networkStatus === 'online' ? 'default' : 'destructive'}>
                  {networkStatus === 'online' ? 'Online' : 'Offline'}
                </Badge>
              </div>

              {/* Error Details */}
              {supabaseError && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  <strong>Database Error:</strong> {supabaseError}
                </div>
              )}

              {storageStatus === 'fallback' && (
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  <strong>Storage Notice:</strong> Using memory storage. Data won't persist across page reloads.
                </div>
              )}

            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default SystemStatus;
