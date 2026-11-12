/**
 * @file AccuracyTab.tsx
 * Tab 5: Prediction Accuracy Backtesting.
 * Neutral charcoal & violet fintech aesthetic:
 * Violet training curve (#8B5CF6), Cyan actual value (#22D3EE), Amber predicted point (#F59E0B).
 */

import React, { useMemo } from 'react';
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
  AlertTriangle,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { Stock, Currency, ActiveTab } from '../../types';
import { formatCurrency } from '../../utils/storage';
import { calculateAccuracy, calculateSlope } from '../../stockMath';
import { EmptyState } from '../EmptyState';

interface AccuracyTabProps {
  stocks: Stock[];
  selectedStockName?: string;
  onSelectStockName: (name: string) => void;
  currency: Currency;
  onNavigateTab: (tab: ActiveTab, selectedStock?: string) => void;
  onLoadSampleData: () => void;
}

export const AccuracyTab: React.FC<AccuracyTabProps> = ({
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
        featureTitle="Prediction Accuracy"
      />
    );
  }

  const activeStock =
    stocks.find((s) => s.name.toLowerCase() === selectedStockName?.toLowerCase()) || stocks[0];

  const history = activeStock.history;
  const n = history.length;
  const accuracyResult = calculateAccuracy(history);

  const trainData = history.slice(0, -1);
  const trainSlope = trainData.length >= 2 ? calculateSlope(trainData) : 0;

  const chartData = useMemo(() => {
    if (n < 3) return [];

    const data: Array<{
      step: string;
      trainingPrice?: number;
      actualPrice?: number;
      predictedPrice?: number;
    }> = [];

    trainData.forEach((p, idx) => {
      data.push({
        step: `P${idx + 1}`,
        trainingPrice: p,
      });
    });

    const actual = history[n - 1];
    data.push({
      step: `P${n} (Test)`,
      actualPrice: actual,
      predictedPrice: accuracyResult.predicted,
    });

    return data;
  }, [history, trainData, n, accuracyResult]);

  const accScore = accuracyResult.accuracyPercent;
  const accColor =
    accScore >= 90
      ? 'text-[#16A34A] dark:text-[#22C55E]'
      : accScore >= 75
      ? 'text-[#7C3AED] dark:text-[#8B5CF6]'
      : accScore >= 50
      ? 'text-[#D97706] dark:text-[#F59E0B]'
      : 'text-[#E11D48] dark:text-[#F43F5E]';

  const progressBg =
    accScore >= 90
      ? 'bg-[#16A34A] dark:bg-[#22C55E]'
      : accScore >= 75
      ? 'bg-[#7C3AED] dark:bg-[#8B5CF6]'
      : accScore >= 50
      ? 'bg-[#D97706] dark:bg-[#F59E0B]'
      : 'bg-[#E11D48] dark:bg-[#F43F5E]';

  return (
    <div className="space-y-6">
      
      {/* Header & Stock Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E4EB] dark:border-[#2E2E36]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#EDEDF0] tracking-tight">
            Prediction Accuracy Backtesting
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Validating predictive performance by holding out the latest recorded price as a test set.
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

      {/* Guard: If fewer than 3 prices */}
      {!accuracyResult.canCalculate ? (
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-center max-w-lg mx-auto space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-[#D97706] dark:text-[#F59E0B]">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-amber-900 dark:text-amber-200">
            Insufficient Data for Backtesting
          </h3>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            The prediction accuracy algorithm requires at least <strong>3 prices</strong>: 
            points 1 to {n} for training the regression slope, and a final test point to compare against.
            Stock "{activeStock.name}" currently only has {n} {n === 1 ? 'price' : 'prices'}.
          </p>
          <button
            type="button"
            onClick={() => onNavigateTab('history', activeStock.name)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl text-white bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] transition-colors"
          >
            <span>Add More Prices in History Tab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          {/* 4 Core Metric KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Predicted Price */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
                Backtest Predicted
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#D97706] dark:text-[#F59E0B] mt-1">
                {formatCurrency(accuracyResult.predicted, currency)}
              </div>
              <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
                Model estimate on {trainData.length} training points
              </div>
            </div>

            {/* Actual Last Price */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
                Actual Ground Truth
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#7C3AED] dark:text-[#8B5CF6] mt-1">
                {formatCurrency(accuracyResult.actual, currency)}
              </div>
              <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
                True step P{n} price
              </div>
            </div>

            {/* Absolute Error */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
                Absolute Error |pred - actual|
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-[#18181B] dark:text-[#EDEDF0] mt-1">
                {formatCurrency(accuracyResult.error, currency)}
              </div>
              <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-1 font-mono">
                {((accuracyResult.error / accuracyResult.actual) * 100).toFixed(2)}% variance
              </div>
            </div>

            {/* Accuracy Score */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
                Accuracy Score
              </div>
              <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${accColor}`}>
                {accuracyResult.accuracyPercent.toFixed(2)}%
              </div>
              <div className="w-full bg-zinc-100 dark:bg-[#121214] h-2 rounded-full overflow-hidden mt-2">
                <div
                  className={`h-full ${progressBg} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(0, accuracyResult.accuracyPercent))}%` }}
                />
              </div>
            </div>

          </div>

          {/* Visual Backtest Chart */}
          <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#18181B] dark:text-[#EDEDF0]">
                  Train vs Test Split Visualization
                </h3>
                <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
                  Violet line: Training sequence (P1..P{n - 1}). Cyan dot marks Actual value; Amber dot marks Predicted.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22D3EE] inline-block" />
                  <span className="text-[#6B6B76] dark:text-[#9A9AA5]">Actual (P{n})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" />
                  <span className="text-[#6B6B76] dark:text-[#9A9AA5]">Predicted (P{n})</span>
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
                    dataKey="trainingPrice"
                    name="Training History"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ r: 3.5, fill: '#8B5CF6', stroke: '#FFFFFF', strokeWidth: 1.5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actualPrice"
                    name="Actual Value"
                    stroke="#22D3EE"
                    strokeWidth={0}
                    dot={{ r: 6, fill: '#22D3EE', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predictedPrice"
                    name="Backtest Predicted"
                    stroke="#F59E0B"
                    strokeWidth={0}
                    dot={{ r: 6, fill: '#F59E0B', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Methodology Formula Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#18181B] dark:text-[#EDEDF0] uppercase tracking-wider mb-2">
              <Calculator className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
              <span>Backtest Mathematical Verification</span>
            </div>
            <div className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] space-y-1.5 leading-relaxed font-mono">
              <div>1. Training Set: P1 to P{n - 1} ({trainData.length} samples) → Slope m = {trainSlope.toFixed(6)}</div>
              <div>2. Predicted P{n}: P{n - 1} ({trainData[trainData.length - 1].toFixed(2)}) + m = {accuracyResult.predicted.toFixed(2)}</div>
              <div>3. Actual P{n}: {accuracyResult.actual.toFixed(2)}</div>
              <div>4. Error = |{accuracyResult.predicted.toFixed(2)} - {accuracyResult.actual.toFixed(2)}| = {accuracyResult.error.toFixed(2)}</div>
              <div>5. Accuracy = max(0, 100 - ({accuracyResult.error.toFixed(2)} / {accuracyResult.actual.toFixed(2)} * 100)) = <strong className={accColor}>{accuracyResult.accuracyPercent.toFixed(2)}%</strong></div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
