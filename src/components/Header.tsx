/**
 * @file Header.tsx
 * Top header component styled with neutral charcoal and violet theme.
 * Primary accent: Violet (#8B5CF6 / #7C3AED).
 */

import React from 'react';
import { Sun, Moon, HelpCircle, Menu, X, TrendingUp } from 'lucide-react';
import { Currency } from '../types';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currency: Currency;
  onToggleCurrency: (c: Currency) => void;
  onOpenHowItWorks: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  stockCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  currency,
  onToggleCurrency,
  onOpenHowItWorks,
  mobileMenuOpen,
  onToggleMobileMenu,
  stockCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b transition-colors bg-white/95 dark:bg-[#17171B]/95 backdrop-blur-md border-[#E4E4EB] dark:border-[#2E2E36]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand & Academic Credential */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-[#6B6B76] hover:text-[#18181B] dark:text-[#9A9AA5] dark:hover:text-[#EDEDF0] hover:bg-zinc-100 dark:hover:bg-[#24242B] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2.5">
              {/* Violet Logo Icon */}
              <div className="w-9 h-9 rounded-xl bg-[#7C3AED] dark:bg-[#8B5CF6] flex items-center justify-center text-white shadow-xs shrink-0">
                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-[#18181B] dark:text-[#EDEDF0] tracking-tight truncate">
                    Stock Price Predictor
                  </h1>
                  <span className="hidden sm:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 dark:bg-[#8B5CF6]/15 dark:text-violet-300 border border-violet-200/60 dark:border-violet-500/30">
                    {stockCount} {stockCount === 1 ? 'Stock' : 'Stocks'}
                  </span>
                </div>
                <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] truncate">
                  CSE 213 – Advanced Java Programming | SRM University AP
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Zone */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Currency Selector */}
            <div className="inline-flex rounded-xl p-0.5 bg-zinc-100 dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36]">
              <button
                type="button"
                onClick={() => onToggleCurrency('INR')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  currency === 'INR'
                    ? 'bg-[#7C3AED] dark:bg-[#8B5CF6] text-white shadow-xs'
                    : 'text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#18181B] dark:hover:text-[#EDEDF0]'
                }`}
                title="Use Indian Rupee (₹)"
              >
                ₹ INR
              </button>
              <button
                type="button"
                onClick={() => onToggleCurrency('USD')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  currency === 'USD'
                    ? 'bg-[#7C3AED] dark:bg-[#8B5CF6] text-white shadow-xs'
                    : 'text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#18181B] dark:hover:text-[#EDEDF0]'
                }`}
                title="Use US Dollar ($)"
              >
                $ USD
              </button>
            </div>

            {/* How It Works Modal Trigger */}
            <button
              type="button"
              onClick={onOpenHowItWorks}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl text-[#18181B] dark:text-[#EDEDF0] hover:bg-zinc-100 dark:hover:bg-[#24242B] border border-[#E4E4EB] dark:border-[#2E2E36] transition-colors"
              title="Mathematical formulas and methodology"
            >
              <HelpCircle className="w-4 h-4 text-[#7C3AED] dark:text-[#8B5CF6]" />
              <span className="hidden sm:inline">How It Works</span>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#18181B] dark:hover:text-[#EDEDF0] hover:bg-zinc-100 dark:hover:bg-[#24242B] border border-[#E4E4EB] dark:border-[#2E2E36] transition-colors"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-700" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
