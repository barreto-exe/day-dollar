# Day Dollar

Aplicación web (React + Vite) para consultar y convertir tasas del Bolívar venezolano usando datos de **BCV** y promedios **USDT (Binance P2P)**.

## Características principales

- Conversor de monedas con cálculo bidireccional (divisa ↔ Bs).
- Tasas BCV para múltiples monedas (USD, EUR, CNY, TRY, RUB, entre otras).
- Vista de tasas USDT con promedio de compra/venta y actualización por hora.
- Panel histórico unificado (BCV + USDT) con gráficas interactivas.
- Selección de fecha para consultar tasas históricas BCV.
- Soporte de idioma (Español / English).
- Tema claro, oscuro y automático.
- Preferencias persistidas en `localStorage`.
- Funciones de compartir/copiar valores.
- PWA (instalable) con cache para recursos y API.
- Fallback de datos en caché ante errores de red/API.

## Stack tecnológico

- **Frontend:** React 18, React Router
- **UI:** MUI (Material UI)
- **Gráficas:** Recharts
- **i18n:** i18next + react-i18next
- **Build tool:** Vite
- **PWA:** vite-plugin-pwa
- **Hosting/CI:** Firebase Hosting + GitHub Actions

## Requisitos

- Node.js 18+
- npm 9+

## Instalación y ejecución local

```bash
npm ci
npm run dev
```

La app se levanta en entorno local de Vite (por defecto en `http://localhost:5173`).

## Scripts disponibles

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run preview  # Previsualizar build
npm run lint     # Ejecutar ESLint (si hay configuración disponible)
```

## Fuente de datos

La app consume una API GraphQL pública:

- `https://api.alcambio.app/graphql`

Consultas principales implementadas:

- `getCountryConversions`
- `getBinanceP2PAverages`
- `getAppStatistics`
- `getUsdtHistoricalData`

Además, hay ejemplos de endpoints/operaciones en:

- `./endpoints samples` (directorio existente en el repositorio)

## Estructura del proyecto

```text
src/
  api/                # Cliente GraphQL y lógica de cache/fallback
  components/         # UI por dominios (calculator, rates, history, settings, layout)
  contexts/           # Estado global (rates, theme, preferences, notifications)
  hooks/              # Hooks reutilizables (countdown, local/session storage)
  i18n/               # Traducciones ES/EN
  utils/              # Formateadores e integración de históricos
  config/             # Configuración de anuncios/funcionalidades
public/               # Assets estáticos
```

## Despliegue

El proyecto está preparado para Firebase Hosting:

- En push a `main`: despliegue a canal `live`.
- En pull request: preview deploy automático.

Workflows:

- `.github/workflows/firebase-hosting-merge.yml`
- `.github/workflows/firebase-hosting-pull-request.yml`

Configuración Firebase:

- `firebase.json`
- `.firebaserc`

## Notas funcionales

- Las tasas USDT son referenciales (promedio de anuncios P2P), no oficiales.
- El sistema intenta usar datos en caché cuando hay fallos de conexión o respuesta del backend.
- Para BCV, la app maneja fecha de valor actual/futura e histórico de forma diferenciada.

## Licencia

Este repositorio no incluye actualmente un archivo de licencia (`LICENSE`).
