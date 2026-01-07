import { Box, Typography } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { formatNumber, formatPercentChange } from '../../utils/formatters';

export default function RateRow({
    name,
    value,
    change,
    isDown = false,
    symbol = 'Bs',
    isMain = false,
}) {
    const { text: changeText, color: changeColor } = formatPercentChange(change, isDown);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: isMain ? 2.5 : 1.5,
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                    variant={isMain ? 'h6' : 'body1'}
                    sx={{ fontWeight: isMain ? 600 : 400 }}
                >
                    {name}
                </Typography>
            </Box>

            <Box sx={{ textAlign: 'right' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    {isDown ? (
                        <TrendingDownIcon sx={{ color: 'error.main', fontSize: 20 }} />
                    ) : (
                        <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    )}
                    <Typography
                        variant={isMain ? 'h6' : 'body1'}
                        sx={{ fontWeight: 600 }}
                    >
                        {formatNumber(value, 4)} {symbol}
                    </Typography>
                </Box>

                {change !== undefined && change !== 0 && (
                    <Typography
                        variant="body2"
                        sx={{ color: changeColor, fontWeight: 500 }}
                    >
                        {changeText}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}
