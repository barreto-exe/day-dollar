import { useState, useEffect } from 'react';

/**
 * Hook for using sessionStorage with React state.
 * Similar to useLocalStorage but data persists only for the browser session.
 */
export function useSessionStorage(key, initialValue) {
    // Get initial value from sessionStorage or use provided initial value
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.sessionStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading sessionStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Update sessionStorage when state changes
    useEffect(() => {
        try {
            window.sessionStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error setting sessionStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
