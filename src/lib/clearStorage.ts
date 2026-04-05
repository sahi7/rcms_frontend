// src/lib/clearStorage.ts
import { queryClient } from '@/main';

/**
 * List of storage keys to clear on logout
 */
const STORAGE_KEYS = [
  "institution-config",
  "auth-storage",
  "user-storage",
  "settings-storage",
];

/**
 * Clears selected keys from localStorage & sessionStorage
 */
export const clearStorage = () => {
  try {
    STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    queryClient?.clear();
  } catch (error) {
    console.error("Error clearing storage:", error);
  }
};