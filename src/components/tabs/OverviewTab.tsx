/**
 * @file OverviewTab.tsx
 * All Stocks Overview cards with neutral charcoal & violet fintech styling.
 * Gain Green (#22C55E/#16A34A), Loss Red (#F43F5E/#E11D48), Amber Flat (#F59E0B),
 * and Violet primary accents.
 */

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  PlusCircle,
  Eye,
  Activity,
  History,
} from 'lucide-react';
import { Stock, Currency, ActiveTab } from '../../types';
import { formatCurrency, formatSignedPercent } from '../../utils/storage';
import { predictNextPrice, calculateSlope, getTrendLabel, calculatePriceChange } from '../../stockMath';
import { EmptyState } from '../EmptyState';

interface OverviewTabProps {
  stocks: Stock[];
  currency: Currency;
  onNavigateTab: (tab: ActiveTab, selectedStock?: string) => void;
  onLoadSampleData: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stocks,
  currency,
  onNavigateTab,
  onLoadSampleData,
}) => {
  if (stocks.length === 0) {
    return (
      <EmptyState
        onGoToAdd={() => onNavigateTab('add')}
        onLoadSampleData={onLoadSampleData}
        featureTitle="All Stocks Overview"
      />
    );
  }

  const stockSummaries = stocks.map((stock) => {
    const history = stock.history;
    const latest = history[history.length - 1];
    const predicted = predictNextPrice(history);
    const slope = calculateSlope(history);
    const trend = getTrendLabel(predicted, latest);
    const change = calculatePriceChange(history);
    return { stock, latest, predicted, slope, trend, change };
  });

  const upwardCount = stockSummaries.filter((s) => s.trend === 'Upward').length;
  const downwardCount = stockSummaries.filter((s) => s.trend === 'Downward').length;
  const flatCount = stockSummaries.filter((s) => s.trend === 'Flat').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E4EB] dark:border-[#2E2E36]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#EDEDF0] tracking-tight">
            All Stocks Overview
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Visual portfolio snapshot showing current trajectories, prices, and sparklines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('add')}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] shadow-xs transition-colors shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add Another Stock
        </button>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
            Total Stocks
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#EDEDF0] font-mono mt-1">
            {stocks.length}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#16A34A] dark:text-[#22C55E]">
            Upward Trend
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#16A34A] dark:text-[#22C55E] font-mono mt-1 flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5" />
            <span>{upwardCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#E11D48] dark:text-[#F43F5E]">
            Downward Trend
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#E11D48] dark:text-[#F43F5E] font-mono mt-1 flex items-center gap-1.5">
            <TrendingDown className="w-5 h-5" />
            <span>{downwardCount}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#D97706] dark:text-[#F59E0B]">
            Neutral / Flat
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#D97706] dark:text-[#F59E0B] font-mono mt-1 flex items-center gap-1.5">
            <Minus className="w-5 h-5" />
            <span>{flatCount}</span>
          </div>
        </div>
      </div>

      {/* Grid of Stock Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stockSummaries.map(({ stock, latest, predicted, slope, trend, change }) => {
          const isUp = trend === 'Upward';
          const isDown = trend === 'Downward';
          const trendBg = isUp
            ? 'bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/60 dark:text-[#22C55E] border-emerald-200 dark:border-emerald-800'
            : isDown
            ? 'bg-rose-50 text-[#E11D48] dark:bg-rose-950/60 dark:text-[#F43F5E] border-rose-200 dark:border-rose-800'
            : 'bg-amber-50 text-[#D97706] dark:bg-amber-950/60 dark:text-[#F59E0B] border-amber-200 dark:border-amber-800';

          return (
            <div
              key={stock.name}
              className="flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs hover:border-[#7C3AED]/50 dark:hover:border-[#8B5CF6]/50 transition-all"
            >
              <div>
                {/* Header: Name and Trend Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-[#18181B] dark:text-[#EDEDF0] truncate font-mono">
                      {stock.name}
                    </h3>
                    <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-0.5">
                      {stock.history.length} price points recorded
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border shrink-0 ${trendBg}`}
                  >
                    {isUp && <TrendingUp className="w-3.5 h-3.5" />}
                    {isDown && <TrendingDown className="w-3.5 h-3.5" />}
                    {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
                    <span>{trend}</span>
                  </span>
                </div>

                {/* Price & Change details */}
                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
                      Latest Price
                    </span>
                    <div className="text-xl font-bold font-mono text-[#18181B] dark:text-[#EDEDF0]">
                      {formatCurrency(latest, currency)}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
                      Predicted Next
                    </span>
                    <div
                      className={`text-base font-bold font-mono ${
                        isUp
                          ? 'text-[#16A34A] dark:text-[#22C55E]'
                          : isDown
                          ? 'text-[#E11D48] dark:text-[#F43F5E]'
                          : 'text-[#D97706] dark:text-[#F59E0B]'
                      }`}
                    >
                      {formatCurrency(predicted, currency)}
                    </div>
                  </div>
                </div>

                {/* Mini Sparkline Visualization */}
                <div className="mt-4 pt-3 border-t border-[#E4E4EB] dark:border-[#2E2E36]">
                  <div className="flex items-center justify-between text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mb-1.5">
                    <span>Trajectory (oldest → latest)</span>
                    <span className={change.absoluteChange >= 0 ? 'text-[#16A34A] dark:text-[#22C55E] font-mono font-medium' : 'text-[#E11D48] dark:text-[#F43F5E] font-mono font-medium'}>
                      {formatSignedPercent(change.percentChange)}
                    </span>
                  </div>
                  <MiniSparkline data={stock.history} isUp={isUp} isDown={isDown} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-[#E4E4EB] dark:border-[#2E2E36] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('predict', stock.name)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-[#7C3AED] dark:text-violet-300 bg-violet-50 dark:bg-[#8B5CF6]/15 hover:bg-violet-100 dark:hover:bg-[#8B5CF6]/25 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Predict
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('indicators', stock.name)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-[#18181B] dark:text-[#EDEDF0] bg-zinc-100 hover:bg-zinc-200 dark:bg-[#17171B] dark:hover:bg-[#24242B] transition-colors"
                >
                  <Activity className="w-3.5 h-3.5" />
                  Indicators
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab('history', stock.name)}
                  className="inline-flex items-center justify-center p-1.5 text-xs font-medium rounded-xl text-[#6B6B76] hover:text-[#18181B] dark:text-[#9A9AA5] dark:hover:text-[#EDEDF0] hover:bg-zinc-100 dark:hover:bg-[#17171B] transition-colors"
                  title="View and edit price history"
                >
                  <History className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

function MiniSparkline({ data, isUp, isDown }: { data: number[]; isUp: boolean; isDown: boolean }) {
  if (data.length < 2) {
    return <div className="h-9 w-full bg-zinc-100 dark:bg-[#17171B] rounded" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 280;
  const height = 40;
  const padding = 4;

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const strokeColor = isUp ? '#22C55E' : isDown ? '#F43F5E' : '#F59E0B';

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-9 stroke-[2] fill-none"
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}
