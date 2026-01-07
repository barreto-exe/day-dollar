import { Box, TextField, Typography, InputAdornment } from '@mui/material';
import CopyButton from '../common/CopyButton';

export default function ConversionInput({
    label,
    value,
    onChange,
    currencyCode,
    disabled = false,
}) {
    // Format value for display with 2 decimals
    const formatDisplayValue = (val) => {
        if (!val || val === '0') return '';
        const numVal = parseInt(val, 10) || 0;
        // Convert cents to decimal format
        return (numVal / 100).toFixed(2);
    };

    // Store value in cents (integer) for precision
    const handleChange = (e) => {
        const inputVal = e.target.value;
        // Remove all non-digits
        const digitsOnly = inputVal.replace(/[^\d]/g, '');

        if (digitsOnly === '') {
            onChange('');
            return;
        }

        // Store as cents value
        const centsValue = parseInt(digitsOnly, 10);
        // Convert to decimal for parent component
        const decimalValue = (centsValue / 100).toFixed(2);
        onChange(decimalValue);
    };

    // Convert decimal value back to display
    const getDisplayValue = () => {
        if (!value || value === '') return '';
        const numVal = parseFloat(value) || 0;
        // Format with thousands separator and 2 decimals
        return numVal.toLocaleString('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    // Value for copy button (formatted)
    const copyValue = getDisplayValue() || '0,00';

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
                value={getDisplayValue()}
                onChange={handleChange}
                disabled={disabled}
                placeholder="0,00"
                autoComplete="off"
                inputProps={{
                    inputMode: 'numeric',
                    pattern: '[0-9]*',
                    autoComplete: 'off',
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
                            <CopyButton value={copyValue} size="small" />
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
