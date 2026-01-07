import { Button } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import { useTranslation } from 'react-i18next';
import { shareContent } from '../../utils/formatters';

export default function ShareButton({ title, text, variant = 'outlined', fullWidth = false }) {
    const { t } = useTranslation();

    const handleShare = async () => {
        await shareContent(title, text);
    };

    return (
        <Button
            variant={variant}
            color="primary"
            startIcon={<ShareIcon />}
            onClick={handleShare}
            fullWidth={fullWidth}
            sx={{
                borderColor: 'primary.main',
                color: 'primary.main',
            }}
        >
            {t('calc.share')}
        </Button>
    );
}
