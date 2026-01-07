import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Divider,
    CircularProgress,
    Chip,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import { useTranslation } from 'react-i18next';
import { useRates } from '../../contexts/RatesContext';
import { usePreferences, RATE_TYPES, RATE_INFO } from '../../contexts/PreferencesContext';
import RateSelector from './RateSelector';
import ConversionInput from './ConversionInput';
import QuickAmounts from './QuickAmounts';
import ScreenshotShareButton from '../common/ScreenshotShareButton';
import { formatNumber, formatDate, calculateConversion } from '../../utils/formatters';

export default function Calculator() {
    const { t, i18n } = useTranslation();
    const { bcvRates, usdtRates, loading, getRateByCode } = useRates();
    const { preferences } = usePreferences();
    const calculatorRef = useRef(null);

    const [selectedRate, setSelectedRate] = useState(preferences.favoriteRate);
    const [foreignAmount, setForeignAmount] = useState('');
    const [bsAmount, setBsAmount] = useState('');
    const [activeInput, setActiveInput] = useState(null);

    // Get current rate info
    const rateInfo = RATE_INFO[selectedRate];
    const currentRate = getRateByCode(rateInfo?.code);

    // Calculate gap between selected rate and USDT (or BCV if USDT is selected)
    const rateComparison = useMemo(() => {
        if (!usdtRates) return null;

        const usdtAverage = (usdtRates.buyAverage + usdtRates.sellAverage) / 2;

        // When USDT is selected, show gap vs BCV USD and BCV equivalent
        if (selectedRate === RATE_TYPES.USDT) {
            const usdBcvRate = getRateByCode('USD');
            if (!usdBcvRate) return null;

            const bcvRate = usdBcvRate.baseValue;
            if (bcvRate === 0) return null;

            const gapPercent = ((usdtAverage - bcvRate) / bcvRate) * 100;

            // Calculate BCV USD equivalent for current Bs amount
            const bsValue = parseFloat(bsAmount) || 0;
            const bcvEquivalent = bsValue > 0 ? bsValue / bcvRate : 0;

            return {
                type: 'usdt-vs-bcv',
                label: t('calc.bcvEquivalent'),
                primaryLabel: 'USDT',
                primaryRate: usdtAverage,
                secondaryLabel: 'Dólar BCV',
                secondaryRate: bcvRate,
                percent: gapPercent,
                isPositive: gapPercent > 0,
                bcvEquivalent: bcvEquivalent,
                hasEquivalent: bsValue > 0,
            };
        }

        // When USD BCV or EUR BCV is selected, show USDT equivalent
        if (selectedRate === RATE_TYPES.USD_BCV || selectedRate === RATE_TYPES.EUR_BCV) {
            const currentBcvRate = currentRate?.baseValue;
            if (!currentBcvRate || currentBcvRate === 0) return null;

            // For USD BCV, compare directly with USDT
            if (selectedRate === RATE_TYPES.USD_BCV) {
                const gapPercent = ((usdtAverage - currentBcvRate) / currentBcvRate) * 100;

                // Calculate USDT equivalent for current Bs amount
                const bsValue = parseFloat(bsAmount) || 0;
                const usdtEquivalent = bsValue > 0 ? bsValue / usdtAverage : 0;

                return {
                    type: 'bcv-vs-usdt',
                    label: t('calc.usdtEquivalent'),
                    primaryLabel: 'USDT',
                    primaryRate: usdtAverage,
                    secondaryLabel: 'Dólar BCV',
                    secondaryRate: currentBcvRate,
                    percent: gapPercent,
                    isPositive: gapPercent > 0,
                    usdtEquivalent: usdtEquivalent,
                    hasEquivalent: bsValue > 0,
                };
            }

            // For EUR BCV, show the USDT rate and gap
            if (selectedRate === RATE_TYPES.EUR_BCV) {
                // Get USD BCV rate to compare with USDT
                const usdBcvRate = getRateByCode('USD');
                if (!usdBcvRate) return null;

                const gapPercent = ((usdtAverage - usdBcvRate.baseValue) / usdBcvRate.baseValue) * 100;

                // Calculate USDT equivalent for current Bs amount
                const bsValue = parseFloat(bsAmount) || 0;
                const usdtEquivalent = bsValue > 0 ? bsValue / usdtAverage : 0;

                return {
                    type: 'bcv-vs-usdt',
                    label: t('calc.usdtEquivalent'),
                    primaryLabel: 'USDT',
                    primaryRate: usdtAverage,
                    secondaryLabel: 'Dólar BCV',
                    secondaryRate: usdBcvRate.baseValue,
                    percent: gapPercent,
                    isPositive: gapPercent > 0,
                    usdtEquivalent: usdtEquivalent,
                    hasEquivalent: bsValue > 0,
                };
            }
        }

        return null;
    }, [selectedRate, usdtRates, currentRate, bsAmount, getRateByCode, t]);

    // Calculate conversions
    const handleForeignAmountChange = useCallback((value) => {
        setForeignAmount(value);
        setActiveInput('foreign');

        if (currentRate && value) {
            const numValue = parseFloat(value) || 0;
            const converted = calculateConversion(numValue, currentRate.baseValue, 'toBase');
            setBsAmount(converted > 0 ? converted.toFixed(2) : '');
        } else {
            setBsAmount('');
        }
    }, [currentRate]);

    const handleBsAmountChange = useCallback((value) => {
        setBsAmount(value);
        setActiveInput('bs');

        if (currentRate && value) {
            const numValue = parseFloat(value) || 0;
            const converted = calculateConversion(numValue, currentRate.baseValue, 'fromBase');
            setForeignAmount(converted > 0 ? converted.toFixed(2) : '');
        } else {
            setForeignAmount('');
        }
    }, [currentRate]);

    // Update calculation when rate changes
    useEffect(() => {
        if (activeInput === 'foreign' && foreignAmount) {
            handleForeignAmountChange(foreignAmount);
        } else if (activeInput === 'bs' && bsAmount) {
            handleBsAmountChange(bsAmount);
        }
    }, [selectedRate, currentRate]);

    const handleReset = () => {
        setForeignAmount('');
        setBsAmount('');
        setActiveInput(null);
    };

    const handleQuickAmount = (amount) => {
        const currentValue = parseFloat(foreignAmount) || 0;
        const newValue = currentValue + amount;
        handleForeignAmountChange(newValue.toFixed(2));
    };

    // Get value date
    const getValueDate = () => {
        if (selectedRate === RATE_TYPES.USDT && usdtRates) {
            return formatDate(usdtRates.createdAt, i18n.language === 'en' ? 'en-US' : 'es-VE');
        }
        if (bcvRates?.dateBcv) {
            return formatDate(bcvRates.dateBcv, i18n.language === 'en' ? 'en-US' : 'es-VE');
        }
        return '';
    };

    if (loading && !bcvRates) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Main Calculator Card - This is what gets captured for screenshot */}
            <Card
                ref={calculatorRef}
                data-screenshot="true"
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    minWidth: 320,
                    overflow: 'visible',
                }}
            >
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    {/* Rate Selector */}
                    <RateSelector
                        selectedRate={selectedRate}
                        onChange={setSelectedRate}
                    />

                    {/* Conversion Inputs */}
                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <ConversionInput
                            label={rateInfo?.symbol || '$'}
                            value={foreignAmount}
                            onChange={handleForeignAmountChange}
                            currencyCode={rateInfo?.code || 'USD'}
                        />

                        <ConversionInput
                            label="Bs"
                            value={bsAmount}
                            onChange={handleBsAmountChange}
                            currencyCode="VEF"
                        />
                    </Box>

                    {/* Rate Display inside card for screenshot */}
                    {currentRate && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: 'center', mt: 2 }}
                        >
                            1 {rateInfo?.code} = {formatNumber(currentRate.baseValue, 4)} Bs.
                        </Typography>
                    )}

                    {/* Equivalence Display inside card for screenshot */}
                    {rateComparison && rateComparison.hasEquivalent && (
                        <Box
                            sx={{
                                mt: 1,
                                py: 1,
                                px: 2,
                                bgcolor: rateComparison.usdtEquivalent ? 'rgba(255, 215, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                                borderRadius: 2,
                                textAlign: 'center',
                            }}
                        >
                            {rateComparison.usdtEquivalent > 0 && (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'warning.main',
                                    }}
                                >
                                    ≈ ₮{formatNumber(rateComparison.usdtEquivalent, 2)} USDT
                                </Typography>
                            )}
                            {rateComparison.bcvEquivalent > 0 && (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        fontWeight: 600,
                                        color: 'primary.main',
                                    }}
                                >
                                    ≈ ${formatNumber(rateComparison.bcvEquivalent, 2)} Dólar BCV
                                </Typography>
                            )}
                        </Box>
                    )}

                    {/* Action Buttons */}
                    <Box
                        sx={{
                            mt: 3,
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                        }}
                    >
                        <Button
                            variant="text"
                            color="inherit"
                            startIcon={<RestartAltIcon />}
                            onClick={handleReset}
                            sx={{ color: 'text.secondary' }}
                        >
                            {t('calc.reset')}
                        </Button>

                        <ScreenshotShareButton
                            targetRef={calculatorRef}
                            title="Day Dollar"
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Quick Amounts */}
            <QuickAmounts
                amounts={rateInfo?.quickAmounts || [5, 10, 20, 50, 100]}
                symbol={rateInfo?.symbol || '$'}
                onSelect={handleQuickAmount}
            />

            {/* Value Date Card */}
            <Card
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography
                            variant="body1"
                            sx={{ textTransform: 'capitalize' }}
                        >
                            {getValueDate()}
                        </Typography>
                        <CalendarTodayIcon sx={{ color: 'text.secondary' }} />
                    </Box>
                </CardContent>
            </Card>

            {/* Rate Comparison Card - Shows USDT gap for all applicable rates */}
            {rateComparison && (
                <Card
                    elevation={0}
                    sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: rateComparison.isPositive ? 'success.main' : 'error.main',
                        background: rateComparison.isPositive
                            ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)'
                            : 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
                    }}
                >
                    <CardContent sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <CurrencyBitcoinIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 600 }}
                                    >
                                        {rateComparison.label}
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {rateComparison.primaryLabel}: {formatNumber(rateComparison.primaryRate, 2)} Bs
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    vs {rateComparison.secondaryLabel}: {formatNumber(rateComparison.secondaryRate, 2)} Bs
                                </Typography>

                                {/* Show USDT equivalent when BCV rate is selected and there's a Bs value */}
                                {rateComparison.hasEquivalent && rateComparison.usdtEquivalent > 0 && (
                                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: 'warning.main',
                                            }}
                                        >
                                            ≈ ₮{formatNumber(rateComparison.usdtEquivalent, 2)} USDT
                                        </Typography>
                                    </Box>
                                )}

                                {/* Show BCV equivalent when USDT is selected and there's a Bs value */}
                                {rateComparison.hasEquivalent && rateComparison.bcvEquivalent > 0 && (
                                    <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 600,
                                                color: 'primary.main',
                                            }}
                                        >
                                            ≈ ${formatNumber(rateComparison.bcvEquivalent, 2)} Dólar BCV
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            <Chip
                                icon={rateComparison.isPositive ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                label={`${rateComparison.isPositive ? '+' : ''}${formatNumber(rateComparison.percent, 2)}%`}
                                color={rateComparison.isPositive ? 'success' : 'error'}
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    py: 2,
                                    '& .MuiChip-icon': {
                                        fontSize: '1.1rem',
                                    },
                                }}
                            />
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}
