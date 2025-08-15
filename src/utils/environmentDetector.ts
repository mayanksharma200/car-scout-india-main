// Environment detection utility for better user experience

export interface EnvironmentInfo {
  isCloudEnvironment: boolean;
  isDevelopment: boolean;
  isLocalHost: boolean;
  isInIframe: boolean;
  storageAvailable: boolean;
  platform: 'local' | 'cloud' | 'iframe' | 'production';
}

export const detectEnvironment = (): EnvironmentInfo => {
  if (typeof window === 'undefined') {
    return {
      isCloudEnvironment: false,
      isDevelopment: false,
      isLocalHost: false,
      isInIframe: false,
      storageAvailable: false,
      platform: 'production'
    };
  }

  const hostname = window.location.hostname;
  const isInIframe = window.self !== window.top;
  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isCloudEnvironment = hostname.includes('.fly.dev') || 
                            hostname.includes('.vercel.app') ||
                            hostname.includes('.netlify.app') ||
                            hostname.includes('.herokuapp.com');
  
  const isDevelopment = import.meta.env.DEV;
  
  // Test localStorage availability
  let storageAvailable = false;
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, 'test');
    window.localStorage.removeItem(test);
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }

  let platform: 'local' | 'cloud' | 'iframe' | 'production' = 'production';
  if (isInIframe) platform = 'iframe';
  else if (isCloudEnvironment) platform = 'cloud';
  else if (isLocalHost) platform = 'local';

  return {
    isCloudEnvironment,
    isDevelopment,
    isLocalHost,
    isInIframe,
    storageAvailable,
    platform
  };
};

export const getEnvironmentMessage = (): string => {
  const env = detectEnvironment();
  
  if (!env.storageAvailable) {
    if (env.isInIframe) {
      return "Running in iframe - using memory storage for session data";
    } else if (env.isCloudEnvironment) {
      return "Cloud environment detected - using memory storage for session data";
    } else {
      return "Browser security settings prevent localStorage access - using memory storage";
    }
  }
  
  return "Local storage available - full functionality enabled";
};
