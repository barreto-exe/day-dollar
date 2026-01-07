import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translations
const resources = {
  en: {
    translation: {
      app: {
        name: 'Day Dollar',
        tagline: 'Venezuelan Bolivar Converter',
      },
      nav: {
        calculator: 'Calculator',
        bcvRates: 'BCV Rates',
        usdtRates: 'USDT Rates',
        settings: 'Settings',
      },
      calc: {
        reset: 'Reset',
        share: 'Share',
        copy: 'Copy',
        copied: 'Copied!',
        valueDate: 'Value date',
        nextValueDate: 'Next value date',
        selectRate: 'Select rate',
        quickAmounts: 'Quick amounts',
        usdtBcvGap: 'Gap vs Dollar BCV',
        usdtEquivalent: 'USDT Equivalent',
        bcvEquivalent: 'BCV Dollar Equivalent',
      },
      rates: {
        title: 'BCV Rates',
        average: 'Average',
        buy: 'Buy',
        sell: 'Sell',
        nextUpdate: 'Next rate available in',
        lastUpdate: 'Last update',
        change: 'Change',
        dollar: 'Dollar',
        euro: 'Euro',
        official: 'Official',
      },
      usdt: {
        title: 'USDT Rates',
        disclaimer: 'Rates are updated hourly from Binance P2P market data. The displayed value corresponds to the average of buy and sell listings, reflecting a market snapshot that may vary. This is for informational purposes only, not a fixed or official value.',
        warning: '1 USD ≠ 1 USDT',
      },
      settings: {
        title: 'Settings',
        favoriteRate: 'Favorite rate',
        favoriteRateDesc: 'This rate will be selected by default when you open the app',
        language: 'Language',
        spanish: 'Spanish',
        english: 'English',
        auto: 'Auto (Browser)',
      },
      currencies: {
        USD: 'US Dollar',
        EUR: 'Euro',
        CNY: 'Chinese Yuan',
        TRY: 'Turkish Lira',
        RUB: 'Russian Ruble',
        COP: 'Colombian Peso',
        BRL: 'Brazilian Real',
        USDT: 'USDT (Tether)',
        VEF: 'Venezuelan Bolivar',
      },
      common: {
        loading: 'Loading...',
        error: 'An error occurred',
        retry: 'Retry',
        save: 'Save',
        cancel: 'Cancel',
        graph: 'Chart',
      },
      days: {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday',
      },
    },
  },
  es: {
    translation: {
      app: {
        name: 'Day Dollar',
        tagline: 'Conversor de Bolívar Venezolano',
      },
      nav: {
        calculator: 'Calculadora',
        bcvRates: 'Tasas BCV',
        usdtRates: 'Tasas USDT',
        settings: 'Configuración',
      },
      calc: {
        reset: 'Reiniciar',
        share: 'Compartir',
        copy: 'Copiar',
        copied: '¡Copiado!',
        valueDate: 'Fecha de valor',
        nextValueDate: 'Próxima fecha de valor',
        selectRate: 'Seleccionar tasa',
        quickAmounts: 'Montos rápidos',
        usdtBcvGap: 'Brecha vs Dólar BCV',
        usdtEquivalent: 'Equivalente en USDT',
        bcvEquivalent: 'Equivalente en Dólar BCV',
      },
      rates: {
        title: 'Tasas BCV',
        average: 'Promedio',
        buy: 'Compra',
        sell: 'Venta',
        nextUpdate: 'Próxima tasa disponible en',
        lastUpdate: 'Última actualización',
        change: 'Cambio',
        dollar: 'Dólar',
        euro: 'Euro',
        official: 'Oficial',
      },
      usdt: {
        title: 'Tasas USDT',
        disclaimer: 'Las tasas se actualizan cada hora a partir de los datos del mercado P2P de Binance. El valor mostrado corresponde al promedio de los anuncios de compra y de venta de USDT, reflejando únicamente un momento del mercado, por lo que puede variar. Es una referencia informativa, no un valor fijo ni oficial.',
        warning: '1 USD ≠ 1 USDT',
      },
      settings: {
        title: 'Configuración',
        favoriteRate: 'Tasa favorita',
        favoriteRateDesc: 'Esta tasa será seleccionada por defecto al abrir la app',
        language: 'Idioma',
        spanish: 'Español',
        english: 'Inglés',
        auto: 'Automático (Navegador)',
      },
      currencies: {
        USD: 'Dólar estadounidense',
        EUR: 'Euro',
        CNY: 'Yuan chino',
        TRY: 'Lira turca',
        RUB: 'Rublo ruso',
        COP: 'Peso colombiano',
        BRL: 'Real brasileño',
        USDT: 'USDT (Tether)',
        VEF: 'Bolívar venezolano',
      },
      common: {
        loading: 'Cargando...',
        error: 'Ocurrió un error',
        retry: 'Reintentar',
        save: 'Guardar',
        cancel: 'Cancelar',
        graph: 'Gráfica',
      },
      days: {
        monday: 'Lunes',
        tuesday: 'Martes',
        wednesday: 'Miércoles',
        thursday: 'Jueves',
        friday: 'Viernes',
        saturday: 'Sábado',
        sunday: 'Domingo',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    },
  });

export default i18n;
