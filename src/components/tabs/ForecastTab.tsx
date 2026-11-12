/**
 * @file ForecastTab.tsx
 * Tab 6: Forecast Report with neutral charcoal & violet theme.
 * Violet CSV download action, semantic gain/loss table metrics, and clean borders.
 */

import React, { useState } from 'react';
import {
  Download,
  Printer,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { Stock, Currency, ActiveTab } from '../../types';
import { formatCurrency } from '../../utils/storage';
import {
  calculateSMA,
  calculateEMA,
  calculateMomentum,
  calculateSlope,
  predictNextPrice,
  getTrendLabel,
} from '../../stockMath';
import { EmptyState } from '../EmptyState';

interface ForecastTabProps {
  stocks: Stock[];
  currency: Currency;
  onNavigateTab: (tab: ActiveTab, selectedStock?: string) => void;
  onLoadSampleData: () => void;
}

export const ForecastTab: React.FC<ForecastTabProps> = ({
  stocks,
  currency,
  onNavigateTab,
  onLoadSampleData,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (stocks.length === 0) {
    return (
      <EmptyState
        onGoToAdd={() => onNavigateTab('add')}
        onLoadSampleData={onLoadSampleData}
        featureTitle="Forecast Report"
      />
    );
  }

  const reports = stocks.map((stock) => {
    const history = stock.history;
    const n = history.length;
    const latest = history[n - 1];
    const sma5 = n >= 5 ? calculateSMA(history, 5) : null;
    const ema5 = n >= 5 ? calculateEMA(history, 5) : null;
    const mom3 = n > 3 ? calculateMomentum(history, 3) : null;
    const slope = calculateSlope(history);
    const predicted = predictNextPrice(history);
    const trend = getTrendLabel(predicted, latest);

    return {
      name: stock.name,
      points: n,
      latest,
      sma5,
      ema5,
      mom3,
      slope,
      predicted,
      trend,
    };
  });

  const filtered = reports.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const handleDownloadCSV = () => {
    const headers = [
      'Stock Name',
      'Data Points',
      `Latest Price (${currency})`,
      'SMA (5)',
      'EMA (5)',
      'Momentum (3)',
      'Slope',
      `Predicted Next (${currency})`,
      'Trend Direction',
    ];

    const rows = reports.map((r) => [
      `"${r.name.replace(/"/g, '""')}"`,
      r.points,
      r.latest.toFixed(2),
      r.sma5 !== null ? r.sma5.toFixed(2) : 'N/A',
      r.ema5 !== null ? r.ema5.toFixed(2) : 'N/A',
      r.mom3 !== null ? r.mom3.toFixed(2) : 'N/A',
      r.slope.toFixed(6),
      r.predicted.toFixed(2),
      r.trend,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stock_forecast_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E4EB] dark:border-[#2E2E36] no-print">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#EDEDF0] tracking-tight">
            Portfolio Forecast Report
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Consolidated table of latest prices, technical indicators, regression slopes, and future forecasts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download as CSV
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl text-[#18181B] dark:text-[#EDEDF0] bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1C1C21] dark:hover:bg-[#24242B] border border-[#E4E4EB] dark:border-[#2E2E36] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 no-print">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#6B6B76] dark:text-[#9A9AA5] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search stock name..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] placeholder:text-[#6B6B76]/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
          />
        </div>
        <span className="text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
          Showing {filtered.length} of {reports.length} stocks
        </span>
      </div>

      {/* Printable Area Header */}
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-bold text-black">Stock Price Predictor — Forecast Report</h1>
        <p className="text-xs text-neutral-600">
          CSE 213 SRM University AP Algorithmic Summary · Generated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Comprehensive Report Table */}
      <div className="overflow-hidden rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs print:border-neutral-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-[#17171B] border-b border-[#E4E4EB] dark:border-[#2E2E36] text-[#6B6B76] dark:text-[#9A9AA5] font-semibold print:bg-neutral-100 print:text-black">
                <th className="py-3 px-4">Stock Name</th>
                <th className="py-3 px-3 text-right">Points</th>
                <th className="py-3 px-4 text-right">Latest Price</th>
                <th className="py-3 px-3 text-right">SMA (5)</th>
                <th className="py-3 px-3 text-right">EMA (5)</th>
                <th className="py-3 px-3 text-right">Momentum (3)</th>
                <th className="py-3 px-3 text-right">Slope (m)</th>
                <th className="py-3 px-4 text-right font-bold text-[#18181B] dark:text-[#EDEDF0]">Predicted Next</th>
                <th className="py-3 px-4 text-center">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4EB] dark:divide-[#2E2E36] print:divide-neutral-200">
              {filtered.map((r) => {
                const isUp = r.trend === 'Upward';
                const isDown = r.trend === 'Downward';

                return (
                  <tr
                    key={r.name}
                    className="hover:bg-zinc-50 dark:hover:bg-[#24242B]/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-[#18181B] dark:text-[#EDEDF0]">
                      <button
                        type="button"
                        onClick={() => onNavigateTab('predict', r.name)}
                        className="hover:text-[#7C3AED] dark:hover:text-[#8B5CF6] text-left transition-colors font-mono"
                      >
                        {r.name}
                      </button>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[#6B6B76] dark:text-[#9A9AA5]">
                      {r.points}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-semibold text-[#18181B] dark:text-[#EDEDF0]">
                      {formatCurrency(r.latest, currency)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[#18181B] dark:text-[#EDEDF0]">
                      {r.sma5 !== null ? formatCurrency(r.sma5, currency) : <span className="text-[#6B6B76] dark:text-[#9A9AA5] italic">N/A</span>}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[#18181B] dark:text-[#EDEDF0]">
                      {r.ema5 !== null ? formatCurrency(r.ema5, currency) : <span className="text-[#6B6B76] dark:text-[#9A9AA5] italic">N/A</span>}
                    </td>

                    <td className="py-3 px-3 text-right font-mono">
                      {r.mom3 !== null ? (
                        <span className={r.mom3 > 0 ? 'text-[#16A34A] dark:text-[#22C55E]' : r.mom3 < 0 ? 'text-[#E11D48] dark:text-[#F43F5E]' : 'text-[#6B6B76]'}>
                          {r.mom3 > 0 ? `+${r.mom3.toFixed(2)}` : r.mom3.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[#6B6B76] dark:text-[#9A9AA5] italic">N/A</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-[#18181B] dark:text-[#EDEDF0]">
                      {r.slope > 0 ? `+${r.slope.toFixed(4)}` : r.slope.toFixed(4)}
                    </td>

                    <td
                      className={`py-3 px-4 text-right font-mono font-bold ${
                        isUp
                          ? 'text-[#16A34A] dark:text-[#22C55E]'
                          : isDown
                          ? 'text-[#E11D48] dark:text-[#F43F5E]'
                          : 'text-[#D97706] dark:text-[#F59E0B]'
                      }`}
                    >
                      {formatCurrency(r.predicted, currency)}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${
                          isUp
                            ? 'bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/60 dark:text-[#22C55E] border-emerald-200 dark:border-emerald-800'
                            : isDown
                            ? 'bg-rose-50 text-[#E11D48] dark:bg-rose-950/60 dark:text-[#F43F5E] border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 text-[#D97706] dark:bg-amber-950/60 dark:text-[#F59E0B] border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {isUp && <TrendingUp className="w-3 h-3" />}
                        {isDown && <TrendingDown className="w-3 h-3" />}
                        {!isUp && !isDown && <Minus className="w-3 h-3" />}
                        <span>{r.trend}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] text-center pt-2">
        <span>* SMA and EMA default to 5-period windows; Momentum defaults to 3-period offset.</span>
      </div>

    </div>
  );
};
