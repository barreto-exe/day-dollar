import { createContext, useContext, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const PreferencesContext = createContext(null);

// Available rate types
export const RATE_TYPES = {
    USD_BCV: 'USD_BCV',
    EUR_BCV: 'EUR_BCV',
    USDT: 'USDT',
    CNY_BCV: 'CNY_BCV',
    TRY_BCV: 'TRY_BCV',
    RUB_BCV: 'RUB_BCV',
    COP_BCV: 'COP_BCV',
    BRL_BCV: 'BRL_BCV',
};

// Rate type display info
export const RATE_INFO = {
    [RATE_TYPES.USD_BCV]: {
        code: 'USD',
        label: 'Dólar BCV',
        labelEn: 'Dollar BCV',
        symbol: '$',
        quickAmounts: [1, 5, 10, 20, 50, 100],
    },
    [RATE_TYPES.EUR_BCV]: {
        code: 'EUR',
        label: 'Euro BCV',
        labelEn: 'Euro BCV',
        symbol: '€',
        quickAmounts: [1, 5, 10, 20, 50, 100],
    },
    [RATE_TYPES.USDT]: {
        code: 'USDT',
        label: 'USDT (Binance P2P)',
        labelEn: 'USDT (Binance P2P)',
        symbol: '₮',
        quickAmounts: [1, 5, 10, 20, 50, 100],
    },
    [RATE_TYPES.CNY_BCV]: {
        code: 'CNY',
        label: 'Yuan BCV',
        labelEn: 'Yuan BCV',
        symbol: '¥',
        quickAmounts: [10, 50, 100, 500, 1000],
    },
    [RATE_TYPES.TRY_BCV]: {
        code: 'TRY',
        label: 'Lira BCV',
        labelEn: 'Lira BCV',
        symbol: '₺',
        quickAmounts: [10, 50, 100, 500, 1000],
    },
    [RATE_TYPES.RUB_BCV]: {
        code: 'RUB',
        label: 'Rublo BCV',
        labelEn: 'Ruble BCV',
        symbol: '₽',
        quickAmounts: [100, 500, 1000, 5000, 10000],
    },
    [RATE_TYPES.COP_BCV]: {
        code: 'COP',
        label: 'Peso Colombiano BCV',
        labelEn: 'Colombian Peso BCV',
        symbol: '$',
        quickAmounts: [5000, 10000, 20000, 50000, 100000],
    },
    [RATE_TYPES.BRL_BCV]: {
        code: 'BRL',
        label: 'Real BCV',
        labelEn: 'Real BCV',
        symbol: 'R$',
        quickAmounts: [10, 50, 100, 500, 1000],
    },
};

const STORAGE_KEY = 'dayDollar_preferences';

const DEFAULT_PREFERENCES = {
    favoriteRate: RATE_TYPES.USD_BCV,
    language: 'auto',
    useNextRate: false,
};

export function PreferencesProvider({ children }) {
    const [preferences, setPreferences] = useLocalStorage(STORAGE_KEY, DEFAULT_PREFERENCES);

    const updatePreference = (key, value) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    // Derived sessionPrefs for backward compatibility
    const sessionPrefs = useMemo(() => ({
        useNextRate: preferences.useNextRate,
    }), [preferences.useNextRate]);

    const value = useMemo(
        () => ({
            preferences,
            sessionPrefs,
            updatePreference,
            setFavoriteRate: (rate) => updatePreference('favoriteRate', rate),
            setLanguage: (lang) => updatePreference('language', lang),
            setUseNextRate: (useNext) => updatePreference('useNextRate', useNext),
        }),
        [preferences, sessionPrefs]
    );

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
}

export function usePreferences() {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
}

export default PreferencesContext;
