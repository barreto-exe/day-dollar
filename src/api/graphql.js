const API_URL = 'https://api.alcambio.app/graphql';

// Cache utilities
const CACHE_PREFIX = 'api_cache_';

function getCacheKey(operationName, variables) {
  return CACHE_PREFIX + operationName + '_' + JSON.stringify(variables);
}

function saveToCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (error) {
    console.warn('Failed to save to cache:', error);
  }
}

function getFromCache(key) {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.warn('Failed to read from cache:', error);
  }
  return null;
}

/**
 * Execute a GraphQL query with caching support
 * Returns { data, fromCache } where fromCache indicates if using cached data
 */
async function executeQuery(operationName, query, variables = {}) {
  const cacheKey = getCacheKey(operationName, variables);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operationName,
        query,
        variables,
      }),
    });

    // Check for 504 or other server errors
    if (!response.ok) {
      // Try to return cached data on server errors
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.warn(`HTTP ${response.status} - Using cached data for ${operationName}`);
        return { data: cached.data, fromCache: true };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      // Try to return cached data on GraphQL errors
      const cached = getFromCache(cacheKey);
      if (cached) {
        console.warn(`GraphQL error - Using cached data for ${operationName}`);
        return { data: cached.data, fromCache: true };
      }
      throw new Error(result.errors[0]?.message || 'GraphQL error');
    }

    // Cache successful response
    saveToCache(cacheKey, result.data);
    return { data: result.data, fromCache: false };

  } catch (error) {
    // Network errors (offline, timeout, etc.)
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.warn(`Network error - Using cached data for ${operationName}:`, error.message);
      return { data: cached.data, fromCache: true };
    }
    throw error;
  }
}

/**
 * Get country conversion rates (BCV rates)
 * @param {string} countryCode - Country code (default: 'VE')
 * @param {Object} dateSearch - Optional date search parameters
 * @param {number} dateSearch.startDate - Start timestamp
 * @param {number} dateSearch.endDate - End timestamp
 * @param {string} dateSearch.filterByField - Field to filter by (e.g., 'dateBcvFees')
 */
export async function getCountryConversions(countryCode = 'VE', dateSearch = null) {
  const query = `
    query getCountryConversions($countryCode: String!, $dateSearch: DateSearchInput) {
      getCountryConversions(payload: {countryCode: $countryCode}, dateSearch: $dateSearch) {
        _id
        baseCurrency {
          code
          decimalDigits
          name
          namePlural
          symbol
          symbolNative
        }
        country {
          code
          flag
          name
        }
        conversionRates {
          baseValue
          official
          principal
          rateCurrency {
            code
            decimalDigits
            name
            symbol
            symbolNative
          }
          rateValue
          lastBaseValue
          lastRateValue
          type
          usesRateValue
          increaseDecreasePercentRate {
            percentValue
            isDown
          }
          increaseDecreasePercentBase {
            percentValue
            isDown
          }
        }
        dateBcvFees
        dateBcv
        dateParalelo
        createdAt
      }
    }
  `;

  const variables = { countryCode };
  if (dateSearch) {
    variables.dateSearch = dateSearch;
  }

  const result = await executeQuery('getCountryConversions', query, variables);
  return { 
    data: result.data.getCountryConversions, 
    fromCache: result.fromCache 
  };
}

/**
 * Get Binance P2P averages for USDT
 */
export async function getBinanceP2PAverages() {
  const query = `
    query getBinanceP2PAverages {
      getBinanceP2PAverages {
        sellAverage
        buyAverage
        sellChangePct
        buyChangePct
        totalChangePct
        pagesUsed
        asset
        effectiveFrom
        effectiveTo
        createdAt
        updatedAt
      }
    }
  `;

  const result = await executeQuery('getBinanceP2PAverages', query);
  return { 
    data: result.data.getBinanceP2PAverages, 
    fromCache: result.fromCache 
  };
}

/**
 * Get all rates combined (BCV + USDT)
 */
export async function getAllRates(countryCode = 'VE') {
  const [conversionsResult, binanceP2PResult] = await Promise.all([
    getCountryConversions(countryCode),
    getBinanceP2PAverages(),
  ]);

  return {
    conversions: conversionsResult.data,
    binanceP2P: binanceP2PResult.data,
    fromCache: conversionsResult.fromCache || binanceP2PResult.fromCache,
  };
}
