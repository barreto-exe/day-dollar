import { useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import { copyToClipboard } from '../../utils/formatters';

export default function CopyButton({ value, size = 'medium', color = 'default' }) {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        const success = await copyToClipboard(value);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Tooltip title={copied ? t('calc.copied') : t('calc.copy')}>
            <IconButton
                size={size}
                color={copied ? 'success' : color}
                onClick={handleCopy}
                sx={{
                    transition: 'all 0.2s ease',
                }}
            >
                {copied ? <CheckIcon /> : <ContentCopyIcon />}
            </IconButton>
        </Tooltip>
    );
}
