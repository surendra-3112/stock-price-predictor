/**
 * @file HowItWorksModal.tsx
 * Modal explaining mathematical formulas with neutral charcoal and violet styling.
 */

import React from 'react';
import { X, BookOpen, Sigma, Compass, BarChart3, Target, Calculator } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#121214]/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1C1C21] rounded-2xl shadow-2xl border border-[#E4E4EB] dark:border-[#2E2E36] overflow-hidden my-8 z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E4EB] dark:border-[#2E2E36] shrink-0 bg-white dark:bg-[#17171B]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-[#8B5CF6]/15 flex items-center justify-center text-[#7C3AED] dark:text-[#8B5CF6]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#18181B] dark:text-[#EDEDF0]">
                How It Works: Core Algorithms
              </h2>
              <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
                CSE 213 Advanced Java Programming Specification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#6B6B76] hover:text-[#18181B] dark:text-[#9A9AA5] dark:hover:text-[#EDEDF0] hover:bg-zinc-100 dark:hover:bg-[#24242B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-[#18181B] dark:text-[#EDEDF0]">
          
          <p className="text-xs leading-relaxed text-[#6B6B76] dark:text-[#9A9AA5]">
            This application is a full graphical interface for the CSE 213 project. 
            All mathematical calculations are performed strictly client-side using deterministic, 
            pure Java equivalent functions.
          </p>

          {/* 1. Simple Moving Average */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-[#18181B] dark:text-[#EDEDF0]">
              <Calculator className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
              <span>1. Simple Moving Average (SMA)</span>
            </div>
            <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] leading-relaxed mb-2">
              Computes the unweighted arithmetic mean of the last <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] font-mono text-[11px]">p</code> prices.
            </p>
            <div className="p-2.5 bg-white dark:bg-[#121214] rounded-xl font-mono text-xs text-[#18181B] dark:text-[#EDEDF0] border border-[#E4E4EB] dark:border-[#2E2E36]">
              SMA(d, p) = (d[n-p] + d[n-p+1] + ... + d[n-1]) / p
            </div>
            <p className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-2">
              If p ≤ 0 or history length &lt; p, returns 0.
            </p>
          </div>

          {/* 2. Exponential Moving Average */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-[#18181B] dark:text-[#EDEDF0]">
              <Sigma className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
              <span>2. Exponential Moving Average (EMA)</span>
            </div>
            <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] leading-relaxed mb-2">
              Weights recent prices more heavily. The smoothing weight factor is <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] font-mono text-[11px]">k = 2 / (p + 1)</code>.
            </p>
            <div className="p-2.5 bg-white dark:bg-[#121214] rounded-xl font-mono text-xs text-[#18181B] dark:text-[#EDEDF0] border border-[#E4E4EB] dark:border-[#2E2E36] space-y-1">
              <div>Seed: EMA₀ = SMA of first p prices</div>
              <div>Iteration (for i = p to n-1): EMAᵢ = (d[i] - EMAᵢ₋₁) * k + EMAᵢ₋₁</div>
            </div>
          </div>

          {/* 3. Momentum */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-[#18181B] dark:text-[#EDEDF0]">
              <Compass className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
              <span>3. Momentum</span>
            </div>
            <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] leading-relaxed mb-2">
              Measures the velocity of price change by comparing the latest price with the price <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] font-mono text-[11px]">p</code> steps ago.
            </p>
            <div className="p-2.5 bg-white dark:bg-[#121214] rounded-xl font-mono text-xs text-[#18181B] dark:text-[#EDEDF0] border border-[#E4E4EB] dark:border-[#2E2E36]">
              Momentum(d, p) = d[n-1] - d[n-1-p]
            </div>
          </div>

          {/* 4. Linear Regression Slope & PredictNext */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-[#18181B] dark:text-[#EDEDF0]">
              <BarChart3 className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
              <span>4. Trend Slope & Prediction</span>
            </div>
            <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] leading-relaxed mb-2">
              Fits an Ordinary Least Squares line through all historical points with indices <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] font-mono text-[11px]">x = 0..n-1</code>:
            </p>
            <div className="p-2.5 bg-white dark:bg-[#121214] rounded-xl font-mono text-xs text-[#18181B] dark:text-[#EDEDF0] border border-[#E4E4EB] dark:border-[#2E2E36] space-y-1">
              <div>Slope = (n*Σxy - Σx*Σy) / (n*Σx² - (Σx)²)</div>
              <div>PredictNext(d) = d[last] + Slope</div>
            </div>
            <p className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-2">
              Trend rules: predicted &gt; last: <span className="text-[#16A34A] dark:text-[#22C55E] font-semibold">Upward</span>; predicted &lt; last: <span className="text-[#E11D48] dark:text-[#F43F5E] font-semibold">Downward</span>; equal: <span className="text-[#D97706] dark:text-[#F59E0B] font-semibold">Flat</span>.
            </p>
          </div>

          {/* 5. Backtest Accuracy */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36]">
            <div className="flex items-center gap-2 mb-2 font-semibold text-[#18181B] dark:text-[#EDEDF0]">
              <Target className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
              <span>5. Backtesting Prediction Accuracy</span>
            </div>
            <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] leading-relaxed mb-2">
              Validates model predictive fidelity without data snooping. Uses all points up to <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] font-mono text-[11px]">n-2</code> as training data to predict the final point <code className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] font-mono text-[11px]">n-1</code>, then checks error:
            </p>
            <div className="p-2.5 bg-white dark:bg-[#121214] rounded-xl font-mono text-xs text-[#18181B] dark:text-[#EDEDF0] border border-[#E4E4EB] dark:border-[#2E2E36] space-y-1">
              <div>Error = |Predicted - Actual|</div>
              <div>Accuracy % = max(0, 100 - (Error / Actual) * 100)</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E4E4EB] dark:border-[#2E2E36] bg-zinc-50 dark:bg-[#17171B] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#18181B] dark:text-[#EDEDF0] bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] rounded-xl hover:bg-zinc-100 dark:hover:bg-[#24242B] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
