/**
 * @file storage.ts
 * Persistence and data utilities for Stock Price Predictor.
 */

import { Stock, Currency } from '../types';

const STOCKS_STORAGE_KEY = 'srm_cse202_stocks_data_v1';
const CURRENCY_STORAGE_KEY = 'srm_cse202_currency_pref';
const THEME_STORAGE_KEY = 'srm_cse202_theme_pref';

/**
 * Loads stocks from localStorage.
 */
export function loadStoredStocks(): Stock[] {
  try {
    const raw = localStorage.getItem(STOCKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Filter and sanitize to ensure valid structure
    return parsed.filter((s: unknown): s is Stock => {
      if (!s || typeof s !== 'object') return false;
      const candidate = s as Record<string, unknown>;
      return (
        typeof candidate.name === 'string' &&
        candidate.name.trim().length > 0 &&
        Array.isArray(candidate.history) &&
        candidate.history.length > 0 &&
        candidate.history.every(p => typeof p === 'number' && Number.isFinite(p) && p > 0)
      );
    });
  } catch (err) {
    console.error('Failed to load stocks from localStorage:', err);
    return [];
  }
}

/**
 * Saves stocks array to localStorage.
 */
export function saveStoredStocks(stocks: Stock[]): void {
  try {
    localStorage.setItem(STOCKS_STORAGE_KEY, JSON.stringify(stocks));
  } catch (err) {
    console.error('Failed to save stocks to localStorage:', err);
  }
}

/**
 * Currency preferences.
 */
export function loadStoredCurrency(): Currency {
  const saved = localStorage.getItem(CURRENCY_STORAGE_KEY);
  return saved === 'USD' ? 'USD' : 'INR';
}

export function saveStoredCurrency(currency: Currency): void {
  localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
}

/**
 * Theme preferences: 'dark' | 'light'.
 */
export function loadStoredTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  // Default to system preference or dark for sleek financial terminal aesthetic
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function saveStoredTheme(theme: 'dark' | 'light'): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Formats a numeric price with the chosen currency symbol and decimals.
 */
export function formatCurrency(value: number, currency: Currency = 'INR', decimals: number = 2): string {
  const symbol = currency === 'INR' ? '₹' : '$';
  if (isNaN(value) || !Number.isFinite(value)) {
    return `${symbol}0.00`;
  }
  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * Formats signed change.
 */
export function formatSignedCurrency(value: number, currency: Currency = 'INR', decimals: number = 2): string {
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  const absVal = Math.abs(value);
  return `${sign}${formatCurrency(absVal, currency, decimals)}`;
}

/**
 * Formats percentage with sign.
 */
export function formatSignedPercent(value: number, decimals: number = 2): string {
  if (isNaN(value) || !Number.isFinite(value)) return '0.00%';
  const sign = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${sign}${Math.abs(value).toFixed(decimals)}%`;
}

/**
 * Parses user-pasted text into an array of positive finite numbers.
 * Supports comma, space, newline, semicolon, tab delimiters.
 */
export function parsePastedPrices(raw: string): { prices: number[]; errors: string[] } {
  const errors: string[] = [];
  if (!raw.trim()) {
    return { prices: [], errors: ['No numbers entered.'] };
  }

  // Split on any combination of whitespace, commas, semicolons
  const tokens = raw.split(/[\s,;\n\r\t]+/).filter(t => t.trim().length > 0);
  const prices: number[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i].trim();
    // Remove common stray currency symbols if user pasted with ₹ or $
    const sanitized = token.replace(/^[₹$€£,]+/, '').replace(/,/g, '');
    const num = Number(sanitized);

    if (isNaN(num)) {
      errors.push(`Token #${i + 1} ("${token}") is not a valid number.`);
    } else if (!Number.isFinite(num)) {
      errors.push(`Token #${i + 1} is not a finite number.`);
    } else if (num <= 0) {
      errors.push(`Price #${i + 1} (${num}) must be strictly greater than 0.`);
    } else {
      prices.push(num);
    }
  }

  return { prices, errors };
}

/**
 * Validates stock creation or update.
 */
export function validateStockInput(
  name: string,
  prices: number[],
  existingStocks: Stock[],
  currentStockName?: string
): string | null {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return 'Stock name is required.';
  }

  const isDuplicate = existingStocks.some(
    s => s.name.toLowerCase() === trimmedName.toLowerCase() &&
         (!currentStockName || s.name.toLowerCase() !== currentStockName.toLowerCase())
  );

  if (isDuplicate) {
    return `A stock named "${trimmedName}" already exists (stock names are case-insensitive).`;
  }

  if (prices.length < 2) {
    return 'At least 2 historical price points are required for trend analysis and predictions.';
  }

  for (let i = 0; i < prices.length; i++) {
    const p = prices[i];
    if (typeof p !== 'number' || !Number.isFinite(p) || p <= 0) {
      return `Price at index ${i + 1} must be a finite positive number (> 0).`;
    }
  }

  return null;
}
