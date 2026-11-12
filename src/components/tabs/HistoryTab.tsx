/**
 * @file HistoryTab.tsx
 * Tab 4: Price History.
 * Neutral charcoal & violet theme:
 * Violet chart line (#8B5CF6) with soft gradient fill,
 * Gain green (#22C55E/#16A34A) and Loss red (#F43F5E/#E11D48) deltas.
 */

import React, { useState, useMemo } from 'react';
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
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Stock, Currency, ActiveTab } from '../../types';
import { formatCurrency, formatSignedCurrency, formatSignedPercent } from '../../utils/storage';
import { EmptyState } from '../EmptyState';

interface HistoryTabProps {
  stocks: Stock[];
  selectedStockName?: string;
  onSelectStockName: (name: string) => void;
  onUpdateStock: (updatedStock: Stock) => void;
  currency: Currency;
  onNavigateTab: (tab: ActiveTab, selectedStock?: string) => void;
  onLoadSampleData: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  stocks,
  selectedStockName,
  onSelectStockName,
  onUpdateStock,
  currency,
  onNavigateTab,
  onLoadSampleData,
}) => {
  if (stocks.length === 0) {
    return (
      <EmptyState
        onGoToAdd={() => onNavigateTab('add')}
        onLoadSampleData={onLoadSampleData}
        featureTitle="Price History"
      />
    );
  }

  const activeStock =
    stocks.find((s) => s.name.toLowerCase() === selectedStockName?.toLowerCase()) || stocks[0];

  const history = activeStock.history;

  const [newPriceInput, setNewPriceInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAppendPrice = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const val = parseFloat(newPriceInput.trim());
    if (isNaN(val) || !Number.isFinite(val) || val <= 0) {
      setErrorMsg('Price must be a valid positive number (> 0).');
      return;
    }

    const updatedHistory = [...history, val];
    onUpdateStock({
      ...activeStock,
      history: updatedHistory,
    });
    setNewPriceInput('');
  };

  const handleStartEdit = (idx: number, currentVal: number) => {
    setEditingIndex(idx);
    setEditingValue(currentVal.toString());
    setErrorMsg(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingValue('');
    setErrorMsg(null);
  };

  const handleSaveEdit = (idx: number) => {
    const val = parseFloat(editingValue.trim());
    if (isNaN(val) || !Number.isFinite(val) || val <= 0) {
      setErrorMsg('Updated price must be a valid positive number (> 0).');
      return;
    }

    const updatedHistory = [...history];
    updatedHistory[idx] = val;
    onUpdateStock({
      ...activeStock,
      history: updatedHistory,
    });
    setEditingIndex(null);
    setEditingValue('');
    setErrorMsg(null);
  };

  const handleDeletePrice = (idx: number) => {
    if (history.length <= 2) {
      setErrorMsg('Cannot delete price: A stock must have at least 2 price points for trend calculations.');
      return;
    }

    const updatedHistory = history.filter((_, i) => i !== idx);
    onUpdateStock({
      ...activeStock,
      history: updatedHistory,
    });
    if (editingIndex === idx) {
      setEditingIndex(null);
    }
    setErrorMsg(null);
  };

  const chartData = useMemo(() => {
    return history.map((price, idx) => ({
      step: `P${idx + 1}`,
      price,
      fillPrice: price,
    }));
  }, [history]);

  return (
    <div className="space-y-6">
      
      {/* Header & Stock Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E4EB] dark:border-[#2E2E36]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#EDEDF0] tracking-tight">
            Price History & Data Editor
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Review recorded chronological prices, inspect step changes, edit values, or append updates.
          </p>
        </div>

        {/* Stock Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-[#6B6B76] dark:text-[#9A9AA5] whitespace-nowrap">
            Selected Stock:
          </label>
          <select
            value={activeStock.name}
            onChange={(e) => {
              onSelectStockName(e.target.value);
              setEditingIndex(null);
              setErrorMsg(null);
            }}
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

      {/* Error alert banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#E11D48] dark:text-[#F43F5E] shrink-0 mt-0.5" />
          <div className="text-xs text-[#E11D48] dark:text-[#F43F5E] font-medium">
            {errorMsg}
          </div>
        </div>
      )}

      {/* Price Chart with violet gradient fill */}
      <div className="p-5 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
        <h3 className="text-sm font-bold text-[#18181B] dark:text-[#EDEDF0] mb-3">
          Historical Curve ({history.length} data points)
        </h3>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="historyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#6B6B76" opacity={0.15} />
              <XAxis dataKey="step" stroke="#6B6B76" tick={{ fontSize: 11, fill: '#6B6B76' }} />
              <YAxis
                stroke="#64748B"
                domain={['auto', 'auto']}
                tick={{ fontSize: 11, fill: '#6B6B76' }}
                tickFormatter={(val) => `${currency === 'INR' ? '₹' : '$'}${val}`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#1C1C21] text-[#18181B] dark:text-[#EDEDF0] text-xs shadow-xl border border-[#E4E4EB] dark:border-[#2E2E36]">
                        <div className="font-semibold text-[#6B6B76] dark:text-[#9A9AA5]">{label}</div>
                        <div className="font-mono text-sm font-bold text-[#8B5CF6] mt-0.5">
                          {formatCurrency(payload[0].value as number, currency)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="fillPrice" stroke="none" fill="url(#historyFill)" isAnimationActive={false} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#8B5CF6"
                strokeWidth={2.2}
                dot={{ r: 3.5, fill: '#8B5CF6', stroke: '#FFFFFF', strokeWidth: 1.5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Append New Price Form */}
      <div className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
        <form onSubmit={handleAppendPrice} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="text-xs font-semibold text-[#18181B] dark:text-[#EDEDF0] whitespace-nowrap">
            Append New Price (Step P{history.length + 1}):
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="number"
              step="any"
              value={newPriceInput}
              onChange={(e) => setNewPriceInput(e.target.value)}
              placeholder="e.g. 158.75"
              className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-[#121214] border border-[#E4E4EB] dark:border-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-xl text-white bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Append Price
            </button>
          </div>
        </form>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
        <div className="px-5 py-3 border-b border-[#E4E4EB] dark:border-[#2E2E36] flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5]">
            Recorded Price Sequence
          </span>
          <span className="text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
            {history.length} price points
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-[#17171B] border-b border-[#E4E4EB] dark:border-[#2E2E36] text-[#6B6B76] dark:text-[#9A9AA5]">
                <th className="py-2.5 px-4 font-semibold w-20">Index</th>
                <th className="py-2.5 px-4 font-semibold">Recorded Price</th>
                <th className="py-2.5 px-4 font-semibold">Change vs Previous</th>
                <th className="py-2.5 px-4 font-semibold text-right w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E4EB] dark:divide-[#2E2E36]">
              {history.map((price, idx) => {
                const prevPrice = idx > 0 ? history[idx - 1] : null;
                const change = prevPrice !== null ? price - prevPrice : null;
                const pctChange = prevPrice !== null && prevPrice > 0 ? (change! / prevPrice) * 100 : null;
                const isEditing = editingIndex === idx;

                return (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-50 dark:hover:bg-[#24242B]/50 transition-colors"
                  >
                    <td className="py-2.5 px-4 font-mono font-medium text-[#6B6B76] dark:text-[#9A9AA5]">
                      P{idx + 1}
                    </td>

                    <td className="py-2.5 px-4">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 max-w-[160px]">
                          <input
                            type="number"
                            step="any"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(idx);
                              if (e.key === 'Escape') handleCancelEdit();
                            }}
                            autoFocus
                            className="w-full px-2 py-1 text-xs font-mono font-bold rounded-lg bg-zinc-100 dark:bg-[#121214] border border-[#8B5CF6] text-[#18181B] dark:text-[#EDEDF0] focus:outline-none"
                          />
                        </div>
                      ) : (
                        <span className="font-mono font-bold text-[#18181B] dark:text-[#EDEDF0]">
                          {formatCurrency(price, currency)}
                        </span>
                      )}
                    </td>

                    {/* Semantic Change: Green for gain, Red for loss */}
                    <td className="py-2.5 px-4 font-mono">
                      {change === null ? (
                        <span className="text-[#6B6B76] dark:text-[#9A9AA5] italic">Baseline</span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-1 ${
                            change > 0
                              ? 'text-[#16A34A] dark:text-[#22C55E] font-medium'
                              : change < 0
                              ? 'text-[#E11D48] dark:text-[#F43F5E] font-medium'
                              : 'text-[#6B6B76]'
                          }`}
                        >
                          {change > 0 ? <ArrowUp className="w-3 h-3" /> : change < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                          <span>{formatSignedCurrency(change, currency)}</span>
                          <span className="text-[11px] opacity-80">({formatSignedPercent(pctChange!)})</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(idx)}
                            className="p-1 rounded bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-950 dark:text-violet-300 transition-colors"
                            title="Save"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1 rounded bg-zinc-100 text-[#6B6B76] hover:bg-zinc-200 dark:bg-[#121214] dark:text-[#9A9AA5] transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(idx, price)}
                            className="p-1 rounded text-[#6B6B76] hover:text-[#18181B] dark:text-[#9A9AA5] dark:hover:text-[#EDEDF0] hover:bg-zinc-100 dark:hover:bg-[#24242B] transition-colors"
                            title="Edit price"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePrice(idx)}
                            className="p-1 rounded text-[#6B6B76] hover:text-[#E11D48] dark:hover:text-[#F43F5E] hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete price"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
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
