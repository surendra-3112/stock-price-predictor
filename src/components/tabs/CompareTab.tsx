/**
 * @file CompareTab.tsx
 * Tab 9: Compare Two Stocks.
 * Neutral charcoal & violet fintech aesthetic:
 * - Stock A: Violet (#8B5CF6)
 * - Stock B: Cyan (#22D3EE)
 * - Overlaid chart normalized to 100 at the start with faint grid lines.
 */

import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  GitCompare,
  Award,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { Stock, Currency, ActiveTab } from '../../types';
import { formatCurrency, formatSignedPercent } from '../../utils/storage';
import {
  calculateSlope,
  predictNextPrice,
  getTrendLabel,
} from '../../stockMath';
import { EmptyState } from '../EmptyState';

interface CompareTabProps {
  stocks: Stock[];
  currency: Currency;
  onNavigateTab: (tab: ActiveTab, selectedStock?: string) => void;
  onLoadSampleData: () => void;
}

export const CompareTab: React.FC<CompareTabProps> = ({
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
        featureTitle="Compare Two Stocks"
      />
    );
  }

  if (stocks.length < 2) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] text-center max-w-lg mx-auto space-y-4 shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-[#8B5CF6]/15 flex items-center justify-center text-[#7C3AED] dark:text-[#8B5CF6] mx-auto">
          <GitCompare className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-[#18181B] dark:text-[#EDEDF0]">
          Comparison Requires At Least Two Stocks
        </h3>
        <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] leading-relaxed">
          You currently have 1 stock ("{stocks[0].name}"). Add another stock to compare trajectories,
          relative performance normalized to 100, and trend slopes.
        </p>
        <button
          type="button"
          onClick={() => onNavigateTab('add')}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Add Second Stock
        </button>
      </div>
    );
  }

  // Stock selectors
  const [stockAName, setStockAName] = useState(stocks[0].name);
  const [stockBName, setStockBName] = useState(stocks[1].name);

  const stockA = stocks.find((s) => s.name === stockAName) || stocks[0];
  const stockB = stocks.find((s) => s.name === stockBName) || stocks[1];

  const historyA = stockA.history;
  const latestA = historyA[historyA.length - 1];
  const slopeA = calculateSlope(historyA);
  const predA = predictNextPrice(historyA);
  const diffA = predA - latestA;
  const pctChangeA = latestA > 0 ? (diffA / latestA) * 100 : 0;
  const trendA = getTrendLabel(predA, latestA);

  const historyB = stockB.history;
  const latestB = historyB[historyB.length - 1];
  const slopeB = calculateSlope(historyB);
  const predB = predictNextPrice(historyB);
  const diffB = predB - latestB;
  const pctChangeB = latestB > 0 ? (diffB / latestB) * 100 : 0;
  const trendB = getTrendLabel(predB, latestB);

  const isSameSlope = Math.abs(slopeA - slopeB) < 1e-6;
  const strongerStock = slopeA > slopeB ? stockA : stockB;
  const strongerSlope = Math.max(slopeA, slopeB);
  const weakerSlope = Math.min(slopeA, slopeB);

  const maxLen = Math.max(historyA.length, historyB.length);
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 0; i < maxLen; i++) {
      const normA = i < historyA.length ? (historyA[i] / historyA[0]) * 100 : undefined;
      const normB = i < historyB.length ? (historyB[i] / historyB[0]) * 100 : undefined;

      data.push({
        step: `P${i + 1}`,
        rawIndex: i + 1,
        [stockA.name]: normA !== undefined ? parseFloat(normA.toFixed(2)) : undefined,
        [stockB.name]: normB !== undefined ? parseFloat(normB.toFixed(2)) : undefined,
      });
    }
    return data;
  }, [historyA, historyB, stockA.name, stockB.name, maxLen]);

  const isIdentical = stockA.name.toLowerCase() === stockB.name.toLowerCase();

  return (
    <div className="space-y-6">
      
      {/* Header & Stock Selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E4EB] dark:border-[#2E2E36]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#EDEDF0] tracking-tight">
            Compare Two Stocks
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Side-by-side metric comparison and normalized trajectory rebased to 100.
          </p>
        </div>

        {/* Dual Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] shrink-0" />
            <select
              value={stockA.name}
              onChange={(e) => setStockAName(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] focus:outline-none"
            >
              {stocks.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] font-semibold px-1">vs</span>

          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] shrink-0" />
            <select
              value={stockB.name}
              onChange={(e) => setStockBName(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] focus:outline-none"
            >
              {stocks.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Warning if identical stock selected */}
      {isIdentical && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B] shrink-0" />
          <span>You have selected the same stock for both columns. Pick two different stocks to compare relative strength.</span>
        </div>
      )}

      {/* Primary Trend Strength Banner */}
      {!isIdentical && (
        <div className="p-4 rounded-xl bg-violet-50 dark:bg-[#8B5CF6]/15 border border-violet-200/80 dark:border-violet-500/30 flex items-start sm:items-center gap-3 shadow-xs">
          <Award className="w-5 h-5 text-[#7C3AED] dark:text-[#8B5CF6] shrink-0 mt-0.5 sm:mt-0" />
          <div className="text-xs sm:text-sm text-[#18181B] dark:text-[#EDEDF0] leading-relaxed">
            {isSameSlope ? (
              <span>
                Both stocks exhibit identical slope gradients (<code className="font-mono font-bold">{slopeA.toFixed(4)}</code>).
              </span>
            ) : (
              <span>
                <strong>{strongerStock.name}</strong> exhibits the stronger upward trend with a linear regression slope of{' '}
                <code className="font-mono font-bold text-[#7C3AED] dark:text-[#8B5CF6]">
                  {strongerSlope > 0 ? `+${strongerSlope.toFixed(4)}` : strongerSlope.toFixed(4)}
                </code>{' '}
                compared to{' '}
                <code className="font-mono text-[#6B6B76] dark:text-[#9A9AA5]">
                  {weakerSlope > 0 ? `+${weakerSlope.toFixed(4)}` : weakerSlope.toFixed(4)}
                </code>{' '}
                for {strongerStock.name === stockA.name ? stockB.name : stockA.name}.
              </span>
            )}
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Stock A Card (Violet Accent) */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#8B5CF6]/50 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E4EB] dark:border-[#2E2E36]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#8B5CF6]" />
              <h3 className="text-lg font-bold text-[#18181B] dark:text-[#EDEDF0] font-mono">
                {stockA.name}
              </h3>
            </div>
            <span className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] font-mono">
              {historyA.length} data points
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
              <span className="text-[#6B6B76] dark:text-[#9A9AA5] uppercase text-[10px] font-semibold">Latest Price</span>
              <div className="text-base font-bold font-mono text-[#18181B] dark:text-[#EDEDF0] mt-0.5">
                {formatCurrency(latestA, currency)}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
              <span className="text-[#6B6B76] dark:text-[#9A9AA5] uppercase text-[10px] font-semibold">Trend Slope</span>
              <div className="text-base font-bold font-mono text-[#7C3AED] dark:text-[#8B5CF6] mt-0.5">
                {slopeA > 0 ? `+${slopeA.toFixed(4)}` : slopeA.toFixed(4)}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
              <span className="text-[#6B6B76] dark:text-[#9A9AA5] uppercase text-[10px] font-semibold">Predicted Next</span>
              <div className="text-base font-bold font-mono text-[#7C3AED] dark:text-[#8B5CF6] mt-0.5">
                {formatCurrency(predA, currency)}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
              <span className="text-[#6B6B76] dark:text-[#9A9AA5] uppercase text-[10px] font-semibold">Forecasted % Change</span>
              <div className="text-base font-bold font-mono text-[#18181B] dark:text-[#EDEDF0] mt-0.5">
                {formatSignedPercent(pctChangeA)}
              </div>
            </div>
          </div>
        </div>

        {/* Stock B Card (Cyan Accent) */}
        <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#22D3EE]/50 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E4E4EB] dark:border-[#2E2E36]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#22D3EE]" />
              <h3 className="text-lg font-bold text-[#18181B] dark:text-[#EDEDF0] font-mono">
                {stockB.name}
              </h3>
            </div>
            <span className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] font-mono">
              {historyB.length} data points
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
              <span className="text-[#6B6B76] dark:text-[#9A9AA5] uppercase text-[10px] font-semibold">Latest Price</span>
              <div className="text-base font-bold font-mono text-[#18181B] dark:text-[#EDEDF0] mt-0.5">
                {formatCurrency(latestB, currency)}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
              <span className="text-[#6B6B76] dark:text-[#9A9AA5] uppercase text-[10px] font-semibold">Trend Slope</span>
              <div className="text-base font-bold font-mono text-[#0891B2] dark:text-[#22D3EE] mt-0.5">
                {slopeB > 0 ? `+${slopeB.toFixed(4)}` : slopeB.toFixed(4)}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
              <span className="text-[#6B6B76] dark:text-[#9A9AA5] uppercase text-[10px] font-semibold">Predicted Next</span>
              <div className="text-base font-bold font-mono text-[#0891B2] dark:text-[#22D3EE] mt-0.5">
                {formatCurrency(predB, currency)}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
              <span className="text-[#6B6B76] dark:text-[#9A9AA5] uppercase text-[10px] font-semibold">Forecasted % Change</span>
              <div className="text-base font-bold font-mono text-[#18181B] dark:text-[#EDEDF0] mt-0.5">
                {formatSignedPercent(pctChangeB)}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Normalized Overlay Chart (Rebased to 100) */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#18181B] dark:text-[#EDEDF0]">
              Normalized Comparative Performance (Base = 100 at P1)
            </h3>
            <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
              Removes nominal currency scale differences so growth trajectories can be compared directly.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#8B5CF6] inline-block" />
              <span className="text-[#18181B] dark:text-[#EDEDF0] font-bold">{stockA.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#22D3EE] inline-block" />
              <span className="text-[#18181B] dark:text-[#EDEDF0] font-bold">{stockB.name}</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#6B6B76" opacity={0.15} />
              <XAxis dataKey="step" stroke="#6B6B76" tick={{ fontSize: 11, fill: '#6B6B76' }} />
              <YAxis
                stroke="#6B6B76"
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#6B6B76' }}
                tickFormatter={(val) => `${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C21] text-[#18181B] dark:text-[#EDEDF0] text-xs shadow-xl border border-[#E4E4EB] dark:border-[#2E2E36] space-y-1">
                        <div className="font-semibold text-[#6B6B76] dark:text-[#9A9AA5]">{label}</div>
                        {payload.map((entry) => (
                          <div key={entry.name} className="flex justify-between gap-4 font-mono">
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-bold">
                              {entry.value !== undefined ? `${entry.value}` : 'N/A'}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={100} stroke="#6B6B76" strokeDasharray="3 3" opacity={0.35} />
              <Line
                type="monotone"
                dataKey={stockA.name}
                stroke="#8B5CF6"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#8B5CF6', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey={stockB.name}
                stroke="#22D3EE"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#22D3EE', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
