import { useMemo, useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
} from '@mui/material';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import { useTranslation } from 'react-i18next';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import announcements from '../../config/featureAnnouncements.json';

const STORAGE_KEY = 'feature_announcements_seen_counts';
const MAX_VIEWS_PER_VERSION = 2;

function getLocalizedText(value, language) {
    if (!value) return '';
    if (typeof value === 'string') return value;

    const locale = language?.startsWith('en') ? 'en' : 'es';
    return value[locale] || value.es || value.en || '';
}

export default function FeatureAnnouncementsPopup() {
    const { t, i18n } = useTranslation();
    const [seenCounts, setSeenCounts] = useLocalStorage(STORAGE_KEY, {});
    const [dismissedInSession, setDismissedInSession] = useState([]);

    const activeAnnouncement = useMemo(() => {
        if (!Array.isArray(announcements) || !announcements.length) return null;

        return announcements.find((announcement) => {
            const seenCount = seenCounts?.[announcement.version] || 0;
            const dismissedNow = dismissedInSession.includes(announcement.version);
            return seenCount < MAX_VIEWS_PER_VERSION && !dismissedNow;
        }) || null;
    }, [dismissedInSession, seenCounts]);

    const [open, setOpen] = useState(false);

    useEffect(() => {
        setOpen(Boolean(activeAnnouncement));
    }, [activeAnnouncement]);

    const handleClose = () => {
        if (!activeAnnouncement) {
            setOpen(false);
            return;
        }

        setSeenCounts((current) => {
            const counts = current || {};
            const version = activeAnnouncement.version;
            const currentCount = counts[version] || 0;

            return {
                ...counts,
                [version]: currentCount + 1,
            };
        });

        setDismissedInSession((current) => [...current, activeAnnouncement.version]);
        setOpen(false);
    };

    if (!activeAnnouncement) return null;

    const localizedTitle = getLocalizedText(activeAnnouncement.title, i18n.language);
    const localizedDescription = getLocalizedText(activeAnnouncement.description, i18n.language);
    const localizedItems = (activeAnnouncement.items || []).map((item) => getLocalizedText(item, i18n.language));
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <NewReleasesIcon color="primary" />
                    <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
                        {t('announcements.whatsNew')}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.75 }}>
                    {localizedTitle}
                </Typography>

                {localizedDescription && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {localizedDescription}
                    </Typography>
                )}

                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                    {localizedItems.map((item) => (
                        <Typography key={item} component="li" variant="body2" sx={{ mb: 0.75 }}>
                            {item}
                        </Typography>
                    ))}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} variant="contained">
                    {t('announcements.gotIt')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
