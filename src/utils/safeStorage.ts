// src/utils/safeStorage.ts
// Safe localStorage wrapper that handles SecurityErrors and other exceptions
export const safeLocalStorage = (() => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    // Test if localStorage is accessible
    const testKey = "__supabase_test";
    localStorage.setItem(testKey, "1");
    localStorage.removeItem(testKey);
    return localStorage;
  } catch (error) {
    console.warn("LocalStorage not available:", error.message);

    // Return a mock storage implementation
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null
    };
  }
})();
