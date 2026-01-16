import { Routes, Route } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { RatesProvider } from './contexts/RatesContext';
import AppLayout from './components/layout/AppLayout';
import Calculator from './components/calculator/Calculator';
import BcvRates from './components/rates/BcvRates';
import UsdtRates from './components/rates/UsdtRates';
import Settings from './components/settings/Settings';
import 'dayjs/locale/es';

function App() {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <PreferencesProvider>
                <NotificationProvider>
                    <RatesProvider>
                        <Routes>
                            <Route path="/" element={<AppLayout />}>
                                <Route index element={<Calculator />} />
                                <Route path="bcv-rates" element={<BcvRates />} />
                                <Route path="usdt-rates" element={<UsdtRates />} />
                                <Route path="settings" element={<Settings />} />
                            </Route>
                        </Routes>
                    </RatesProvider>
                </NotificationProvider>
            </PreferencesProvider>
        </LocalizationProvider>
    );
}

export default App;

