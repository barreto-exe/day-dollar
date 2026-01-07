import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getCountryConversions, getBinanceP2PAverages } from '../api/graphql';

const RatesContext = createContext(null);

export function RatesProvider({ children }) {
    const [bcvRates, setBcvRates] = useState(null);
    const [usdtRates, setUsdtRates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchBcvRates = useCallback(async () => {
        try {
            const data = await getCountryConversions('VE');
            setBcvRates(data);
            setLastUpdated(new Date());
            return data;
        } catch (err) {
            console.error('Error fetching BCV rates:', err);
            setError(err.message);
            throw err;
        }
    }, []);

    const fetchUsdtRates = useCallback(async () => {
        try {
            const data = await getBinanceP2PAverages();
            setUsdtRates(data);
            return data;
        } catch (err) {
            console.error('Error fetching USDT rates:', err);
            setError(err.message);
            throw err;
        }
    }, []);

    const fetchAllRates = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([fetchBcvRates(), fetchUsdtRates()]);
        } catch (err) {
            // Error already set in individual fetch functions
        } finally {
            setLoading(false);
        }
    }, [fetchBcvRates, fetchUsdtRates]);

    // Initial fetch
    useEffect(() => {
        fetchAllRates();
    }, [fetchAllRates]);

    // Auto-refresh USDT rates every hour
    useEffect(() => {
        const now = new Date();
        const msUntilNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;

        // Set timeout for next hour
        const timeout = setTimeout(() => {
            fetchUsdtRates();

            // Then set interval for every hour
            const interval = setInterval(fetchUsdtRates, 60 * 60 * 1000);
            return () => clearInterval(interval);
        }, msUntilNextHour);

        return () => clearTimeout(timeout);
    }, [fetchUsdtRates]);

    // Get rate by currency code
    const getRateByCode = useCallback((code) => {
        if (!bcvRates?.conversionRates) return null;

        // For USDT, return Binance P2P average
        if (code === 'USDT') {
            if (!usdtRates) return null;
            return {
                code: 'USDT',
                baseValue: (usdtRates.buyAverage + usdtRates.sellAverage) / 2,
                symbol: '₮',
                changePercent: usdtRates.totalChangePct,
                isDown: usdtRates.totalChangePct < 0,
            };
        }

        // Find in BCV rates - look for SECONDARY type first (official rate)
        const rate = bcvRates.conversionRates.find(
            (r) => r.rateCurrency.code === code && r.type === 'SECONDARY'
        ) || bcvRates.conversionRates.find(
            (r) => r.rateCurrency.code === code && r.type === 'OTHER'
        );

        if (!rate) return null;

        return {
            code: rate.rateCurrency.code,
            baseValue: rate.baseValue,
            symbol: rate.rateCurrency.symbol,
            changePercent: rate.increaseDecreasePercentBase?.percentValue || 0,
            isDown: rate.increaseDecreasePercentBase?.isDown || false,
            lastBaseValue: rate.lastBaseValue,
        };
    }, [bcvRates, usdtRates]);

    // Get all available rates for display
    const allRates = useMemo(() => {
        if (!bcvRates?.conversionRates) return [];

        const rates = [];

        // Add main currencies (USD, EUR)
        const mainCurrencies = ['USD', 'EUR'];
        mainCurrencies.forEach((code) => {
            const rate = getRateByCode(code);
            if (rate) {
                rates.push({
                    ...rate,
                    isMain: true,
                });
            }
        });

        // Add other currencies (CNY, TRY, RUB)
        const otherCurrencies = ['CNY', 'TRY', 'RUB'];
        otherCurrencies.forEach((code) => {
            const rate = getRateByCode(code);
            if (rate) {
                rates.push({
                    ...rate,
                    isMain: false,
                });
            }
        });

        return rates;
    }, [bcvRates, getRateByCode]);

    const value = useMemo(
        () => ({
            bcvRates,
            usdtRates,
            loading,
            error,
            lastUpdated,
            fetchAllRates,
            fetchBcvRates,
            fetchUsdtRates,
            getRateByCode,
            allRates,
        }),
        [bcvRates, usdtRates, loading, error, lastUpdated, fetchAllRates, fetchBcvRates, fetchUsdtRates, getRateByCode, allRates]
    );

    return (
        <RatesContext.Provider value={value}>
            {children}
        </RatesContext.Provider>
    );
}

export function useRates() {
    const context = useContext(RatesContext);
    if (!context) {
        throw new Error('useRates must be used within a RatesProvider');
    }
    return context;
}

export default RatesContext;
