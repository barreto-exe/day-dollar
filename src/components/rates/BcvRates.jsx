import {
    Box,
    Card,
    CardContent,
    Typography,
    Divider,
    CircularProgress,
    Collapse,
    IconButton,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRates } from '../../contexts/RatesContext';
import RateRow from './RateRow';
import ShareButton from '../common/ShareButton';
import { formatDate, formatNumber } from '../../utils/formatters';

export default function BcvRates() {
    const { t, i18n } = useTranslation();
    const { bcvRates, allRates, loading } = useRates();
    const [showOther, setShowOther] = useState(false);

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
    const valueDate = formatDate(bcvRates.dateBcv, i18n.language === 'en' ? 'en-US' : 'es-VE');

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
                    borderColor: 'divider',
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
                        <CalendarTodayIcon sx={{ color: 'text.secondary' }} />
                    </Box>
                </CardContent>
            </Card>

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
