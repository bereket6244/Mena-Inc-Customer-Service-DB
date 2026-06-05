/**
 * Safe utility to parse standard numbers, fractions, and basic arithmetic expressions.
 * For example: "1/4", "1/2", "0.5", "1 + 1/2", etc.
 */
export function parseFractionOrExpression(val: string | number): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const s = val.trim();
  if (!s) return 0;

  // Simple quick check for single fraction like "1/4" or "2/3" or "0.25"
  if (/^\d+\s*\/\s*\d+$/.test(s)) {
    const parts = s.split('/');
    const cleanNum = parseFloat(parts[0]);
    const cleanDen = parseFloat(parts[1]);
    if (cleanDen !== 0) {
      return Number((cleanNum / cleanDen).toFixed(4));
    }
  }

  // General safe parser for basic arithmetic expressions (using only digits, +, -, *, /, ., spaces, brackets)
  try {
    if (/^[0-9+\-*/().\s]+$/.test(s)) {
      // Safe dynamic calculation execution helper
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${s})`)();
      if (typeof result === 'number' && !isNaN(result)) {
        return Number(result.toFixed(4));
      }
    }
  } catch (_) {}

  // Standard float parser fallback
  const parsed = parseFloat(s);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Clean leading zeros from numeric inputs while typing, preserving decimals (like "0.5") and single zeros.
 */
export function cleanLeadingZeros(val: string): string {
  const trimmed = val.trim();
  
  // E.g., "05" -> "5", "005" -> "5", but keep "0.5" or "0"
  if (/^0+[1-9]/.test(trimmed)) {
    return trimmed.replace(/^0+/, '');
  }
  
  // Also handle sequence of multiple zeros, e.g., "00" or "000" -> "0"
  if (/^0+$/.test(trimmed)) {
    return '0';
  }
  
  return val;
}

/**
 * Format helper for showing fractional values human-readably if they correspond to common fractions.
 */
export function formatAsFractionLabel(num: number): string {
  if (num === 0.25) return '1/4';
  if (num === 0.5) return '1/2';
  if (num === 0.75) return '3/4';
  if (num === 0.125) return '1/8';
  if (num === 0.3333) return '1/3';
  return num.toString();
}
