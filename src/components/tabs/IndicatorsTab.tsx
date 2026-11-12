/**
 * @file IndicatorsTab.tsx
 * Tab 2: Technical Indicators with neutral charcoal & violet theme.
 * SMA in violet (#8B5CF6), EMA in cyan (#22D3EE),
 * and semantic Gain Green / Loss Red metrics.
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
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { Stock, Currency, ActiveTab } from '../../types';
import { formatCurrency } from '../../utils/storage';
import {
  calculateSMA,
  calculateEMA,
  calculateMomentum,
  calculateSlope,
} from '../../stockMath';
import { EmptyState } from '../EmptyState';

interface IndicatorsTabProps {
  stocks: Stock[];
  selectedStockName?: string;
  onSelectStockName: (name: string) => void;
  currency: Currency;
  onNavigateTab: (tab: ActiveTab, selectedStock?: string) => void;
  onLoadSampleData: () => void;
}

export const IndicatorsTab: React.FC<IndicatorsTabProps> = ({
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
        featureTitle="Technical Indicators"
      />
    );
  }

  const activeStock =
    stocks.find((s) => s.name.toLowerCase() === selectedStockName?.toLowerCase()) || stocks[0];

  const history = activeStock.history;
  const n = history.length;
  const latestPrice = history[n - 1];

  const [smaPeriod, setSmaPeriod] = useState<number>(5);
  const [emaPeriod, setEmaPeriod] = useState<number>(5);
  const [momentumPeriod, setMomentumPeriod] = useState<number>(3);

  const isSmaValid = smaPeriod > 0 && n >= smaPeriod;
  const isEmaValid = emaPeriod > 0 && n >= emaPeriod;
  const isMomentumValid = momentumPeriod > 0 && n > momentumPeriod;

  const smaVal = isSmaValid ? calculateSMA(history, smaPeriod) : 0;
  const emaVal = isEmaValid ? calculateEMA(history, emaPeriod) : 0;
  const momentumVal = isMomentumValid ? calculateMomentum(history, momentumPeriod) : 0;
  const slopeVal = calculateSlope(history);

  const chartData = useMemo(() => {
    return history.map((price, idx) => {
      const sub = history.slice(0, idx + 1);
      const subLen = sub.length;
      
      const sma = smaPeriod > 0 && subLen >= smaPeriod ? calculateSMA(sub, smaPeriod) : undefined;
      const ema = emaPeriod > 0 && subLen >= emaPeriod ? calculateEMA(sub, emaPeriod) : undefined;

      return {
        step: `P${idx + 1}`,
        price,
        sma,
        ema,
      };
    });
  }, [history, smaPeriod, emaPeriod]);

  return (
    <div className="space-y-6">
      
      {/* Header & Stock Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E4EB] dark:border-[#2E2E36]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#EDEDF0] tracking-tight">
            Technical Indicators
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            SMA, EMA, Momentum, and Slope metrics calculated with customizable periods.
          </p>
        </div>

        {/* Stock Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#6B6B76] dark:text-[#9A9AA5] whitespace-nowrap">
            Selected Stock:
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

      {/* Period Configuration Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#18181B] dark:text-[#EDEDF0] uppercase tracking-wider">
          <Sliders className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
          <span>Indicator Parameter Tuning (History length: {n} points)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* SMA Period */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
              <span className="font-semibold text-[#18181B] dark:text-[#EDEDF0]">SMA Period (p)</span>
              <span className="text-[11px]">Default: 5</span>
            </div>
            <input
              type="number"
              min={1}
              max={100}
              value={smaPeriod}
              onChange={(e) => setSmaPeriod(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-zinc-50 dark:bg-[#121214] border border-[#E4E4EB] dark:border-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {/* EMA Period */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
              <span className="font-semibold text-[#18181B] dark:text-[#EDEDF0]">EMA Period (p)</span>
              <span className="text-[11px]">Default: 5</span>
            </div>
            <input
              type="number"
              min={1}
              max={100}
              value={emaPeriod}
              onChange={(e) => setEmaPeriod(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-zinc-50 dark:bg-[#121214] border border-[#E4E4EB] dark:border-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {/* Momentum Period */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
              <span className="font-semibold text-[#18181B] dark:text-[#EDEDF0]">Momentum Period (p)</span>
              <span className="text-[11px]">Default: 3</span>
            </div>
            <input
              type="number"
              min={1}
              max={100}
              value={momentumPeriod}
              onChange={(e) => setMomentumPeriod(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-xl bg-zinc-50 dark:bg-[#121214] border border-[#E4E4EB] dark:border-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

        </div>
      </div>

      {/* Primary Indicator Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Latest Price */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
            Latest Price
          </div>
          <div className="text-xl font-bold font-mono text-[#18181B] dark:text-[#EDEDF0] mt-1">
            {formatCurrency(latestPrice, currency)}
          </div>
          <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Current anchor quote
          </div>
        </div>

        {/* SMA */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5] flex items-center justify-between">
            <span>SMA ({smaPeriod})</span>
            {isSmaValid && <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5CF6]" />}
          </div>
          {isSmaValid ? (
            <>
              <div className="text-xl font-bold font-mono text-[#7C3AED] dark:text-[#8B5CF6] mt-1">
                {formatCurrency(smaVal, currency)}
              </div>
              <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
                Avg of last {smaPeriod} prices
              </div>
            </>
          ) : (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-[#D97706] dark:bg-amber-950/60 dark:text-[#F59E0B] border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-3 h-3" />
                Not enough data
              </span>
              <p className="text-[10px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
                Needs ≥ {smaPeriod} prices (has {n})
              </p>
            </div>
          )}
        </div>

        {/* EMA */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5] flex items-center justify-between">
            <span>EMA ({emaPeriod})</span>
            {isEmaValid && <CheckCircle2 className="w-3.5 h-3.5 text-[#22D3EE]" />}
          </div>
          {isEmaValid ? (
            <>
              <div className="text-xl font-bold font-mono text-[#0891B2] dark:text-[#22D3EE] mt-1">
                {formatCurrency(emaVal, currency)}
              </div>
              <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
                Weight k = {(2 / (emaPeriod + 1)).toFixed(3)}
              </div>
            </>
          ) : (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-[#D97706] dark:bg-amber-950/60 dark:text-[#F59E0B] border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-3 h-3" />
                Not enough data
              </span>
              <p className="text-[10px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
                Needs ≥ {emaPeriod} prices (has {n})
              </p>
            </div>
          )}
        </div>

        {/* Momentum */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5] flex items-center justify-between">
            <span>Momentum ({momentumPeriod})</span>
            {isMomentumValid && <CheckCircle2 className="w-3.5 h-3.5 text-[#8B5CF6]" />}
          </div>
          {isMomentumValid ? (
            <>
              <div
                className={`text-xl font-bold font-mono mt-1 ${
                  momentumVal > 0
                    ? 'text-[#16A34A] dark:text-[#22C55E]'
                    : momentumVal < 0
                    ? 'text-[#E11D48] dark:text-[#F43F5E]'
                    : 'text-[#D97706] dark:text-[#F59E0B]'
                }`}
              >
                {momentumVal > 0 ? `+${momentumVal.toFixed(2)}` : momentumVal.toFixed(2)}
              </div>
              <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
                vs step P{n - momentumPeriod}
              </div>
            </>
          ) : (
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-[#D97706] dark:bg-amber-950/60 dark:text-[#F59E0B] border border-amber-200 dark:border-amber-800">
                <AlertTriangle className="w-3 h-3" />
                Not enough data
              </span>
              <p className="text-[10px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
                Needs &gt; {momentumPeriod} prices (has {n})
              </p>
            </div>
          )}
        </div>

        {/* Trend Slope */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
            Trend Slope (m)
          </div>
          <div
            className={`text-xl font-bold font-mono mt-1 ${
              slopeVal > 0
                ? 'text-[#16A34A] dark:text-[#22C55E]'
                : slopeVal < 0
                ? 'text-[#E11D48] dark:text-[#F43F5E]'
                : 'text-[#18181B] dark:text-[#EDEDF0]'
            }`}
          >
            {slopeVal > 0 ? `+${slopeVal.toFixed(4)}` : slopeVal.toFixed(4)}
          </div>
          <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Full OLS regression slope
          </div>
        </div>

      </div>

      {/* Technical Indicators Overlay Chart */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#18181B] dark:text-[#EDEDF0]">
              Price with SMA & EMA Overlays
            </h3>
            <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
              Comparing closing prices against moving average smoothing curves.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#6B6B76] inline-block" />
              <span className="text-[#6B6B76] dark:text-[#9A9AA5]">Price</span>
            </div>
            {isSmaValid && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#8B5CF6] inline-block" />
                <span className="text-[#6B6B76] dark:text-[#9A9AA5]">SMA ({smaPeriod})</span>
              </div>
            )}
            {isEmaValid && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#22D3EE] inline-block" />
                <span className="text-[#6B6B76] dark:text-[#9A9AA5]">EMA ({emaPeriod})</span>
              </div>
            )}
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#6B6B76" opacity={0.15} />
              <XAxis dataKey="step" stroke="#6B6B76" tick={{ fontSize: 11, fill: '#6B6B76' }} />
              <YAxis
                stroke="#6B6B76"
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#6B6B76' }}
                tickFormatter={(val) => `${currency === 'INR' ? '₹' : '$'}${val}`}
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
                              {formatCurrency(entry.value as number, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="price"
                name="Price"
                stroke="#6B6B76"
                strokeWidth={1.8}
                dot={{ r: 3 }}
              />
              {isSmaValid && (
                <Line
                  type="monotone"
                  dataKey="sma"
                  name={`SMA (${smaPeriod})`}
                  stroke="#8B5CF6"
                  strokeWidth={2.2}
                  dot={false}
                  connectNulls={false}
                />
              )}
              {isEmaValid && (
                <Line
                  type="monotone"
                  dataKey="ema"
                  name={`EMA (${emaPeriod})`}
                  stroke="#22D3EE"
                  strokeWidth={2.2}
                  dot={false}
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
