/**
 * @file types.ts
 * Type definitions for Stock Price Predictor.
 */

export interface Stock {
  name: string; // unique, case-insensitive
  history: number[]; // ordered oldest -> newest, finite and > 0
  addedAt?: number;
  notes?: string;
}

export type Currency = 'INR' | 'USD';

export type ActiveTab = 
  | 'overview'
  | 'add'
  | 'indicators'
  | 'predict'
  | 'history'
  | 'accuracy'
  | 'forecast'
  | 'price-change'
  | 'compare'
  | 'delete';

export interface TabConfig {
  id: ActiveTab;
  label: string;
  iconName: string;
  description: string;
}
