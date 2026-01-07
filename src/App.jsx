import { Routes, Route } from 'react-router-dom';
import { PreferencesProvider } from './contexts/PreferencesContext';
import { RatesProvider } from './contexts/RatesContext';
import AppLayout from './components/layout/AppLayout';
import Calculator from './components/calculator/Calculator';
import BcvRates from './components/rates/BcvRates';
import UsdtRates from './components/rates/UsdtRates';
import Settings from './components/settings/Settings';

function App() {
    return (
        <PreferencesProvider>
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
        </PreferencesProvider>
    );
}

export default App;
