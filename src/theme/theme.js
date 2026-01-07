import { createTheme } from '@mui/material/styles';

// Shared typography and shape settings
const sharedSettings = {
    typography: {
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        h1: { fontWeight: 700 },
        h2: { fontWeight: 600 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 500 },
        h6: { fontWeight: 500 },
        button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: { borderRadius: 12 },
};

// Dark theme palette
const darkPalette = {
    mode: 'dark',
    primary: {
        main: '#4CAF50',
        light: '#66BB6A',
        dark: '#388E3C',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#FFD700',
        light: '#FFEB3B',
        dark: '#FFC107',
        contrastText: '#000000',
    },
    background: {
        default: '#121212',
        paper: '#1E1E1E',
    },
    text: {
        primary: '#ffffff',
        secondary: 'rgba(255, 255, 255, 0.7)',
    },
    success: { main: '#4CAF50' },
    error: { main: '#f44336' },
    warning: { main: '#FFD700' },
    divider: 'rgba(255, 255, 255, 0.12)',
};

// Light theme palette
const lightPalette = {
    mode: 'light',
    primary: {
        main: '#2E7D32',
        light: '#4CAF50',
        dark: '#1B5E20',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#F9A825',
        light: '#FFD54F',
        dark: '#F57F17',
        contrastText: '#000000',
    },
    background: {
        default: '#F5F5F5',
        paper: '#FFFFFF',
    },
    text: {
        primary: '#212121',
        secondary: 'rgba(0, 0, 0, 0.6)',
    },
    success: { main: '#2E7D32' },
    error: { main: '#D32F2F' },
    warning: { main: '#F9A825' },
    divider: 'rgba(0, 0, 0, 0.12)',
};

// Component overrides for dark mode
const darkComponents = {
    MuiButton: {
        styleOverrides: {
            root: { borderRadius: 24, padding: '10px 24px' },
            contained: {
                boxShadow: 'none',
                '&:hover': { boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)' },
            },
            outlined: { borderWidth: 2, '&:hover': { borderWidth: 2 } },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: { backgroundImage: 'none', borderRadius: 16 },
        },
    },
    MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiTextField: {
        styleOverrides: {
            root: { '& .MuiOutlinedInput-root': { borderRadius: 12 } },
        },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                backgroundColor: '#1E1E1E',
                borderRight: '1px solid rgba(255, 255, 255, 0.12)',
            },
        },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: '#1E1E1E',
                backgroundImage: 'none',
                color: '#ffffff',
            },
        },
    },
    MuiChip: {
        styleOverrides: { root: { borderRadius: 8 } },
    },
};

// Component overrides for light mode
const lightComponents = {
    MuiButton: {
        styleOverrides: {
            root: { borderRadius: 24, padding: '10px 24px' },
            contained: {
                boxShadow: 'none',
                '&:hover': { boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)' },
            },
            outlined: { borderWidth: 2, '&:hover': { borderWidth: 2 } },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: { backgroundImage: 'none', borderRadius: 16 },
        },
    },
    MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiTextField: {
        styleOverrides: {
            root: { '& .MuiOutlinedInput-root': { borderRadius: 12 } },
        },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                backgroundColor: '#FFFFFF',
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            },
        },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                backgroundColor: '#FFFFFF',
                backgroundImage: 'none',
                color: '#212121',
            },
        },
    },
    MuiChip: {
        styleOverrides: { root: { borderRadius: 8 } },
    },
};

// Create theme based on mode
export function createAppTheme(mode) {
    const isDark = mode === 'dark';
    
    return createTheme({
        ...sharedSettings,
        palette: isDark ? darkPalette : lightPalette,
        components: isDark ? darkComponents : lightComponents,
    });
}

// Default export for backwards compatibility
export const theme = createAppTheme('dark');
