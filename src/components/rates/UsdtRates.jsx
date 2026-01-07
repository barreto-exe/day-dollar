import {
    Box,
    Card,
    CardContent,
    Typography,
    Divider,
    CircularProgress,
    Alert,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from 'react-i18next';
import { useRates } from '../../contexts/RatesContext';
import { useCountdown } from '../../hooks/useCountdown';
import RateRow from './RateRow';
import ShareButton from '../common/ShareButton';
import { formatNumber, formatDateTime } from '../../utils/formatters';

export default function UsdtRates() {
    const { t, i18n } = useTranslation();
    const { usdtRates, loading, fetchUsdtRates } = useRates();
    const { formattedTime, isExpired } = useCountdown();

    // Refresh when countdown expires
    if (isExpired) {
        fetchUsdtRates();
    }

    if (loading && !usdtRates) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (!usdtRates) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="error">{t('common.error')}</Typography>
            </Box>
        );
    }

    const average = (usdtRates.buyAverage + usdtRates.sellAverage) / 2;
    const { date, time } = formatDateTime(
        usdtRates.createdAt,
        i18n.language === 'en' ? 'en-US' : 'es-VE'
    );

    // Build share text
    const getShareText = () => {
        return `Tasas USDT (Binance P2P)\n\nPromedio: ${formatNumber(average, 2)} Bs.\nCompra: ${formatNumber(usdtRates.buyAverage, 2)} Bs.\nVenta: ${formatNumber(usdtRates.sellAverage, 2)} Bs.\n\nActualizado: ${date} ${time}`;
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
                        {t('usdt.title')}
                    </Typography>
                </CardContent>
            </Card>

            {/* USDT Rates */}
            <Card
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <CardContent sx={{ p: 0 }}>
                    {/* Average */}
                    <RateRow
                        name={t('rates.average')}
                        value={average}
                        change={usdtRates.totalChangePct}
                        isDown={usdtRates.totalChangePct < 0}
                        symbol="Bs"
                        isMain
                    />

                    <Divider />

                    {/* Buy/Sell */}
                    <Box sx={{ px: 3, py: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography color="text.secondary">{t('rates.buy')}</Typography>
                            <Typography fontWeight={500}>
                                {formatNumber(usdtRates.buyAverage, 2)} Bs
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography color="text.secondary">{t('rates.sell')}</Typography>
                            <Typography fontWeight={500}>
                                {formatNumber(usdtRates.sellAverage, 2)} Bs
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Date/Time and Countdown */}
            <Card
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="body1">{date}</Typography>
                        <Typography variant="body1">{time}</Typography>
                    </Box>

                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            color: 'primary.main',
                        }}
                    >
                        <AccessTimeIcon fontSize="small" />
                        <Typography variant="body2">
                            {t('rates.nextUpdate')}: {formattedTime} min
                        </Typography>
                    </Box>
                </CardContent>
            </Card>

            {/* Share Button */}
            <ShareButton
                title="Tasas USDT - Day Dollar"
                text={getShareText()}
                fullWidth
            />

            {/* Warning */}
            <Alert
                severity="warning"
                icon={<WarningAmberIcon />}
                sx={{
                    bgcolor: 'rgba(255, 215, 0, 0.1)',
                    border: '1px solid',
                    borderColor: 'warning.main',
                    '& .MuiAlert-icon': {
                        color: 'warning.main',
                    },
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {t('usdt.warning')}
                </Typography>
            </Alert>

            {/* Disclaimer */}
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ px: 2 }}
            >
                {t('usdt.disclaimer')}
            </Typography>
        </Box>
    );
}
