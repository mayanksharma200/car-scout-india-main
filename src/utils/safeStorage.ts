// src/utils/safeStorage.ts
export const safeLocalStorage =
  typeof window !== "undefined" &&
  (() => {
    try {
      localStorage.setItem("__test", "1");
      localStorage.removeItem("__test");
      return localStorage;
    } catch {
      return undefined;
    }
  })();
