import { useState } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Box,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import { RATE_TYPES, RATE_INFO } from '../../contexts/PreferencesContext';

// Group rates by type
const rateGroups = [
    {
        label: 'BCV Rates',
        rates: [RATE_TYPES.USD_BCV, RATE_TYPES.EUR_BCV],
    },
    {
        label: 'Crypto',
        rates: [RATE_TYPES.USDT],
    },
    {
        label: 'Other',
        rates: [RATE_TYPES.CNY_BCV, RATE_TYPES.TRY_BCV, RATE_TYPES.RUB_BCV],
    },
];

export default function RateSelector({ selectedRate, onChange }) {
    const { i18n } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSelect = (rate) => {
        onChange(rate);
        handleClose();
    };

    const selectedInfo = RATE_INFO[selectedRate];
    const label = i18n.language === 'en' ? selectedInfo?.labelEn : selectedInfo?.label;

    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
                variant="contained"
                color="primary"
                size="large"
                endIcon={<KeyboardArrowDownIcon />}
                onClick={handleClick}
                sx={{
                    minWidth: 200,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 3,
                }}
            >
                {label}
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                PaperProps={{
                    sx: {
                        minWidth: 220,
                        mt: 1,
                    },
                }}
            >
                {Object.values(RATE_TYPES).map((rateType) => {
                    const info = RATE_INFO[rateType];
                    const isSelected = selectedRate === rateType;
                    const rateLabel = i18n.language === 'en' ? info.labelEn : info.label;

                    return (
                        <MenuItem
                            key={rateType}
                            onClick={() => handleSelect(rateType)}
                            selected={isSelected}
                            sx={{
                                py: 1.5,
                            }}
                        >
                            <ListItemText
                                primary={rateLabel}
                                primaryTypographyProps={{
                                    fontWeight: isSelected ? 600 : 400,
                                }}
                            />
                            {isSelected && (
                                <ListItemIcon sx={{ minWidth: 'auto', ml: 1 }}>
                                    <CheckIcon color="primary" fontSize="small" />
                                </ListItemIcon>
                            )}
                        </MenuItem>
                    );
                })}
            </Menu>
        </Box>
    );
}
