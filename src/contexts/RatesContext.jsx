import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getCountryConversions, getBinanceP2PAverages } from '../api/graphql';

const RatesContext = createContext(null);

export function RatesProvider({ children }) {
    const [bcvRates, setBcvRates] = useState(null);
    const [usdtRates, setUsdtRates] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null); // null = today/current

    const fetchBcvRates = useCallback(async () => {
        try {
            const data = await getCountryConversions('VE');
            setBcvRates(data);
            setLastUpdated(new Date());
            setSelectedDate(null); // Reset to current
            return data;
        } catch (err) {
            console.error('Error fetching BCV rates:', err);
            setError(err.message);
            throw err;
        }
    }, []);

    // Fetch rates for a specific date
    const fetchBcvRatesByDate = useCallback(async (date) => {
        setLoading(true);
        setError(null);
        try {
            // Widen search window to find the most recent business day (up to 7 days back)
            // This handles weekends and holidays where the user selects a non-business day
            const searchStartDate = new Date(date);
            searchStartDate.setDate(searchStartDate.getDate() - 7);
            searchStartDate.setHours(0, 0, 0, 0);

            const searchEndDate = new Date(date);
            searchEndDate.setHours(23, 59, 59, 999);

            const dateSearch = {
                startDate: searchStartDate.getTime(),
                endDate: searchEndDate.getTime(),
                filterByField: 'dateBcvFees'
            };

            const data = await getCountryConversions('VE', dateSearch);
            setBcvRates(data);

            // Update selected date to the ACTUAL found date (handling fallback)
            // If data is found, use its dateBcvFees. If not (shouldn't happen with widen search unless very old), keep original
            if (data?.dateBcvFees) {
                setSelectedDate(new Date(data.dateBcvFees));
            } else {
                setSelectedDate(date);
            }

            setLastUpdated(new Date());
            return data;
        } catch (err) {
            console.error('Error fetching BCV rates by date:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Clear selected date and return to current rates
    const clearSelectedDate = useCallback(async () => {
        await fetchBcvRates();
    }, [fetchBcvRates]);

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

    // Get rate by currency code (current rate - SECONDARY for USD, OTHER for others)
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

        // Helper to check if the current BCV data is for a future date (Published today for tomorrow)
        const isFutureDate = () => {
            if (!bcvRates?.dateBcvFees) return false;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return bcvRates.dateBcvFees > today.getTime();
        };

        const isFuture = isFutureDate();
        const isDefaultView = selectedDate === null;

        // If we are in Default View (loading latest) AND it is a Future Date (Next Value Date):
        // We want to show the "Previous" rates (Current Effective) by default.
        // Unless we are explicitly asking for Next Rate (handled by getNextRateByCode logic usually, 
        // but Calculator toggles between getRateByCode and getNextRateByCode).
        // Here we define the "Standard" rate.
        const useEffectiveRate = isDefaultView && isFuture;

        // Find match
        let rate;

        if (useEffectiveRate) {
            // WE WANT CURRENT EFFECTIVE RATE (From the "Previous" perspective of this future doc)

            // For USD: Use SECONDARY (which typically holds the previous/current rate in a Future doc)
            if (code === 'USD') {
                rate = bcvRates.conversionRates.find(
                    (r) => r.rateCurrency.code === code && r.type === 'SECONDARY'
                );
            }

            // For EUR and others: We usually only have OTHER.
            // We must use 'lastBaseValue' to get the previous rate.
            // But we need the 'OTHER' record first.
            if (!rate && code !== 'USD') {
                const otherRate = bcvRates.conversionRates.find(
                    (r) => r.rateCurrency.code === code && r.type === 'OTHER'
                );

                if (otherRate) {
                    // synthesize a rate object using lastBaseValue
                    // Note: This relies on lastBaseValue being populated correctly
                    rate = {
                        ...otherRate,
                        baseValue: otherRate.lastBaseValue || otherRate.baseValue, // Fallback if 0
                        // changePercent might be misleading here since it compares base vs last.
                        // Ideally we'd zero it out or use a different source, but for now keeping as is or 0
                        increaseDecreasePercentBase: { percentValue: 0, isDown: false }
                    };
                }
            }
        }

        // If not found yet (or not using effective/previous logic), find standard OTHER rate
        if (!rate) {
            rate = bcvRates.conversionRates.find(
                (r) => r.rateCurrency.code === code && r.type === 'OTHER'
            );
        }

        // Fallback for USD if OTHER missing (unlikely) -> Try SECONDARY
        if (!rate && code === 'USD') {
            rate = bcvRates.conversionRates.find(
                (r) => r.rateCurrency.code === code && r.type === 'SECONDARY'
            );
        }

        if (!rate) return null;

        return {
            code: rate.rateCurrency.code,
            baseValue: rate.baseValue,
            symbol: rate.rateCurrency.symbol,
            changePercent: rate.increaseDecreasePercentBase?.percentValue || 0,
            isDown: rate.increaseDecreasePercentBase?.isDown || false,
            lastBaseValue: rate.lastBaseValue,
        };
    }, [bcvRates, usdtRates, selectedDate]);

    // Get next rate by currency code (next rate - only for USD which has both SECONDARY and OTHER)
    const getNextRateByCode = useCallback((code) => {
        if (!bcvRates?.conversionRates) return null;

        // Only USD has a "next rate" (SECONDARY is current, OTHER is next)
        // Other currencies only have OTHER so there's no "next" for them
        // Update: Allowing other currencies to check for OTHER type as well
        // if (code !== 'USD') return null;

        // Always find the OTHER type (Next official rate)
        const rate = bcvRates.conversionRates.find(
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
    }, [bcvRates]);

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
            selectedDate,
            fetchAllRates,
            fetchBcvRates,
            fetchBcvRatesByDate,
            clearSelectedDate,
            fetchUsdtRates,
            getRateByCode,
            getNextRateByCode,
            allRates,
        }),
        [bcvRates, usdtRates, loading, error, lastUpdated, selectedDate, fetchAllRates, fetchBcvRates, fetchBcvRatesByDate, clearSelectedDate, fetchUsdtRates, getRateByCode, getNextRateByCode, allRates]
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
