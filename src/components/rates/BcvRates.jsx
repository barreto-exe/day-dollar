import {
    Box,
    Card,
    CardContent,
    Typography,
    Divider,
    CircularProgress,
    Collapse,
    IconButton,
    Button,
    Alert,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs from 'dayjs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import HistoryIcon from '@mui/icons-material/History';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useRates } from '../../contexts/RatesContext';
import RateRow from './RateRow';
import ShareButton from '../common/ShareButton';
import { formatDate, formatNumber } from '../../utils/formatters';

export default function BcvRates() {
    const { t, i18n } = useTranslation();
    const { bcvRates, allRates, loading, selectedDate, fetchBcvRatesByDate, clearSelectedDate } = useRates();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [showOther, setShowOther] = useState(false);
    const [datePickerOpen, setDatePickerOpen] = useState(false);
    const datePickerAnchorRef = useRef(null);

    // Handle date picker change (receives dayjs object from MUI DatePicker)
    const handleDateChange = async (newValue) => {
        if (newValue && newValue.isValid()) {
            const date = newValue.toDate();
            await fetchBcvRatesByDate(date);
        }
    };

    // Handle return to current date
    const handleReturnToCurrentDate = async () => {
        await clearSelectedDate();
    };

    const isCustomDate = selectedDate !== null;

    if (loading && !bcvRates) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!bcvRates) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="error">{t('common.error')}</Typography>
            </Box>
        );
    }

    const mainRates = allRates.filter((r) => r.isMain);
    const otherRates = allRates.filter((r) => !r.isMain);
    // Determine valid date to display based on whether we are showing future or current rates
    let displayDate;
    if (selectedDate) {
        displayDate = selectedDate;
    } else {
        const isFuture = bcvRates.dateBcvFees > new Date().setHours(0, 0, 0, 0);
        displayDate = isFuture ? bcvRates.createdAt : bcvRates.dateBcvFees;
    }

    const valueDate = formatDate(displayDate, i18n.language === 'en' ? 'en-US' : 'es-VE');

    // Build share text
    const getShareText = () => {
        let text = `Tasas BCV - ${valueDate}\n\n`;
        allRates.forEach((rate) => {
            text += `${rate.code}: ${formatNumber(rate.baseValue, 4)} Bs.\n`;
        });
        return text;
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Title Card */}
            <Card
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <CardContent sx={{ py: 2, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {t('rates.title')}
                    </Typography>
                </CardContent>
            </Card>

            {/* Main Rates */}
            <Card
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    {mainRates.map((rate, index) => (
                        <Box key={rate.code}>
                            <RateRow
                                name={t(`currencies.${rate.code}`)}
                                value={rate.baseValue}
                                change={rate.changePercent}
                                isDown={rate.isDown}
                                symbol="Bs"
                                isMain
                            />
                            {index < mainRates.length - 1 && <Divider />}
                        </Box>
                    ))}

                    {/* Expand button for other rates */}
                    {otherRates.length > 0 && (
                        <>
                            <Divider />
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    py: 1,
                                }}
                            >
                                <IconButton
                                    onClick={() => setShowOther(!showOther)}
                                    size="small"
                                >
                                    {showOther ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </Box>

                            <Collapse in={showOther}>
                                {otherRates.map((rate, index) => (
                                    <Box key={rate.code}>
                                        <RateRow
                                            name={rate.code}
                                            value={rate.baseValue}
                                            change={rate.changePercent}
                                            isDown={rate.isDown}
                                            symbol="Bs"
                                        />
                                        {index < otherRates.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </Collapse>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Value Date */}
            <Card
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: isCustomDate ? 'warning.main' : 'divider',
                }}
            >
                <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                {t('calc.valueDate')}:
                            </Typography>
                            <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                                {valueDate}
                            </Typography>
                        </Box>
                        {/* Date Picker */}
                        <IconButton
                            ref={datePickerAnchorRef}
                            size="small"
                            onClick={() => setDatePickerOpen(true)}
                            sx={{ color: 'text.secondary' }}
                        >
                            <CalendarTodayIcon />
                        </IconButton>
                        {isMobile ? (
                            <MobileDatePicker
                                open={datePickerOpen}
                                onClose={() => setDatePickerOpen(false)}
                                value={selectedDate ? dayjs(selectedDate) : null}
                                onChange={handleDateChange}
                                slotProps={{
                                    textField: { sx: { display: 'none' } },
                                }}
                            />
                        ) : (
                            <DesktopDatePicker
                                open={datePickerOpen}
                                onClose={() => setDatePickerOpen(false)}
                                value={selectedDate ? dayjs(selectedDate) : null}
                                onChange={handleDateChange}
                                slotProps={{
                                    textField: { sx: { display: 'none' } },
                                    popper: {
                                        anchorEl: datePickerAnchorRef.current,
                                        placement: 'bottom-end',
                                    },
                                }}
                            />
                        )}
                    </Box>

                    {/* Return to current date button */}
                    {isCustomDate && (
                        <Box sx={{ mt: 1.5 }}>
                            <Button
                                variant="text"
                                color="inherit"
                                size="small"
                                startIcon={<HistoryIcon />}
                                onClick={handleReturnToCurrentDate}
                                sx={{
                                    p: 0,
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    color: 'text.secondary',
                                }}
                            >
                                {t('nextRate.backToCurrentRate')}
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Warning Alert when viewing historical date */}
            {isCustomDate && (
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
                    {t('nextRate.historicalWarning')}
                </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <ShareButton
                    title="Tasas BCV - Day Dollar"
                    text={getShareText()}
                    fullWidth
                />
            </Box>

            {/* Disclaimer */}
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textAlign: 'center', px: 2 }}
            >
                La "fecha de valor" indica el día desde el cual entra en vigencia el valor oficial de la moneda, según lo publicado en el sitio oficial del Banco Central de Venezuela (https://www.bcv.org.ve/).
            </Typography>
        </Box>
    );
}
