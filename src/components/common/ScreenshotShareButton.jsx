import { useState, useRef, useCallback } from 'react';
import { Button, CircularProgress, Box, Typography, Portal } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import { formatNumber } from '../../utils/formatters';

// Ghost component that renders the screenshot content in a controlled environment
function ScreenshotGhostContent({ data, rateLabel }) {
    const { rateInfo, currentRate, foreignAmount, bsAmount, rateComparison } = data;

    // Format value for display with 2 decimals
    const formatDisplayValue = (value) => {
        if (!value || value === '') return '0,00';
        const numVal = parseFloat(value) || 0;
        return numVal.toLocaleString('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <Box
            sx={{
                width: 360,
                bgcolor: '#1E1E1E',
                p: 3,
                borderRadius: 2,
                border: '1px solid rgba(255, 255, 255, 0.12)',
            }}
        >
            {/* Rate Selector Display */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
                <Box
                    sx={{
                        bgcolor: '#4CAF50',
                        color: '#fff',
                        px: 3,
                        py: 1.5,
                        borderRadius: 3,
                        fontWeight: 600,
                        fontSize: '1rem',
                    }}
                >
                    {rateLabel}
                </Box>
            </Box>

            {/* Exchange Rate */}
            {currentRate && (
                <Typography
                    sx={{
                        textAlign: 'center',
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.875rem',
                        mb: 2,
                    }}
                >
                    1 {rateInfo?.code} = {formatNumber(currentRate.baseValue, 4)} Bs.
                </Typography>
            )}

            {/* Foreign Amount */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography
                    sx={{
                        minWidth: 40,
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1.25rem',
                    }}
                >
                    {rateInfo?.symbol || '$'}
                </Typography>
                <Typography
                    sx={{
                        flex: 1,
                        textAlign: 'right',
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        color: '#fff',
                    }}
                >
                    {formatDisplayValue(foreignAmount)}
                </Typography>
            </Box>

            {/* Bs Amount */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                    sx={{
                        minWidth: 40,
                        fontWeight: 500,
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '1.25rem',
                    }}
                >
                    Bs
                </Typography>
                <Typography
                    sx={{
                        flex: 1,
                        textAlign: 'right',
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        color: '#fff',
                    }}
                >
                    {formatDisplayValue(bsAmount)}
                </Typography>
            </Box>

            {/* Equivalence Display */}
            {rateComparison && rateComparison.hasEquivalent && (
                <Box
                    sx={{
                        mt: 2,
                        py: 1,
                        px: 2,
                        bgcolor: rateComparison.usdtEquivalent ? 'rgba(255, 215, 0, 0.1)' : 'rgba(76, 175, 80, 0.1)',
                        borderRadius: 2,
                        textAlign: 'center',
                    }}
                >
                    {rateComparison.usdtEquivalent > 0 && (
                        <Typography
                            sx={{
                                fontWeight: 600,
                                color: '#FFD700',
                            }}
                        >
                            ≈ ₮{formatNumber(rateComparison.usdtEquivalent, 2)} USDT
                        </Typography>
                    )}
                    {rateComparison.bcvEquivalent > 0 && (
                        <Typography
                            sx={{
                                fontWeight: 600,
                                color: '#4CAF50',
                            }}
                        >
                            ≈ ${formatNumber(rateComparison.bcvEquivalent, 2)} Dólar BCV
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}

export default function ScreenshotShareButton({ screenshotData, title, variant = 'outlined' }) {
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [showGhost, setShowGhost] = useState(false);
    const ghostRef = useRef(null);

    // Get the rate label for display
    const getRateLabel = useCallback(() => {
        if (!screenshotData?.rateInfo) return '';
        return i18n.language === 'en'
            ? screenshotData.rateInfo.labelEn
            : screenshotData.rateInfo.label;
    }, [screenshotData, i18n.language]);

    const handleShare = async () => {
        if (!screenshotData) return;

        setLoading(true);
        setShowGhost(true);

        // Wait for ghost to render
        await new Promise(resolve => setTimeout(resolve, 100));

        try {
            const element = ghostRef.current;
            if (!element) {
                throw new Error('Ghost element not found');
            }

            // Capture the ghost element as canvas
            const canvas = await html2canvas(element, {
                backgroundColor: '#1E1E1E',
                scale: 2,
                logging: false,
                useCORS: true,
            });

            // Convert to blob
            const blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/png', 1.0);
            });

            if (!blob) {
                throw new Error('Failed to create image');
            }

            // Create file from blob
            const file = new File([blob], 'day-dollar-conversion.png', { type: 'image/png' });

            // Check if Web Share API with files is supported
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: title,
                    text: 'Conversión realizada con Day Dollar',
                    files: [file],
                });
            } else {
                // Fallback: Download the image
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'day-dollar-conversion.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error sharing screenshot:', err);
            }
        } finally {
            setLoading(false);
            setShowGhost(false);
        }
    };

    return (
        <>
            <Button
                variant={variant}
                color="primary"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ShareIcon />}
                onClick={handleShare}
                disabled={loading}
                sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                }}
            >
                {t('calc.share')}
            </Button>

            {/* Hidden ghost component for screenshot capture */}
            {showGhost && (
                <Portal>
                    <Box
                        ref={ghostRef}
                        sx={{
                            position: 'fixed',
                            left: -9999,
                            top: 0,
                            zIndex: -1,
                        }}
                    >
                        <ScreenshotGhostContent
                            data={screenshotData}
                            rateLabel={getRateLabel()}
                        />
                    </Box>
                </Portal>
            )}
        </>
    );
}
