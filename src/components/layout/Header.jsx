import { AppBar, Toolbar, IconButton, Typography, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRates } from '../../contexts/RatesContext';

export default function Header({ onMenuClick }) {
    const { fetchAllRates, loading } = useRates();

    const handleRefresh = () => {
        fetchAllRates();
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2 }}
                >
                    <MenuIcon />
                </IconButton>

                <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
                    {/* Logo placeholder */}
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            border: '3px solid',
                            borderColor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1,
                            background: 'linear-gradient(135deg, #FFD700 25%, #4CAF50 25%, #4CAF50 50%, #2196F3 50%, #2196F3 75%, #f44336 75%)',
                        }}
                    >
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 700,
                                color: 'white',
                                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                            }}
                        >
                            $
                        </Typography>
                    </Box>
                    <Typography
                        variant="h6"
                        component="h1"
                        sx={{
                            fontWeight: 600,
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Day Dollar
                    </Typography>
                </Box>

                <IconButton
                    color="inherit"
                    aria-label="refresh rates"
                    onClick={handleRefresh}
                    disabled={loading}
                    sx={{
                        animation: loading ? 'spin 1s linear infinite' : 'none',
                        '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                        },
                    }}
                >
                    <RefreshIcon />
                </IconButton>
            </Toolbar>
        </AppBar>
    );
}
