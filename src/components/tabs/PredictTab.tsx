/**
 * @file PredictTab.tsx
 * Tab 3: Predict Next Price.
 * Violet history line with gradient fill (#8B5CF6), Amber forecast line (#F59E0B),
 * neutral charcoal cards (#1C1C21), and faint grid lines.
 */

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Info,
} from 'lucide-react';
import { Stock, Currency, ActiveTab } from '../../types';
import { formatCurrency, formatSignedCurrency, formatSignedPercent } from '../../utils/storage';
import { predictNextPrice, calculateSlope, getTrendLabel } from '../../stockMath';
import { EmptyState } from '../EmptyState';

interface PredictTabProps {
  stocks: Stock[];
  selectedStockName?: string;
  onSelectStockName: (name: string) => void;
  currency: Currency;
  onNavigateTab: (tab: ActiveTab, selectedStock?: string) => void;
  onLoadSampleData: () => void;
}

export const PredictTab: React.FC<PredictTabProps> = ({
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
        featureTitle="Predict Next Price"
      />
    );
  }

  const activeStock =
    stocks.find((s) => s.name.toLowerCase() === selectedStockName?.toLowerCase()) || stocks[0];

  const history = activeStock.history;
  const currentPrice = history[history.length - 1];
  const slope = calculateSlope(history);
  const predictedPrice = predictNextPrice(history);
  const diff = predictedPrice - currentPrice;
  const percentChange = currentPrice > 0 ? (diff / currentPrice) * 100 : 0;
  const trend = getTrendLabel(predictedPrice, currentPrice);

  const chartData = useMemo(() => {
    const data: Array<{
      step: string;
      rawIndex: number;
      price?: number;
      fillPrice?: number;
      predictedPrice?: number;
      isForecast?: boolean;
    }> = [];

    history.forEach((p, idx) => {
      const isLast = idx === history.length - 1;
      data.push({
        step: `P${idx + 1}`,
        rawIndex: idx + 1,
        price: p,
        fillPrice: p,
        predictedPrice: isLast ? p : undefined,
        isForecast: false,
      });
    });

    data.push({
      step: `P${history.length + 1} (Pred)`,
      rawIndex: history.length + 1,
      predictedPrice: predictedPrice,
      isForecast: true,
    });

    return data;
  }, [history, predictedPrice]);

  const isUp = trend === 'Upward';
  const isDown = trend === 'Downward';

  const badgeStyles = isUp
    ? 'bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/60 dark:text-[#22C55E] border-emerald-200 dark:border-emerald-800'
    : isDown
    ? 'bg-rose-50 text-[#E11D48] dark:bg-rose-950/60 dark:text-[#F43F5E] border-rose-200 dark:border-rose-800'
    : 'bg-amber-50 text-[#D97706] dark:bg-amber-950/60 dark:text-[#F59E0B] border-amber-200 dark:border-amber-800';

  return (
    <div className="space-y-6">
      
      {/* Stock Selector & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E4EB] dark:border-[#2E2E36]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#EDEDF0] tracking-tight">
            Predict Next Price
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Linear regression trend extrapolation based on CSE 213 algorithmic formulas.
          </p>
        </div>

        {/* Stock Selector Dropdown */}
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

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Current Price */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
            Current Price
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-[#18181B] dark:text-[#EDEDF0] mt-1">
            {formatCurrency(currentPrice, currency)}
          </div>
          <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-0.5">
            Step P{history.length}
          </div>
        </div>

        {/* Predicted Next Price */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7C3AED] dark:text-[#8B5CF6] flex items-center justify-between">
            <span>Predicted Next</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${
              isUp
                ? 'text-[#16A34A] dark:text-[#22C55E]'
                : isDown
                ? 'text-[#E11D48] dark:text-[#F43F5E]'
                : 'text-[#D97706] dark:text-[#F59E0B]'
            }`}
          >
            {formatCurrency(predictedPrice, currency)}
          </div>
          <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-0.5">
            Step P{history.length + 1}
          </div>
        </div>

        {/* Difference & % Change */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
            Expected Change
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold font-mono mt-1 flex items-center gap-1 ${
              isUp
                ? 'text-[#16A34A] dark:text-[#22C55E]'
                : isDown
                ? 'text-[#E11D48] dark:text-[#F43F5E]'
                : 'text-[#D97706] dark:text-[#F59E0B]'
            }`}
          >
            {isUp && <ArrowUpRight className="w-5 h-5 shrink-0" />}
            {isDown && <ArrowDownRight className="w-5 h-5 shrink-0" />}
            <span>{formatSignedCurrency(diff, currency)}</span>
          </div>
          <div className="text-xs font-mono font-medium mt-0.5 text-[#6B6B76] dark:text-[#9A9AA5]">
            ({formatSignedPercent(percentChange)})
          </div>
        </div>

        {/* Trend Label Badge */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
            Trend Direction
          </div>
          <div className="mt-1">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${badgeStyles}`}
            >
              {isUp && <TrendingUp className="w-4 h-4" />}
              {isDown && <TrendingDown className="w-4 h-4" />}
              {!isUp && !isDown && <Minus className="w-4 h-4" />}
              <span>{trend} Trend</span>
            </span>
          </div>
          <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] font-mono mt-1">
            Slope: {slope > 0 ? `+${slope.toFixed(4)}` : slope.toFixed(4)}
          </div>
        </div>

      </div>

      {/* Visual Chart with Soft Area Violet Gradient & Amber Forecast Line */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#18181B] dark:text-[#EDEDF0]">
              Price Trajectory & Forecast Projection
            </h3>
            <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
              Solid violet line with soft gradient fill shows historical data; dashed amber line projects the predicted step.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#8B5CF6] inline-block" />
              <span className="text-[#6B6B76] dark:text-[#9A9AA5]">History (#8B5CF6)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-[#F59E0B] inline-block" />
              <span className="text-[#6B6B76] dark:text-[#9A9AA5]">Forecast Step P{history.length + 1} (#F59E0B)</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#6B6B76"
                opacity={0.15}
              />
              <XAxis
                dataKey="step"
                stroke="#6B6B76"
                tick={{ fontSize: 11, fill: '#6B6B76' }}
              />
              <YAxis
                stroke="#6B6B76"
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#6B6B76' }}
                tickFormatter={(val) => `${currency === 'INR' ? '₹' : '$'}${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isPred = data.isForecast;
                    const val = isPred ? data.predictedPrice : data.price;
                    return (
                      <div className="p-3 rounded-xl bg-white dark:bg-[#1C1C21] text-[#18181B] dark:text-[#EDEDF0] text-xs shadow-xl border border-[#E4E4EB] dark:border-[#2E2E36] space-y-1">
                        <div className="font-semibold text-[#6B6B76] dark:text-[#9A9AA5]">
                          {label}
                        </div>
                        <div className={`font-mono text-sm font-bold ${isPred ? 'text-[#F59E0B]' : 'text-[#8B5CF6]'}`}>
                          {formatCurrency(val, currency)}
                        </div>
                        <div className="text-[10px] text-[#6B6B76] dark:text-[#9A9AA5]">
                          {isPred ? 'Predicted via OLS linear slope' : 'Historical verified closing price'}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Soft area gradient fill for history */}
              <Area
                type="monotone"
                dataKey="fillPrice"
                stroke="none"
                fill="url(#violetGradient)"
                isAnimationActive={false}
              />
              {/* Historical Solid Line (Violet #8B5CF6) */}
              <Line
                type="monotone"
                dataKey="price"
                name="Historical Price"
                stroke="#8B5CF6"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#8B5CF6', strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />
              {/* Forecast Dashed Line (Amber #F59E0B) */}
              <Line
                type="monotone"
                dataKey="predictedPrice"
                name="Predicted Price"
                stroke="#F59E0B"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 5, fill: '#F59E0B', strokeWidth: 2, stroke: '#FFFFFF' }}
                connectNulls={true}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Footer info note */}
        <div className="mt-4 pt-3 border-t border-[#E4E4EB] dark:border-[#2E2E36] flex items-start gap-2 text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
          <Info className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6] shrink-0 mt-0.5" />
          <div>
            <strong>Linear Slope Calculation:</strong> <code className="font-mono text-[11px] text-[#18181B] dark:text-[#EDEDF0]">m = {slope.toFixed(6)}</code>. 
            Predicted price formula: <code className="font-mono text-[11px] text-[#18181B] dark:text-[#EDEDF0]">last_price ({currentPrice.toFixed(2)}) + slope = {predictedPrice.toFixed(2)}</code>.
          </div>
        </div>
      </div>

    </div>
  );
};
