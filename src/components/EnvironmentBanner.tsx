import { useEffect, useState } from "react";
import { AlertCircle, Cloud, Monitor } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { detectEnvironment } from "@/utils/environmentDetector";

const EnvironmentBanner = () => {
  const [env, setEnv] = useState(detectEnvironment());
  const [show, setShow] = useState(false);

  useEffect(() => {
    const environment = detectEnvironment();
    setEnv(environment);
    
    // Show banner only if localStorage is not available and it's a cloud/iframe environment
    if (!environment.storageAvailable && (environment.isCloudEnvironment || environment.isInIframe)) {
      setShow(true);
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => setShow(false), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  const getIcon = () => {
    if (env.isInIframe) return <Monitor className="h-4 w-4" />;
    if (env.isCloudEnvironment) return <Cloud className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const getMessage = () => {
    if (env.isInIframe) {
      return "Running in iframe mode - session data will not persist between page reloads.";
    }
    if (env.isCloudEnvironment) {
      return "Cloud development environment - using memory storage for optimal performance.";
    }
    return "Browser security settings detected - using memory storage for session data.";
  };

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-800">
      {getIcon()}
      <AlertDescription>
        {getMessage()}
        <button 
          onClick={() => setShow(false)}
          className="ml-2 text-blue-600 hover:text-blue-800 underline text-sm"
        >
          Dismiss
        </button>
      </AlertDescription>
    </Alert>
  );
};

export default EnvironmentBanner;
