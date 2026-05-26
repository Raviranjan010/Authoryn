import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce a value.
 * Used to delay search API requests.
 * @param {*} value - Value to debounce.
 * @param {number} delay - Delay in milliseconds.
 * @returns {*} Debounced value.
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
