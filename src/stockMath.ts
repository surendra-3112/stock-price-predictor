/**
 * @file stockMath.ts
 * Core quantitative algorithms for Stock Price Predictor.
 * Directly mirrors the CSE 202 (SRM University AP) C++ algorithms.
 * All functions are pure, well-commented, and robust against edge cases.
 */

export interface AccuracyResult {
  canCalculate: boolean;
  predicted: number;
  actual: number;
  error: number;
  accuracyPercent: number;
  reason?: string;
}

export type Trend = 'Upward' | 'Downward' | 'Flat';

/**
 * Calculates the Simple Moving Average (SMA) of the last `p` prices.
 * Mirrors: double calculateSMA(const vector<double>& d, int p)
 * 
 * If p <= 0 or d.length < p, returns 0.
 * Otherwise returns the arithmetic mean of the last p values.
 */
export function calculateSMA(d: number[], p: number): number {
  if (p <= 0 || d.length < p) {
    return 0;
  }
  let sum = 0;
  const start = d.length - p;
  for (let i = start; i < d.length; i++) {
    sum += d[i];
  }
  return sum / p;
}

/**
 * Calculates the Exponential Moving Average (EMA) of period `p`.
 * Mirrors: double calculateEMA(const vector<double>& d, int p)
 * 
 * If p <= 0 or d.length < p, returns 0.
 * Weight multiplier k = 2 / (p + 1).
 * Seed EMA is the SMA of the first p values.
 * For i from p to end: ema = (d[i] - ema) * k + ema.
 */
export function calculateEMA(d: number[], p: number): number {
  if (p <= 0 || d.length < p) {
    return 0;
  }
  const k = 2 / (p + 1);
  
  // Seed EMA = SMA of the first p values
  let sumFirstP = 0;
  for (let i = 0; i < p; i++) {
    sumFirstP += d[i];
  }
  let ema = sumFirstP / p;

  // Process remaining items from index p to end
  for (let i = p; i < d.length; i++) {
    ema = (d[i] - ema) * k + ema;
  }
  return ema;
}

/**
 * Calculates the Momentum over period `p`.
 * Mirrors: double calculateMomentum(const vector<double>& d, int p)
 * 
 * If p <= 0 or d.length <= p, returns 0.
 * Otherwise returns d[last] - d[last - p].
 */
export function calculateMomentum(d: number[], p: number): number {
  if (p <= 0 || d.length <= p) {
    return 0;
  }
  const lastIndex = d.length - 1;
  return d[lastIndex] - d[lastIndex - p];
}

/**
 * Calculates the linear regression slope with x = 0..n-1.
 * Mirrors: double calculateSlope(const vector<double>& d)
 * 
 * If n < 2, returns 0.
 * den = n * Σx² - (Σx)²
 * If |den| < 1e-9, returns 0.
 * slope = (n * Σxy - Σx * Σy) / den.
 */
export function calculateSlope(d: number[]): number {
  const n = d.length;
  if (n < 2) {
    return 0;
  }

  let sumX = 0;
  let sumX2 = 0;
  let sumY = 0;
  let sumXY = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = d[i];
    sumX += x;
    sumX2 += x * x;
    sumY += y;
    sumXY += x * y;
  }

  const den = n * sumX2 - (sumX * sumX);
  if (Math.abs(den) < 1e-9) {
    return 0;
  }

  return (n * sumXY - (sumX * sumY)) / den;
}

/**
 * Predicts the next price in the series using the linear trend slope.
 * Mirrors: double predictNextPrice(const vector<double>& d)
 * 
 * If length < 2, returns last value (or 0 if empty).
 * Otherwise returns last value + calculateSlope(d).
 */
export function predictNextPrice(d: number[]): number {
  if (d.length === 0) {
    return 0;
  }
  if (d.length < 2) {
    return d[0];
  }
  const lastValue = d[d.length - 1];
  const slope = calculateSlope(d);
  return lastValue + slope;
}

/**
 * Derives the Trend label based on predicted next price vs latest price.
 * predicted > last -> "Upward"
 * predicted < last -> "Downward"
 * equal -> "Flat"
 */
export function getTrendLabel(predicted: number, last: number): Trend {
  const diff = predicted - last;
  if (Math.abs(diff) < 1e-5) {
    return 'Flat';
  }
  return diff > 0 ? 'Upward' : 'Downward';
}

/**
 * Backtests prediction accuracy.
 * Needs at least 3 prices.
 * Trains on all but the last price, predicts, compares with actual last price.
 * error = |pred - actual|
 * accuracy % = max(0, 100 - (error / actual) * 100)
 */
export function calculateAccuracy(d: number[]): AccuracyResult {
  if (d.length < 3) {
    return {
      canCalculate: false,
      predicted: 0,
      actual: d.length > 0 ? d[d.length - 1] : 0,
      error: 0,
      accuracyPercent: 0,
      reason: `Requires at least 3 historical price points (currently has ${d.length}).`,
    };
  }

  const trainData = d.slice(0, -1);
  const actual = d[d.length - 1];
  const predicted = predictNextPrice(trainData);
  const error = Math.abs(predicted - actual);
  
  let accuracyPercent = 0;
  if (actual > 0) {
    accuracyPercent = Math.max(0, 100 - (error / actual) * 100);
  }

  return {
    canCalculate: true,
    predicted,
    actual,
    error,
    accuracyPercent,
  };
}

/**
 * Computes price change between first and latest recorded price.
 */
export function calculatePriceChange(d: number[]) {
  if (d.length === 0) {
    return { first: 0, last: 0, absoluteChange: 0, percentChange: 0, points: 0 };
  }
  const first = d[0];
  const last = d[d.length - 1];
  const absoluteChange = last - first;
  const percentChange = first !== 0 ? (absoluteChange / first) * 100 : 0;
  return {
    first,
    last,
    absoluteChange,
    percentChange,
    points: d.length,
  };
}
