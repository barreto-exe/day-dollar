import {
    Box,
    Card,
    CardContent,
    Typography,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { usePreferences, RATE_TYPES, RATE_INFO } from '../../contexts/PreferencesContext';

export default function Settings() {
    const { t, i18n } = useTranslation();
    const { preferences, setFavoriteRate } = usePreferences();

    const handleRateChange = (event) => {
        setFavoriteRate(event.target.value);
    };

    const handleLanguageChange = (lang) => {
        i18n.changeLanguage(lang);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Title */}
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
                        {t('settings.title')}
                    </Typography>
                </CardContent>
            </Card>

            {/* Favorite Rate Selection */}
            <Card
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        {t('settings.favoriteRate')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {t('settings.favoriteRateDesc')}
                    </Typography>

                    <FormControl component="fieldset" fullWidth>
                        <RadioGroup
                            value={preferences.favoriteRate}
                            onChange={handleRateChange}
                        >
                            {Object.values(RATE_TYPES).map((rateType) => {
                                const info = RATE_INFO[rateType];
                                const label = i18n.language === 'en' ? info.labelEn : info.label;

                                return (
                                    <FormControlLabel
                                        key={rateType}
                                        value={rateType}
                                        control={
                                            <Radio
                                                sx={{
                                                    color: 'text.secondary',
                                                    '&.Mui-checked': {
                                                        color: 'primary.main',
                                                    },
                                                }}
                                            />
                                        }
                                        label={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body1" sx={{ minWidth: 30 }}>
                                                    {info.symbol}
                                                </Typography>
                                                <Typography variant="body1">{label}</Typography>
                                            </Box>
                                        }
                                        sx={{
                                            mx: 0,
                                            py: 0.5,
                                            borderRadius: 1,
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 0.04)',
                                            },
                                        }}
                                    />
                                );
                            })}
                        </RadioGroup>
                    </FormControl>
                </CardContent>
            </Card>

            {/* Language Selection */}
            <Card
                elevation={0}
                sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        {t('settings.language')}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        {[
                            { code: 'es', label: t('settings.spanish'), flag: '🇪🇸' },
                            { code: 'en', label: t('settings.english'), flag: '🇬🇧' },
                        ].map((lang) => (
                            <Card
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                sx={{
                                    flex: 1,
                                    cursor: 'pointer',
                                    bgcolor: i18n.language === lang.code ? 'rgba(76, 175, 80, 0.12)' : 'background.default',
                                    border: '2px solid',
                                    borderColor: i18n.language === lang.code ? 'primary.main' : 'divider',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                    },
                                }}
                            >
                                <CardContent sx={{ textAlign: 'center', py: 2, '&:last-child': { pb: 2 } }}>
                                    <Typography variant="h4" sx={{ mb: 0.5 }}>
                                        {lang.flag}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: i18n.language === lang.code ? 600 : 400,
                                            color: i18n.language === lang.code ? 'primary.main' : 'text.primary',
                                        }}
                                    >
                                        {lang.label}
                                    </Typography>
                                </CardContent>
                            </Card>
                        ))}
                    </Box>
                </CardContent>
            </Card>

            {/* App Info */}
            <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="caption" color="text.secondary">
                    Day Dollar v1.0.0
                </Typography>
            </Box>
        </Box>
    );
}
