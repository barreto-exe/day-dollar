import {
    Drawer,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
} from '@mui/material';
import CalculateIcon from '@mui/icons-material/Calculate';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const menuItems = [
    { path: '/', icon: <CalculateIcon />, labelKey: 'nav.calculator' },
    { path: '/bcv-rates', icon: <ShowChartIcon />, labelKey: 'nav.bcvRates' },
    { path: '/usdt-rates', icon: <CurrencyBitcoinIcon />, labelKey: 'nav.usdtRates' },
    { path: '/settings', icon: <SettingsIcon />, labelKey: 'nav.settings' },
];

export default function NavigationDrawer({ open, onClose, width = 280 }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const handleNavigate = (path) => {
        navigate(path);
        onClose();
    };

    return (
        <Drawer
            variant="temporary"
            open={open}
            onClose={onClose}
            ModalProps={{
                keepMounted: true, // Better mobile performance
            }}
            sx={{
                '& .MuiDrawer-paper': {
                    width,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Box sx={{ p: 2 }}>
                {/* Logo and App Name */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            border: '3px solid',
                            borderColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, #FFD700 25%, #4CAF50 25%, #4CAF50 50%, #2196F3 50%, #2196F3 75%, #f44336 75%)',
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            sx={{
                                fontWeight: 700,
                                color: 'white',
                                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            }}
                        >
                            $
                        </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Day Dollar
                    </Typography>
                </Box>
            </Box>

            <Divider />

            <List sx={{ pt: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <ListItem key={item.path} disablePadding>
                            <ListItemButton
                                onClick={() => handleNavigate(item.path)}
                                sx={{
                                    mx: 1,
                                    borderRadius: 2,
                                    mb: 0.5,
                                    bgcolor: isActive ? 'rgba(76, 175, 80, 0.12)' : 'transparent',
                                    '&:hover': {
                                        bgcolor: isActive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                                    },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: isActive ? 'primary.main' : 'text.secondary',
                                        minWidth: 40,
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={t(item.labelKey)}
                                    primaryTypographyProps={{
                                        fontWeight: isActive ? 600 : 400,
                                        color: isActive ? 'primary.main' : 'text.primary',
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Drawer>
    );
}
