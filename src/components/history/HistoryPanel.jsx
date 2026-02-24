import { useEffect, useMemo, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Divider,
    Chip,
    useTheme,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useTranslation } from 'react-i18next';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from 'recharts';
import { useRates } from '../../contexts/RatesContext';
import { usePreferences } from '../../contexts/PreferencesContext';
import { formatNumber } from '../../utils/formatters';
import { buildUnifiedHistoryData } from '../../utils/history';

const RANGE_OPTIONS = ['24H', '7D', '1M', '3M'];

const DEFAULT_LINE_COLORS = {
    bcvUsd: '#4caf50',
    bcvEur: '#42a5f5',
    usdt: '#26c6da',
};

function formatXAxis(timestamp, range, locale) {
    const date = new Date(timestamp);

    if (range === '24H') {
        return date.toLocaleTimeString(locale, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
    });
}

function formatPointDate(timestamp, range, locale) {
    const date = new Date(timestamp);

    if (range === '24H') {
        return date.toLocaleString(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

    return date.toLocaleDateString(locale, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function CompactTooltip({ active, payload, label, locale, range, activeSeries }) {
    if (!active || !payload?.length) return null;

    const point = payload[0]?.payload;
    if (!point) return null;

    const visibleSeries = activeSeries.filter((series) => point[series.key] != null);
    const showGap = activeSeries.length === 2;
    let gapData = null;

    if (showGap) {
        const [firstSeries, secondSeries] = activeSeries;
        const firstValue = point[firstSeries?.key];
        const secondValue = point[secondSeries?.key];

        if (firstValue != null && secondValue != null && firstValue !== 0) {
            gapData = {
                value: ((secondValue - firstValue) / firstValue) * 100,
            };
        }
    }

    return (
        <Box
            sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                px: 1,
                py: 0.75,
                minWidth: 150,
            }}
        >
            <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                {formatPointDate(label, range, locale)}
            </Typography>
            {visibleSeries.map((series) => (
                <Typography key={series.key} variant="caption" sx={{ display: 'block' }}>
                    {series.label}: {formatNumber(point[series.key], 2)} Bs
                </Typography>
            ))}

            {gapData && (
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        mt: 0.5,
                        color: gapData.value >= 0 ? 'success.main' : 'error.main',
                        fontWeight: 600,
                    }}
                >
                    Brecha: {`${gapData.value >= 0 ? '+' : ''}${formatNumber(gapData.value, 2)}%`}
                </Typography>
            )}
        </Box>
    );
}

