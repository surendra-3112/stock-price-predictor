/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @file DeleteTab.tsx
 * Tab 10: Delete Stock with fintech analytics styling.
 * Red exclusively for delete/warning destructive operations,
 * paired with dark #1C1C21 and light #FFFFFF panels.
 */

import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  ShieldAlert,
} from 'lucide-react';
import { Stock, Currency, ActiveTab } from '../../types';
import { formatCurrency } from '../../utils/storage';
import { EmptyState } from '../EmptyState';

interface DeleteTabProps {
  stocks: Stock[];
  onDeleteStock: (name: string) => void;
  onClearAllStocks: () => void;
  currency: Currency;
  onNavigateTab: (tab: ActiveTab, selectedStock?: string) => void;
  onLoadSampleData: () => void;
}

export const DeleteTab: React.FC<DeleteTabProps> = ({
  stocks,
  onDeleteStock,
  onClearAllStocks,
  currency,
  onNavigateTab,
  onLoadSampleData,
}) => {
  const [stockToDelete, setStockToDelete] = useState<Stock | null>(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  if (stocks.length === 0) {
    return (
      <EmptyState
        onGoToAdd={() => onNavigateTab('add')}
        onLoadSampleData={onLoadSampleData}
        featureTitle="Delete Stock"
      />
    );
  }

  const confirmDeleteIndividual = () => {
    if (stockToDelete) {
      onDeleteStock(stockToDelete.name);
      setStockToDelete(null);
    }
  };

  const confirmClearAll = () => {
    onClearAllStocks();
    setShowClearAllModal(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header & Dangerous Clear All */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E4EB] dark:border-[#2E2E36]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#EDEDF0] tracking-tight">
            Manage & Delete Stocks
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Remove individual stocks from localStorage or reset the entire portfolio database.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowClearAllModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-[#E11D48] hover:bg-rose-700 dark:bg-[#F43F5E] dark:hover:bg-[#E11D48] shadow-xs transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear All Stocks
        </button>
      </div>

      {/* Stock Cards / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {stocks.map((stock) => {
          const latestPrice = stock.history[stock.history.length - 1];
          return (
            <div
              key={stock.name}
              className="p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs flex items-center justify-between gap-4 hover:border-rose-300 dark:hover:border-rose-900/50 transition-colors"
            >
              <div className="min-w-0">
                <h3 className="text-base font-bold text-[#18181B] dark:text-[#EDEDF0] truncate font-mono">
                  {stock.name}
                </h3>
                <div className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] mt-0.5 space-x-2">
                  <span>{stock.history.length} price points</span>
                  <span>·</span>
                  <span className="font-mono text-[#18181B] dark:text-[#EDEDF0]">{formatCurrency(latestPrice, currency)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStockToDelete(stock)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl text-[#E11D48] dark:text-[#F43F5E] bg-rose-50 hover:bg-rose-100 dark:bg-[#F43F5E]/10 dark:hover:bg-[#F43F5E]/20 border border-rose-200 dark:border-[#F43F5E]/30 transition-colors shrink-0"
                title={`Delete ${stock.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal: Delete Individual */}
      {stockToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#121214]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setStockToDelete(null)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1C1C21] rounded-2xl shadow-2xl border border-[#E4E4EB] dark:border-[#2E2E36] p-6 z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950/80 flex items-center justify-center text-[#E11D48] dark:text-[#F43F5E] shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#18181B] dark:text-[#EDEDF0]">
                  Delete Stock "{stockToDelete.name}"?
                </h3>
                <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] mt-0.5">
                  This action is permanent and will remove {stockToDelete.history.length} price points.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] leading-relaxed">
              Are you sure you want to remove <strong className="text-[#18181B] dark:text-[#EDEDF0]">{stockToDelete.name}</strong> from your local storage? 
              This stock and its associated history will be deleted.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStockToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-[#18181B] dark:text-[#EDEDF0] bg-neutral-100 hover:bg-neutral-200 dark:bg-[#17171B] dark:hover:bg-[#24242B] border border-[#E4E4EB] dark:border-[#2E2E36] rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteIndividual}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#E11D48] hover:bg-rose-700 dark:bg-[#F43F5E] dark:hover:bg-[#E11D48] rounded-xl transition-colors shadow-xs"
              >
                Yes, Delete Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear ALL */}
      {showClearAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#121214]/80 backdrop-blur-xs transition-opacity"
            onClick={() => setShowClearAllModal(false)}
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1C1C21] rounded-2xl shadow-2xl border border-rose-300 dark:border-rose-900/80 p-6 z-10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-950 flex items-center justify-center text-[#E11D48] dark:text-[#F43F5E] shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#E11D48] dark:text-[#F43F5E]">
                  Clear All Portfolio Stocks?
                </h3>
                <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] mt-0.5">
                  Wipes all {stocks.length} stocks from browser storage.
                </p>
              </div>
            </div>

            <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] leading-relaxed">
              This will irreversibly delete all defined stocks and their recorded price histories. 
              You will need to manually re-enter or re-import your stocks.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowClearAllModal(false)}
                className="px-4 py-2 text-xs font-medium text-[#18181B] dark:text-[#EDEDF0] bg-neutral-100 hover:bg-neutral-200 dark:bg-[#17171B] dark:hover:bg-[#24242B] border border-[#E4E4EB] dark:border-[#2E2E36] rounded-xl transition-colors"
              >
                Keep Stocks
              </button>
              <button
                type="button"
                onClick={confirmClearAll}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#E11D48] hover:bg-rose-700 dark:bg-[#F43F5E] dark:hover:bg-[#E11D48] rounded-xl transition-colors shadow-xs"
              >
                Clear Everything
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

