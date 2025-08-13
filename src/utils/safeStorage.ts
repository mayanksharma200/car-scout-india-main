// src/utils/safeStorage.ts
// Safe localStorage wrapper that handles SecurityErrors and other exceptions

// In-memory fallback storage for when localStorage is not available
class MemoryStorage implements Storage {
  private data: { [key: string]: string } = {};
  
  get length(): number {
    return Object.keys(this.data).length;
  }
  
  getItem(key: string): string | null {
    return this.data[key] || null;
  }
  
  setItem(key: string, value: string): void {
    this.data[key] = value;
  }
  
  removeItem(key: string): void {
    delete this.data[key];
  }
  
  clear(): void {
    this.data = {};
  }
  
  key(index: number): string | null {
    const keys = Object.keys(this.data);
    return keys[index] || null;
  }
}

export const safeLocalStorage = (() => {
  // Server-side rendering check
  if (typeof window === "undefined") {
    return new MemoryStorage();
  }

  try {
    // Test if localStorage is accessible and writable
    const testKey = "__storage_test__";
    const testValue = "test";
    
    // Try to access localStorage
    if (!window.localStorage) {
      throw new Error("localStorage not available");
    }
    
    // Test write/read/delete operations
    window.localStorage.setItem(testKey, testValue);
    const retrieved = window.localStorage.getItem(testKey);
    window.localStorage.removeItem(testKey);
    
    if (retrieved !== testValue) {
      throw new Error("localStorage read/write test failed");
    }
    
    console.log("✅ localStorage is available and working");
    return window.localStorage;
    
  } catch (error) {
    console.warn("❌ LocalStorage not available, using memory storage fallback:", error.message);
    
    // Return memory storage fallback
    return new MemoryStorage();
  }
})();

// Export a function to check if we're using real localStorage or fallback
export const isLocalStorageAvailable = () => {
  try {
    return typeof window !== "undefined" && 
           window.localStorage && 
           safeLocalStorage === window.localStorage;
  } catch {
    return false;
  }
};
