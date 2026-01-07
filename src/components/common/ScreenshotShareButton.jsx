import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';

export default function ScreenshotShareButton({ targetRef, title, variant = 'outlined' }) {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(false);

    const handleShare = async () => {
        if (!targetRef?.current) return;

        setLoading(true);

        try {
            const element = targetRef.current;

            // Get the actual dimensions of the element
            const rect = element.getBoundingClientRect();

            // Capture the element as canvas with fixed dimensions
            const canvas = await html2canvas(element, {
                backgroundColor: '#1E1E1E',
                scale: 2, // Higher quality
                logging: false,
                useCORS: true,
                width: rect.width,
                height: rect.height,
                x: 0,
                y: 0,
                scrollX: 0,
                scrollY: 0,
                windowWidth: rect.width,
                windowHeight: rect.height,
                // Add padding to prevent clipping
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.body.querySelector('[data-screenshot]') || clonedDoc.body.firstElementChild;
                    if (clonedElement) {
                        clonedElement.style.padding = '16px';
                        clonedElement.style.margin = '0';
                        clonedElement.style.width = '100%';
                        clonedElement.style.boxSizing = 'border-box';
                    }
                },
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
                // Fallback: try to download
                try {
                    const canvas = await html2canvas(targetRef.current, {
                        backgroundColor: '#1E1E1E',
                        scale: 2,
                        logging: false,
                    });
                    const url = canvas.toDataURL('image/png');
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'day-dollar-conversion.png';
                    link.click();
                } catch (downloadErr) {
                    console.error('Error downloading:', downloadErr);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
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
    );
}
