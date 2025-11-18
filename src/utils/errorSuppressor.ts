// src/utils/errorSuppressor.ts
// This should be imported at the very top of main.tsx BEFORE React

export function installGlobalErrorSuppressor() {
  if (typeof window === 'undefined') return;

  // Track if we've already installed suppressors
  if ((window as any).__errorSuppressorInstalled) return;
  (window as any).__errorSuppressorInstalled = true;

  console.log("🛡️ Installing global error suppressor for cloud environment compatibility");

  // Track suppressed errors to avoid duplicate logging
  const suppressedErrors = new Set<string>();
  let suppressionCount = 0;

  // List of error patterns to suppress
  const suppressPatterns = [
    'localStorage',
    'sessionStorage',
    'SecurityError',
    'The request was denied',
    'Access is denied for this document',
    'Failed to read the \'localStorage\'',
    'Failed to read the \'sessionStorage\'',
    'content_compiled.js', // Chrome extension errors
    'Unexpected error in content script', // Chrome extension errors
  ];

  const shouldSuppress = (message: string): boolean => {
    if (!message) return false;
    return suppressPatterns.some(pattern => 
      message.includes(pattern)
    );
  };

  // Helper to log suppression only once per unique error
  const logSuppression = (type: string, message: string) => {
    const key = `${type}:${message.substring(0, 100)}`;
    if (!suppressedErrors.has(key)) {
      suppressedErrors.add(key);
      suppressionCount++;
      // Only log the first suppression to avoid console spam
      if (suppressionCount === 1) {
        console.log(`🔇 Cloud environment: Using fallback storage (localStorage not available)`);
      }
    }
  };

  // Override console.error
  const originalConsoleError = console.error;
  console.error = function(...args: any[]) {
    const message = String(args[0] || '');
    if (shouldSuppress(message)) {
      logSuppression('error', message);
      return;
    }
    return originalConsoleError.apply(console, args);
  };

  // Also intercept direct console methods that Chrome extensions use
  ['log', 'info', 'debug'].forEach(method => {
    const original = (console as any)[method];
    (console as any)[method] = function(...args: any[]) {
      const message = String(args[0] || '');
      // Check if it's an extension error about localStorage
      if (message.includes('Unexpected error in content script') && 
          (message.includes('localStorage') || message.includes('SecurityError'))) {
        logSuppression('extension error', message);
        return;
      }
      return original.apply(console, args);
    };
  });

  // Override console.warn (some libraries use warn for errors)
  const originalConsoleWarn = console.warn;
  console.warn = function(...args: any[]) {
    const message = String(args[0] || '');
    if (shouldSuppress(message)) {
      logSuppression('warning', message);
      return;
    }
    return originalConsoleWarn.apply(console, args);
  };

  // Suppress window.onerror
  const originalOnError = window.onerror;
  window.onerror = function(msg, url, lineNo, columnNo, error) {
    const message = String(msg || error?.message || '');
    if (shouldSuppress(message)) {
      logSuppression('window error', message);
      return true; // Prevent default error handling
    }
    if (originalOnError) {
      return originalOnError.call(window, msg, url, lineNo, columnNo, error);
    }
    return false;
  };

  // Suppress unhandledrejection
  const originalOnUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    const message = String(event.reason?.message || event.reason || '');
    if (shouldSuppress(message)) {
      logSuppression('unhandled rejection', message);
      event.preventDefault();
      return true;
    }
    if (originalOnUnhandledRejection) {
      return originalOnUnhandledRejection.call(window, event);
    }
    return false;
  };

  // Override addEventListener to intercept error events
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type: string, listener: any, options?: any) {
    if (type === 'error' || type === 'unhandledrejection') {
      const wrappedListener = function(event: any) {
        const message = event.error?.message || event.reason?.message || 
                       event.message || '';
        if (shouldSuppress(message)) {
          logSuppression(`event: ${type}`, message);
          event.preventDefault();
          event.stopPropagation();
          return false;
        }
        if (typeof listener === 'function') {
          return listener.call(this, event);
        }
      };
      return originalAddEventListener.call(window, type, wrappedListener, options);
    }
    return originalAddEventListener.call(window, type, listener, options);
  };

  // Note: DO NOT override Promise.prototype methods as they break React internals
  // The window.onunhandledrejection handler above is sufficient for catching promise errors

  console.log("✅ Global error suppressor installed successfully");
}

// Auto-install on import
installGlobalErrorSuppressor();