export default function HistoryPanel() {
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const { preferences, setHistorySeriesVisibility } = usePreferences();
    const isTouch = useMemo(() => window.matchMedia('(hover: none)').matches, []);

    const {
        bcvHistory,
        usdtHistoryByRange,
        getRateByCode,
        usdtRates,
        historyLoading,
        historyError,
        fetchHistoryData,
    } = useRates();

    const [range, setRange] = useState('3M');
    const [lineColors, setLineColors] = useState(DEFAULT_LINE_COLORS);
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const [lockedPoint, setLockedPoint] = useState(null);

    const historySeriesVisibility = preferences.historySeriesVisibility || {};
    const showUsdBcv = historySeriesVisibility.bcvUsd ?? true;
    const showEurBcv = historySeriesVisibility.bcvEur ?? true;
    const showUsdt = historySeriesVisibility.usdt ?? true;

    useEffect(() => {
        fetchHistoryData(range);
    }, [fetchHistoryData, range]);

    useEffect(() => {
        setHoveredPoint(null);
        setLockedPoint(null);
    }, [range, showUsdBcv, showEurBcv, showUsdt]);

    const historyData = useMemo(() => {
        const usdRate = getRateByCode('USD');
        const eurRate = getRateByCode('EUR');

        const usdtAverage = usdtRates
            ? ((usdtRates.buyAverage + usdtRates.sellAverage) / 2)
            : null;

        const currentSnapshot = {
            timestamp: Date.now(),
            bcvUsd: usdRate?.baseValue ?? null,
            bcvEur: eurRate?.baseValue ?? null,
            usdt: usdtAverage,
            buyAverage: usdtRates?.buyAverage ?? null,
            sellAverage: usdtRates?.sellAverage ?? null,
        };

        return buildUnifiedHistoryData({
            bcvHistory,
            usdtHistory: usdtHistoryByRange?.[range],
            range,
            currentSnapshot,
        });
    }, [bcvHistory, usdtHistoryByRange, range, getRateByCode, usdtRates]);

    const seriesConfig = useMemo(() => ([
        {
            key: 'bcvUsd',
            label: t('history.usdBcv'),
            enabled: showUsdBcv,
            color: lineColors.bcvUsd,
        },
        {
            key: 'bcvEur',
            label: t('history.eurBcv'),
            enabled: showEurBcv,
            color: lineColors.bcvEur,
        },
        {
            key: 'usdt',
            label: t('history.usdt'),
            enabled: showUsdt,
            color: lineColors.usdt,
        },
    ]), [lineColors.bcvEur, lineColors.bcvUsd, lineColors.usdt, showEurBcv, showUsdBcv, showUsdt, t]);

    const activeSeries = useMemo(
        () => seriesConfig.filter((series) => series.enabled),
        [seriesConfig]
    );

    const toggleSeriesVisibility = (seriesKey) => {
        if (seriesKey === 'bcvUsd') {
            setHistorySeriesVisibility({
                ...historySeriesVisibility,
                bcvUsd: !showUsdBcv,
            });
            return;
        }

        if (seriesKey === 'bcvEur') {
            setHistorySeriesVisibility({
                ...historySeriesVisibility,
                bcvEur: !showEurBcv,
            });
            return;
        }

        if (seriesKey === 'usdt') {
            setHistorySeriesVisibility({
                ...historySeriesVisibility,
                usdt: !showUsdt,
            });
        }
    };

    const latestPoint = historyData.length ? historyData[historyData.length - 1] : null;
    const activePoint = lockedPoint || hoveredPoint || latestPoint;
    const valueRows = [
        {
            key: 'bcvUsd',
            visible: showUsdBcv && activePoint?.bcvUsd != null,
            label: t('history.usdBcv'),
            value: activePoint?.bcvUsd,
            color: lineColors.bcvUsd,
        },
        {
            key: 'bcvEur',
            visible: showEurBcv && activePoint?.bcvEur != null,
            label: t('history.eurBcv'),
            value: activePoint?.bcvEur,
            color: lineColors.bcvEur,
        },
        {
            key: 'usdt',
            visible: showUsdt && activePoint?.usdt != null,
            label: t('history.usdtAverage'),
            value: activePoint?.usdt,
            color: lineColors.usdt,
        },
    ].filter((row) => row.visible);

    const handleMouseMove = (state) => {
        if (isTouch || lockedPoint) return;
        const point = state?.activePayload?.[0]?.payload;
        if (point) {
            setHoveredPoint(point);
        }
    };

    const handleMouseLeave = () => {
        if (isTouch || lockedPoint) return;
        setHoveredPoint(null);
    };

    const handleChartClick = (state) => {
        const point = state?.activePayload?.[0]?.payload || hoveredPoint || latestPoint;

        if (!point) return;

        setLockedPoint((current) => {
            if (current?.timestamp === point.timestamp) {
                return null;
            }
            return point;
        });
    };

    const handleOutsideTap = () => {
        if (isTouch && lockedPoint) {
            setLockedPoint(null);
        }
    };

    const locale = i18n.language === 'en' ? 'en-US' : 'es-VE';

    if (historyLoading && !historyData.length) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress color="primary" />
            </Box>
        );
    }

    if (historyError && !historyData.length) {
        return (
            <Alert severity="error">
                {t('history.error')}
            </Alert>
        );
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }} onClick={handleOutsideTap}>
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
                        {t('history.title')}
                    </Typography>
                </CardContent>
            </Card>

            <Card
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <ToggleButtonGroup
                        value={range}
                        exclusive
                        onChange={(_, nextValue) => {
                            if (nextValue) setRange(nextValue);
                        }}
                        size="small"
                        sx={{
                            alignSelf: 'center',
                            display: 'flex',
                            gap: 1,
                            border: 'none',
                            '& .MuiToggleButton-root': {
                                px: 1.75,
                                borderRadius: 5,
                                borderColor: 'divider',
                                textTransform: 'none',
                            },
                            '& .MuiToggleButtonGroup-grouped': {
                                margin: 0,
                                border: '1px solid',
                                borderColor: 'divider !important',
                                borderRadius: '999px !important',
                            },
                        }}
                    >
                        {RANGE_OPTIONS.map((option) => (
                            <ToggleButton key={option} value={option}>
                                {option}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                    <Box
                        onClick={(event) => event.stopPropagation()}
                        sx={{ height: 320, width: '100%' }}
                    >
                        {historyData.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={historyData}
                                    margin={{ top: 16, right: 8, left: -12, bottom: 8 }}
                                    onMouseMove={handleMouseMove}
                                    onMouseLeave={handleMouseLeave}
                                    onClick={handleChartClick}
                                >
                                    <CartesianGrid strokeDasharray="4 4" stroke={theme.palette.divider} />
                                    <XAxis
                                        dataKey="timestamp"
                                        tickFormatter={(value) => formatXAxis(value, range, locale)}
                                        minTickGap={24}
                                        stroke={theme.palette.text.secondary}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis
                                        tickFormatter={(value) => formatNumber(value, 0)}
                                        width={56}
                                        stroke={theme.palette.text.secondary}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <Tooltip content={<CompactTooltip locale={locale} range={range} activeSeries={activeSeries} />} />

                                    <Line
                                        type="monotone"
                                        dataKey="bcvUsdSmooth"
                                        stroke={lineColors.bcvUsd}
                                        strokeWidth={2}
                                        dot={false}
                                        connectNulls={false}
                                        activeDot={{ r: 5 }}
                                        hide={!showUsdBcv}
                                        animationBegin={0}
                                        animationDuration={450}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="bcvEurSmooth"
                                        stroke={lineColors.bcvEur}
                                        strokeWidth={2}
                                        dot={false}
                                        connectNulls={false}
                                        activeDot={{ r: 5 }}
                                        hide={!showEurBcv}
                                        animationBegin={0}
                                        animationDuration={450}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="usdt"
                                        stroke={lineColors.usdt}
                                        strokeWidth={2}
                                        dot={false}
                                        connectNulls={false}
                                        activeDot={{ r: 5 }}
                                        hide={!showUsdt}
                                        animationBegin={0}
                                        animationDuration={450}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography color="text.secondary">{t('history.noData')}</Typography>
                            </Box>
                        )}
                    </Box>

                    <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center', flexWrap: 'wrap', rowGap: 1 }}>
                        {seriesConfig.map((series) => (
                            <Box
                                key={`color-${series.key}`}
                                onClick={() => toggleSeriesVisibility(series.key)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 999,
                                    border: '1px solid',
                                    borderColor: series.enabled ? 'text.primary' : 'divider',
                                    bgcolor: series.enabled ? 'action.hover' : 'transparent',
                                    opacity: series.enabled ? 1 : 0.65,
                                    cursor: 'pointer',
                                    userSelect: 'none',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                <Typography variant="caption" color={series.enabled ? 'text.primary' : 'text.secondary'}>
                                    {series.label}
                                </Typography>
                                <Box
                                    component="input"
                                    type="color"
                                    value={series.color}
                                    onClick={(event) => event.stopPropagation()}
                                    onChange={(event) => {
                                        const nextColor = event.target.value;
                                        setLineColors((current) => ({
                                            ...current,
                                            [series.key]: nextColor,
                                        }));
                                    }}
                                    sx={{
                                        width: 22,
                                        height: 22,
                                        p: 0,
                                        border: 'none',
                                        borderRadius: 1,
                                        bgcolor: 'transparent',
                                        cursor: 'pointer',
                                    }}
                                />
                            </Box>
                        ))}
                    </Stack>
                </CardContent>
            </Card>

            {activePoint && (
                <Card
                    elevation={0}
                    sx={{
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 1,
                                borderRadius: 1.5,
                                bgcolor: 'action.hover',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                    {t('history.date')}
                                </Typography>
                            </Box>
                            <Chip
                                label={formatPointDate(activePoint.timestamp, range, locale)}
                                size="small"
                                variant="outlined"
                            />
                        </Box>

                        <Divider />

                        <Stack spacing={1}>
                            {valueRows.map((row) => (
                                <Box
                                    key={row.key}
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        py: 0.25,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box
                                            sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: '50%',
                                                bgcolor: row.color,
                                            }}
                                        />
                                        <Typography>{row.label}</Typography>
                                    </Box>
                                    <Typography sx={{ fontWeight: 700 }}>{formatNumber(row.value, 2)} Bs</Typography>
                                </Box>
                            ))}

                            {showUsdt && activePoint.usdt != null && (
                                <>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <TrendingUpIcon sx={{ fontSize: 16 }} />
                                            {t('rates.buy')}
                                        </Typography>
                                        <Typography>{formatNumber(activePoint.buyAverage, 2)} Bs</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <TrendingDownIcon sx={{ fontSize: 16 }} />
                                            {t('rates.sell')}
                                        </Typography>
                                        <Typography>{formatNumber(activePoint.sellAverage, 2)} Bs</Typography>
                                    </Box>
                                </>
                            )}
                        </Stack>

                        <Divider />

                        <Stack spacing={0.75}>
                            {showUsdBcv && showUsdt && activePoint.gapUsdUsdt != null && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <CurrencyExchangeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        {t('history.gapUsd')}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontWeight: 600,
                                            color: activePoint.gapUsdUsdt >= 0 ? 'success.main' : 'error.main',
                                        }}
                                    >
                                        {`${activePoint.gapUsdUsdt >= 0 ? '+' : ''}${formatNumber(activePoint.gapUsdUsdt, 2)}%`}
                                    </Typography>
                                </Box>
                            )}

                            {showEurBcv && showUsdt && activePoint.gapEurUsdt != null && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                        <CurrencyExchangeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        {t('history.gapEur')}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontWeight: 600,
                                            color: activePoint.gapEurUsdt >= 0 ? 'success.main' : 'error.main',
                                        }}
                                    >
                                        {`${activePoint.gapEurUsdt >= 0 ? '+' : ''}${formatNumber(activePoint.gapEurUsdt, 2)}%`}
                                    </Typography>
                                </Box>
                            )}

                            {((showUsdBcv && showUsdt && activePoint.gapUsdUsdt == null) || (showEurBcv && showUsdt && activePoint.gapEurUsdt == null)) && (
                                <Typography variant="caption" color="text.secondary">
                                    {t('history.gapUnavailable')}
                                </Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}
