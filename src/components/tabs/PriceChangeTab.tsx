/**
 * @file PriceChangeTab.tsx
 * Tab 8: Price Change.
 * Neutral charcoal and violet theme:
 * Gain green (#22C55E/#16A34A) and Loss red (#F43F5E/#E11D48) semantic deltas,
 * violet highlights (#8B5CF6 / #7C3AED).
 */

import React from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { Stock, Currency, ActiveTab } from '../../types';
import { formatCurrency, formatSignedCurrency, formatSignedPercent } from '../../utils/storage';
import { calculatePriceChange } from '../../stockMath';
import { EmptyState } from '../EmptyState';

interface PriceChangeTabProps {
  stocks: Stock[];
  selectedStockName?: string;
  onSelectStockName: (name: string) => void;
  currency: Currency;
  onNavigateTab: (tab: ActiveTab, selectedStock?: string) => void;
  onLoadSampleData: () => void;
}

export const PriceChangeTab: React.FC<PriceChangeTabProps> = ({
  stocks,
  selectedStockName,
  onSelectStockName,
  currency,
  onNavigateTab,
  onLoadSampleData,
}) => {
  if (stocks.length === 0) {
    return (
      <EmptyState
        onGoToAdd={() => onNavigateTab('add')}
        onLoadSampleData={onLoadSampleData}
        featureTitle="Price Change"
      />
    );
  }

  const activeStock =
    stocks.find((s) => s.name.toLowerCase() === selectedStockName?.toLowerCase()) || stocks[0];

  const history = activeStock.history;
  const change = calculatePriceChange(history);

  const minPrice = Math.min(...history);
  const maxPrice = Math.max(...history);
  const priceRange = maxPrice - minPrice;

  const isPositive = change.absoluteChange >= 0;

  const allRanked = [...stocks]
    .map((s) => {
      const c = calculatePriceChange(s.history);
      return { stock: s, change: c };
    })
    .sort((a, b) => b.change.percentChange - a.change.percentChange);

  return (
    <div className="space-y-6">
      
      {/* Header & Stock Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E4EB] dark:border-[#2E2E36]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#EDEDF0] tracking-tight">
            Total Price Change Analysis
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Measures baseline trajectory from first recorded inception to the latest price point.
          </p>
        </div>

        {/* Stock Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#6B6B76] dark:text-[#9A9AA5] whitespace-nowrap">
            Focus Stock:
          </label>
          <select
            value={activeStock.name}
            onChange={(e) => onSelectStockName(e.target.value)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          >
            {stocks.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.history.length} pts)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Stock KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* First Recorded Price */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
            Initial Price (P1)
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#18181B] dark:text-[#EDEDF0] mt-1">
            {formatCurrency(change.first, currency)}
          </div>
          <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Earliest baseline recorded
          </div>
        </div>

        {/* Latest Recorded Price */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
            Latest Price (P{history.length})
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#18181B] dark:text-[#EDEDF0] mt-1">
            {formatCurrency(change.last, currency)}
          </div>
          <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Current closing quote
          </div>
        </div>

        {/* Absolute Price Change (Semantic Green / Red) */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
            Absolute Net Change
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold font-mono mt-1 flex items-center gap-1 ${
              isPositive ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#E11D48] dark:text-[#F43F5E]'
            }`}
          >
            {isPositive ? <ArrowUpRight className="w-5 h-5 shrink-0" /> : <ArrowDownRight className="w-5 h-5 shrink-0" />}
            <span>{formatSignedCurrency(change.absoluteChange, currency)}</span>
          </div>
          <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1 font-mono">
            {change.points} recorded intervals
          </div>
        </div>

        {/* Percentage Return Change (Semantic Green / Red) */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
            Total Return %
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${
              isPositive ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#E11D48] dark:text-[#F43F5E]'
            }`}
          >
            {formatSignedPercent(change.percentChange)}
          </div>
          <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            ((P_last - P_first) / P_first) * 100
          </div>
        </div>

      </div>

      {/* Range & Volatility Stats for Selected Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-[#8B5CF6]/15 flex items-center justify-center text-[#7C3AED] dark:text-[#8B5CF6]">
            <Minimize2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
              Historical Minimum
            </div>
            <div className="text-sm font-bold font-mono text-[#18181B] dark:text-[#EDEDF0]">
              {formatCurrency(minPrice, currency)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-[#8B5CF6]/15 flex items-center justify-center text-[#7C3AED] dark:text-[#8B5CF6]">
            <Maximize2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
              Historical Maximum
            </div>
            <div className="text-sm font-bold font-mono text-[#18181B] dark:text-[#EDEDF0]">
              {formatCurrency(maxPrice, currency)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-[#8B5CF6]/15 flex items-center justify-center text-[#7C3AED] dark:text-[#8B5CF6]">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
              High-Low Price Spread
            </div>
            <div className="text-sm font-bold font-mono text-[#18181B] dark:text-[#EDEDF0]">
              {formatCurrency(priceRange, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Price Change Leaderboard */}
      <div className="overflow-hidden rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
        <div className="px-5 py-3 border-b border-[#E4E4EB] dark:border-[#2E2E36] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
            Portfolio Inception-to-Date Performance Ranking
          </span>
          <span className="text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
            {stocks.length} stocks
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-[#17171B] border-b border-[#E4E4EB] dark:border-[#2E2E36] text-[#6B6B76] dark:text-[#9A9AA5] font-semibold">
                <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                <th className="py-2.5 px-4">Stock Name</th>
                <th className="py-2.5 px-3 text-right">Points</th>
                <th className="py-2.5 px-4 text-right">First Price</th>
                <th className="py-2.5 px-4 text-right">Latest Price</th>
                <th className="py-2.5 px-4 text-right">Absolute Change</th>
                <th className="py-2.5 px-4 text-right font-bold">Total Return %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4EB] dark:divide-[#2E2E36]">
              {allRanked.map(({ stock, change: c }, idx) => {
                const isPos = c.absoluteChange >= 0;
                const isSelected = stock.name.toLowerCase() === activeStock.name.toLowerCase();

                return (
                  <tr
                    key={stock.name}
                    className={`hover:bg-zinc-50 dark:hover:bg-[#24242B]/50 transition-colors ${
                      isSelected ? 'bg-violet-50/50 dark:bg-[#8B5CF6]/15' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 text-center font-mono font-medium text-[#6B6B76] dark:text-[#9A9AA5]">
                      #{idx + 1}
                    </td>

                    <td className="py-2.5 px-4 font-bold text-[#18181B] dark:text-[#EDEDF0]">
                      <button
                        type="button"
                        onClick={() => onSelectStockName(stock.name)}
                        className="hover:text-[#7C3AED] dark:hover:text-[#8B5CF6] font-mono transition-colors"
                      >
                        {stock.name}
                      </button>
                    </td>

                    <td className="py-2.5 px-3 text-right font-mono text-[#6B6B76] dark:text-[#9A9AA5]">
                      {c.points}
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono text-[#6B6B76] dark:text-[#9A9AA5]">
                      {formatCurrency(c.first, currency)}
                    </td>

                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-[#18181B] dark:text-[#EDEDF0]">
                      {formatCurrency(c.last, currency)}
                    </td>

                    <td
                      className={`py-2.5 px-4 text-right font-mono font-semibold ${
                        isPos ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#E11D48] dark:text-[#F43F5E]'
                      }`}
                    >
                      {formatSignedCurrency(c.absoluteChange, currency)}
                    </td>

                    <td
                      className={`py-2.5 px-4 text-right font-mono font-bold ${
                        isPos ? 'text-[#16A34A] dark:text-[#22C55E]' : 'text-[#E11D48] dark:text-[#F43F5E]'
                      }`}
                    >
                      {formatSignedPercent(c.percentChange)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
