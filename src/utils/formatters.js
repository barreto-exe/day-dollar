/**
 * Format a number with thousands separators
 */
export function formatNumber(value, decimals = 2, locale = 'es-VE') {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format currency with symbol
 */
export function formatCurrency(value, symbol = 'Bs', decimals = 2) {
  const formatted = formatNumber(value, decimals);
  return `${symbol} ${formatted}`;
}

/**
 * Parse a formatted number string back to number
 */
export function parseFormattedNumber(str) {
  if (!str) return 0;
  
  // Remove thousands separators (periods in Spanish locale)
  // and convert decimal separator (comma) to period
  const normalized = str
    .replace(/\./g, '')
    .replace(',', '.');
  
  return parseFloat(normalized) || 0;
}

/**
 * Format date to display format
 */
export function formatDate(timestamp, locale = 'es-VE') {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  
  const options = {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  
  return date.toLocaleDateString(locale, options);
}

/**
 * Format date with time
 */
export function formatDateTime(timestamp, locale = 'es-VE') {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  
  const dateOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  
  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  
  const formattedDate = date.toLocaleDateString(locale, dateOptions);
  const formattedTime = date.toLocaleTimeString(locale, timeOptions);
  
  return { date: formattedDate, time: formattedTime };
}

/**
 * Format percentage change with sign and color
 */
export function formatPercentChange(value, isDown = false) {
  if (value === null || value === undefined) {
    return { text: '0%', color: 'inherit', sign: '' };
  }
  
  const absValue = Math.abs(value);
  const sign = isDown ? '-' : '+';
  const color = isDown ? '#f44336' : '#4CAF50';
  
  return {
    text: `${sign}${formatNumber(absValue, 2)}%`,
    color,
    sign,
    value: absValue,
  };
}

/**
 * Get day name from date
 */
export function getDayName(timestamp, locale = 'es-VE') {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return date.toLocaleDateString(locale, { weekday: 'long' });
}

/**
 * Calculate conversion
 */
export function calculateConversion(amount, rate, direction = 'toBase') {
  if (!amount || !rate || isNaN(amount) || isNaN(rate)) {
    return 0;
  }
  
  if (direction === 'toBase') {
    // Foreign currency to Bolivars
    return amount * rate;
  } else {
    // Bolivars to foreign currency
    return amount / rate;
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * Share content using Web Share API
 */
export async function shareContent(title, text, url = window.location.href) {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return true;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err);
      }
      return false;
    }
  } else {
    // Fallback: copy to clipboard
    return copyToClipboard(`${title}\n${text}\n${url}`);
  }
}
