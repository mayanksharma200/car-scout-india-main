// src/utils/localStoragePolyfill.ts
// This should be imported at the very top of your main.tsx or App.tsx

// Memory storage implementation
class MemoryStorage implements Storage {
  private data: { [key: string]: string } = {};

  get length(): number {
    return Object.keys(this.data).length;
  }

  clear(): void {
    this.data = {};
  }

  getItem(key: string): string | null {
    return this.data[key] || null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.data);
    return keys[index] || null;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  setItem(key: string, value: string): void {
    this.data[key] = String(value);
  }
}

// Check if localStorage is available and working
function isLocalStorageAvailable(): boolean {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    const test = '__localStorage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Install polyfill if needed
function installLocalStoragePolyfill() {
  if (!isLocalStorageAvailable() && typeof window !== 'undefined') {
    console.log('🔧 Installing localStorage polyfill...');
    
    const memoryStorage = new MemoryStorage();
    
    // Override localStorage with our polyfill
    Object.defineProperty(window, 'localStorage', {
      value: memoryStorage,
      writable: false,
      configurable: false
    });
    
    // Also override sessionStorage for consistency
    Object.defineProperty(window, 'sessionStorage', {
      value: new MemoryStorage(),
      writable: false,
      configurable: false
    });
    
    console.log('✅ localStorage polyfill installed successfully');
  }
}

// Install the polyfill immediately
installLocalStoragePolyfill();

export { isLocalStorageAvailable, installLocalStoragePolyfill };