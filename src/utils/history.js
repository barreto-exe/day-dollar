function getDayKey(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function pickBcvValue(currencies, code) {
  if (!Array.isArray(currencies)) return null;

  const byCode = currencies.filter((currency) => currency.rateCurrencyCode === code);
  if (!byCode.length) return null;

  if (code === 'USD') {
    const secondary = byCode.find((currency) => currency.type === 'SECONDARY');
    if (secondary?.baseValue != null) return secondary.baseValue;
  }

  const other = byCode.find((currency) => currency.type === 'OTHER');
  if (other?.baseValue != null) return other.baseValue;

  return byCode[0]?.baseValue ?? null;
}

function getBcvDaysForRange(bcvHistory, range) {
  if (!bcvHistory) return [];

  if (range === '3M' || range === '1M' || range === '7D' || range === '24H') {
    return bcvHistory.last90Days || [];
  }

  return bcvHistory.last365Days || [];
}

function getRangeWindowMs(range) {
  const hour = 60 * 60 * 1000;
  const day = 24 * hour;

  switch (range) {
    case '24H':
      return day;
    case '7D':
      return 7 * day;
    case '1M':
      return 31 * day;
    case '3M':
      return 93 * day;
    default:
      return 93 * day;
  }
}

function toDailyBcvMap(bcvHistory, range) {
  const sourceDays = getBcvDaysForRange(bcvHistory, range);

  return sourceDays.reduce((accumulator, dayPoint) => {
    if (!dayPoint?.date) {
      return accumulator;
    }

    const dayKey = getDayKey(dayPoint.date);
    accumulator[dayKey] = {
      timestamp: dayPoint.date,
      usd: pickBcvValue(dayPoint.currencies, 'USD'),
      eur: pickBcvValue(dayPoint.currencies, 'EUR'),
    };

    return accumulator;
  }, {});
}

function getInitialBcvValues(bcvHistory, range, firstTimestamp) {
  const sourceDays = getBcvDaysForRange(bcvHistory, range);
  let usd = null;
  let eur = null;

  sourceDays.forEach((dayPoint) => {
    if (!dayPoint?.date || dayPoint.date > firstTimestamp) return;

    const nextUsd = pickBcvValue(dayPoint.currencies, 'USD');
    const nextEur = pickBcvValue(dayPoint.currencies, 'EUR');

    if (nextUsd != null) usd = nextUsd;
    if (nextEur != null) eur = nextEur;
  });

  return { usd, eur };
}

function calculateGapPercent(baseRate, usdtRate) {
  if (baseRate == null || usdtRate == null || baseRate === 0) return null;
  return ((usdtRate - baseRate) / baseRate) * 100;
}

function applyExponentialSmoothing(values, alpha = 0.18) {
  let smoothedValue = null;

  return values.map((value) => {
    if (value == null) return null;

    if (smoothedValue == null) {
      smoothedValue = value;
      return value;
    }

    smoothedValue = (alpha * value) + ((1 - alpha) * smoothedValue);
    return smoothedValue;
  });
}

export function buildUnifiedHistoryData({ bcvHistory, usdtHistory, range }) {
  const usdtPoints = usdtHistory?.data || [];

  if (!usdtPoints.length) {
    return [];
  }

  const latestTimestamp = usdtPoints[usdtPoints.length - 1]?.date || usdtPoints[0].date;
  const minTimestamp = latestTimestamp - getRangeWindowMs(range);
  const bcvDailyMap = toDailyBcvMap(bcvHistory, range);
  const filteredUsdtPoints = usdtPoints.filter((point) => point?.date && point.date >= minTimestamp);

  if (!filteredUsdtPoints.length) {
    return [];
  }

  const initialValues = getInitialBcvValues(bcvHistory, range, filteredUsdtPoints[0].date);
  let lastKnownUsd = initialValues.usd;
  let lastKnownEur = initialValues.eur;

  const baseSeries = filteredUsdtPoints
    .map((point) => {
      const dayKey = getDayKey(point.date);
      const bcvAtDay = bcvDailyMap[dayKey] || {};

      const usdt = point.averageValue ?? null;

      if (bcvAtDay.usd != null) {
        lastKnownUsd = bcvAtDay.usd;
      }
      if (bcvAtDay.eur != null) {
        lastKnownEur = bcvAtDay.eur;
      }

      const bcvUsd = lastKnownUsd;
      const bcvEur = lastKnownEur;

      return {
        timestamp: point.date,
        usdt,
        bcvUsd,
        bcvEur,
        buyAverage: point.buyAverage ?? null,
        sellAverage: point.sellAverage ?? null,
        gapUsdUsdt: calculateGapPercent(bcvUsd, usdt),
        gapEurUsdt: calculateGapPercent(bcvEur, usdt),
      };
    });

  const bcvUsdSmoothed = applyExponentialSmoothing(baseSeries.map((point) => point.bcvUsd));
  const bcvEurSmoothed = applyExponentialSmoothing(baseSeries.map((point) => point.bcvEur));

  return baseSeries.map((point, index) => ({
    ...point,
    bcvUsdSmooth: bcvUsdSmoothed[index],
    bcvEurSmooth: bcvEurSmoothed[index],
  }));
}
