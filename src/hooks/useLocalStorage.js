import { useState } from 'react';

/**
 * src/hooks/useLocalStorage.js
 * Keeps a React state value in sync with localStorage.
 *
 * @param {string} key          - localStorage key
 * @param {*}      initialValue - fallback if nothing stored yet
 * @returns {[*, Function]}     - [storedValue, setValue]
 */
const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`[useLocalStorage] Failed to read "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore =
        typeof value === 'function' ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`[useLocalStorage] Failed to write "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

export default useLocalStorage;
