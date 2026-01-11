import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    CircularProgress,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Alert,
    TextField,
    IconButton,
} from '@mui/material';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import HistoryIcon from '@mui/icons-material/History';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
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
    const { bcvRates, usdtRates, loading, getRateByCode, getNextRateByCode, selectedDate, fetchBcvRatesByDate, clearSelectedDate } = useRates();
    const { preferences, sessionPrefs, setUseNextRate } = usePreferences();

    const [selectedRate, setSelectedRate] = useState(preferences.favoriteRate);
    const [foreignAmount, setForeignAmount] = useState('');
    const [bsAmount, setBsAmount] = useState('');
    const [activeInput, setActiveInput] = useState(null);
    const [showNextRateModal, setShowNextRateModal] = useState(false);
    const dateInputRef = useRef(null);

    // Handle click on calendar icon to open date picker
    const handleCalendarClick = () => {
        if (dateInputRef.current) {
            // Try showPicker first (modern browsers), fallback to click
            if (dateInputRef.current.showPicker) {
                dateInputRef.current.showPicker();
            } else {
                dateInputRef.current.click();
            }
        }
    };

    // Check if selected rate is a BCV rate (not USDT)
    const isBcvRate = selectedRate !== RATE_TYPES.USDT;
    const useNextRate = sessionPrefs.useNextRate && isBcvRate;

    // Get current rate info based on useNextRate toggle
    const rateInfo = RATE_INFO[selectedRate];
    const currentRate = useNextRate
        ? getNextRateByCode(rateInfo?.code)
        : getRateByCode(rateInfo?.code);
    const nextRate = isBcvRate ? getNextRateByCode(rateInfo?.code) : null;

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

    // Get value date based on useNextRate toggle
    const getValueDate = () => {
        if (selectedRate === RATE_TYPES.USDT && usdtRates) {
            return formatDate(usdtRates.createdAt, i18n.language === 'en' ? 'en-US' : 'es-VE');
        }
        // Use dateBcvFees for next rate date, createdAt for current
        if (useNextRate && bcvRates?.dateBcvFees) {
            return formatDate(bcvRates.dateBcvFees, i18n.language === 'en' ? 'en-US' : 'es-VE');
        }
        // Use createdAt instead of dateBcv since dateBcv is not updating correctly
        if (bcvRates?.createdAt) {
            return formatDate(bcvRates.createdAt, i18n.language === 'en' ? 'en-US' : 'es-VE');
        }
        return '';
    };

    // Get next value date for display
    const getNextValueDate = () => {
        if (bcvRates?.dateBcvFees) {
            return formatDate(bcvRates.dateBcvFees, i18n.language === 'en' ? 'en-US' : 'es-VE');
        }
        return '';
    };

    // Handle next rate button click - show modal first
    const handleNextRateClick = () => {
        setShowNextRateModal(true);
    };

    // Confirm using next rate
    const handleConfirmNextRate = () => {
        setUseNextRate(true);
        setShowNextRateModal(false);
    };

    // Return to current rate/date
    const handleReturnToCurrentRate = async () => {
        setUseNextRate(false);
        if (selectedDate) {
            await clearSelectedDate();
        }
    };

    // Handle date picker change
    const handleDateChange = async (event) => {
        const dateValue = event.target.value;
        if (dateValue) {
            const date = new Date(dateValue + 'T12:00:00');
            await fetchBcvRatesByDate(date);
            setUseNextRate(false); // Reset next rate when selecting a specific date
        }
    };

    // Check if viewing historical or future rate
    const isHistoricalDate = selectedDate && selectedDate < new Date();
    const isCustomDate = selectedDate !== null;

    if (loading && !bcvRates) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Value Date Card */}
            <Card
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: (useNextRate || isCustomDate) ? 'warning.main' : 'divider',
                }}
            >
                <CardContent sx={{ py: 2 }}>
                    {/* Current/Next/Selected Date Display */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography
                            variant="body1"
                            sx={{ textTransform: 'capitalize' }}
                        >
                            {getValueDate()}
                        </Typography>

                        {/* Date Picker for BCV rates */}
                        {isBcvRate && (
                            <Box sx={{ position: 'relative' }}>
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    onChange={handleDateChange}
                                    style={{
                                        position: 'absolute',
                                        opacity: 0,
                                        width: 0,
                                        height: 0,
                                        pointerEvents: 'none',
                                    }}
                                />
                                <IconButton
                                    size="small"
                                    onClick={handleCalendarClick}
                                    sx={{ color: 'text.secondary' }}
                                >
                                    <CalendarTodayIcon />
                                </IconButton>
                            </Box>
                        )}
                        {!isBcvRate && (
                            <CalendarTodayIcon sx={{ color: 'text.secondary' }} />
                        )}
                    </Box>

                    {/* Next Rate Button, Return Button, or Date Picker Actions */}
                    {isBcvRate && (
                        <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {/* Show return button if using next rate OR custom date */}
                            {(useNextRate || isCustomDate) ? (
                                <Button
                                    variant="text"
                                    color="inherit"
                                    size="small"
                                    startIcon={<HistoryIcon />}
                                    onClick={handleReturnToCurrentRate}
                                    sx={{
                                        p: 0,
                                        textTransform: 'none',
                                        fontWeight: 500,
                                        color: 'text.secondary',
                                        justifyContent: 'flex-start',
                                    }}
                                >
                                    {t('nextRate.backToCurrentRate')}
                                </Button>
                            ) : (
                                /* Show next rate button only for USD and when not viewing custom date */
                                nextRate && selectedRate === RATE_TYPES.USD_BCV && (
                                    <Button
                                        variant="text"
                                        color="warning"
                                        size="small"
                                        startIcon={<EventIcon />}
                                        onClick={handleNextRateClick}
                                        sx={{
                                            p: 0,
                                            textTransform: 'none',
                                            fontWeight: 500,
                                            justifyContent: 'flex-start',
                                        }}
                                    >
                                        {t('nextRate.button')}
                                    </Button>
                                )
                            )}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Warning Alert when using next rate or historical date */}
            {(useNextRate || isCustomDate) && (
                <Alert
                    severity="warning"
                    icon={<WarningAmberIcon />}
                    sx={{
                        borderRadius: 2,
                        '& .MuiAlert-message': {
                            fontSize: '0.875rem',
                        }
                    }}
                >
                    {useNextRate ? t('nextRate.warning') : t('nextRate.historicalWarning')}
                </Alert>
            )}

            {/* Main Calculator Card */}
            <Card
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

                    {/* Exchange Rate Display - moved below dropdown */}
                    {currentRate && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: 'center', mt: 1.5 }}
                        >
                            1 {rateInfo?.code} = {formatNumber(currentRate.baseValue, 4)} Bs.
                        </Typography>
                    )}

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

                    {/* Equivalence Display - always reserve space to prevent layout shift */}
                    <Box
                        sx={{
                            mt: 2,
                            py: 1,
                            px: 2,
                            minHeight: 40,
                            bgcolor: rateComparison?.hasEquivalent
                                ? (rateComparison.usdtEquivalent ? 'rgba(255, 215, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)')
                                : 'transparent',
                            borderRadius: 2,
                            textAlign: 'center',
                            visibility: rateComparison?.hasEquivalent ? 'visible' : 'hidden',
                        }}
                    >
                        {rateComparison?.usdtEquivalent > 0 && (
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
                        {rateComparison?.bcvEquivalent > 0 && (
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

                    {/* Action Buttons - excluded from screenshot */}
                    <Box
                        sx={{
                            mt: 3,
                            display: 'flex',
                            gap: 2,
                            justifyContent: 'center',
                        }}
                        data-exclude-from-screenshot="true"
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
                            screenshotData={{
                                selectedRate,
                                rateInfo,
                                currentRate,
                                foreignAmount,
                                bsAmount,
                                rateComparison,
                            }}
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

            {/* Next Rate Confirmation Modal */}
            <Dialog
                open={showNextRateModal}
                onClose={() => setShowNextRateModal(false)}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1,
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {t('nextRate.modalTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('nextRate.modalDescription')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, flexDirection: 'column', gap: 1 }}>
                    <Button
                        onClick={handleConfirmNextRate}
                        variant="contained"
                        color="warning"
                        fullWidth
                        sx={{ fontWeight: 600 }}
                    >
                        {t('nextRate.useNextRate')}
                    </Button>
                    <Button
                        onClick={() => setShowNextRateModal(false)}
                        variant="outlined"
                        color="inherit"
                        fullWidth
                    >
                        {t('nextRate.continueWithCurrent')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
