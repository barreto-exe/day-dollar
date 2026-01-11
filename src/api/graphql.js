const API_URL = 'https://api.alcambio.app/graphql';

/**
 * Execute a GraphQL query
 */
async function executeQuery(operationName, query, variables = {}) {
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

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result = await response.json();
  
  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL error');
  }

  return result.data;
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

  const data = await executeQuery('getCountryConversions', query, variables);
  return data.getCountryConversions;
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

  const data = await executeQuery('getBinanceP2PAverages', query);
  return data.getBinanceP2PAverages;
}

/**
 * Get all rates combined (BCV + USDT)
 */
export async function getAllRates(countryCode = 'VE') {
  const [conversions, binanceP2P] = await Promise.all([
    getCountryConversions(countryCode),
    getBinanceP2PAverages(),
  ]);

  return {
    conversions,
    binanceP2P,
  };
}
