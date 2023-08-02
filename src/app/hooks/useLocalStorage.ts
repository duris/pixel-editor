// useLocalStorage.ts

import { useState, useEffect } from "react";

function useLocalStorage<T>(key: string, initialValue: T) {
  const isLocalStorageAvailable = typeof localStorage !== "undefined";
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (isLocalStorageAvailable) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    }
    return initialValue; // Default value if localStorage is not available
  });

  useEffect(() => {
    if (isLocalStorageAvailable) {
      localStorage.setItem(key, JSON.stringify(storedValue));
    }
  }, [key, storedValue, isLocalStorageAvailable]);

  return [storedValue, setStoredValue] as const;
}

export default useLocalStorage;
