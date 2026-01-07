import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { createAppTheme } from '../theme/theme';

const ThemeContext = createContext(null);

// Theme mode options
export const THEME_MODES = {
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
};

const STORAGE_KEY = 'dayDollar_themeMode';

export function ThemeProvider({ children }) {
    const [themeMode, setThemeMode] = useLocalStorage(STORAGE_KEY, THEME_MODES.SYSTEM);
    const [systemPrefersDark, setSystemPrefersDark] = useState(
        window.matchMedia('(prefers-color-scheme: dark)').matches
    );

    // Listen for system preference changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e) => {
            setSystemPrefersDark(e.matches);
        };

        // Modern browsers
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            // Legacy support
            mediaQuery.addListener(handleChange);
            return () => mediaQuery.removeListener(handleChange);
        }
    }, []);

    // Determine the actual theme to use
    const resolvedMode = useMemo(() => {
        if (themeMode === THEME_MODES.SYSTEM) {
            return systemPrefersDark ? 'dark' : 'light';
        }
        return themeMode;
    }, [themeMode, systemPrefersDark]);

    // Create the theme based on resolved mode
    const theme = useMemo(() => createAppTheme(resolvedMode), [resolvedMode]);

    const value = useMemo(
        () => ({
            themeMode,
            resolvedMode,
            setThemeMode,
            isDark: resolvedMode === 'dark',
        }),
        [themeMode, resolvedMode, setThemeMode]
    );

    return (
        <ThemeContext.Provider value={value}>
            <MUIThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
}

export function useThemeMode() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
