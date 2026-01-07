import { Box, TextField, Typography, InputAdornment } from '@mui/material';
import CopyButton from '../common/CopyButton';

export default function ConversionInput({
    label,
    value,
    onChange,
    currencyCode,
    disabled = false,
}) {
    const handleChange = (e) => {
        const newValue = e.target.value;
        // Allow only numbers and decimal point
        if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
            onChange(newValue);
        }
    };

    // Format display value for copy
    const displayValue = value ? parseFloat(value).toLocaleString('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) : '';

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    minWidth: 40,
                    fontWeight: 500,
                    color: 'text.secondary',
                }}
            >
                {label}
            </Typography>

            <TextField
                fullWidth
                variant="standard"
                value={value}
                onChange={handleChange}
                disabled={disabled}
                placeholder="0.00"
                inputProps={{
                    inputMode: 'decimal',
                    style: {
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        textAlign: 'right',
                    },
                }}
                InputProps={{
                    disableUnderline: true,
                    endAdornment: (
                        <InputAdornment position="end">
                            <CopyButton value={displayValue || '0'} size="small" />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    '& .MuiInputBase-root': {
                        bgcolor: 'transparent',
                    },
                    '& .MuiInputBase-input': {
                        py: 1,
                    },
                }}
            />
        </Box>
    );
}
