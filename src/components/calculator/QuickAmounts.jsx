import { Box, Button } from '@mui/material';

export default function QuickAmounts({ amounts, symbol, onSelect }) {
    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                }}
            >
                {amounts.map((amount) => (
                    <Button
                        key={amount}
                        variant="outlined"
                        size="small"
                        onClick={() => onSelect(amount)}
                        sx={{
                            minWidth: 'auto',
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            borderColor: 'divider',
                            color: 'text.primary',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: 'rgba(76, 175, 80, 0.08)',
                            },
                        }}
                    >
                        {symbol}{amount.toLocaleString()}
                    </Button>
                ))}
            </Box>
        </Box>
    );
}
