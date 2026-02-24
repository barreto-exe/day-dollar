import { useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import NavigationDrawer from './NavigationDrawer';
import FeatureAnnouncementsPopup from '../common/FeatureAnnouncementsPopup';

const DRAWER_WIDTH = 280;

export default function AppLayout() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleDrawerToggle = () => {
        setDrawerOpen(!drawerOpen);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <NavigationDrawer
                open={drawerOpen}
                onClose={handleDrawerClose}
                width={DRAWER_WIDTH}
                variant={isMobile ? 'temporary' : 'temporary'}
            />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    overflowX: 'hidden',
                }}
            >
                <Header onMenuClick={handleDrawerToggle} />

                <Box
                    sx={{
                        flexGrow: 1,
                        p: { xs: 1, sm: 3 },
                        pt: { xs: 10, sm: 11 },
                        maxWidth: 600,
                        width: '100%',
                        mx: 'auto',
                    }}
                >
                    <Outlet />
                </Box>
            </Box>

            <FeatureAnnouncementsPopup />
        </Box>
    );
}
