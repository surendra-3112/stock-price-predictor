/**
 * @file Sidebar.tsx
 * Left navigation sidebar styled with neutral charcoal and violet theme.
 * Active item: Violet (#8B5CF6 / #7C3AED).
 */

import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  TrendingUp,
  Activity,
  History,
  Target,
  FileSpreadsheet,
  ArrowUpDown,
  GitCompare,
  Trash2,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  stockCount: number;
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'All Stocks Overview', icon: LayoutDashboard },
  { id: 'add', label: 'Add / Load Stock', icon: PlusCircle },
  { id: 'predict', label: 'Predict Next Price', icon: TrendingUp },
  { id: 'indicators', label: 'Technical Indicators', icon: Activity },
  { id: 'history', label: 'Price History', icon: History },
  { id: 'accuracy', label: 'Prediction Accuracy', icon: Target },
  { id: 'forecast', label: 'Forecast Report', icon: FileSpreadsheet },
  { id: 'price-change', label: 'Price Change', icon: ArrowUpDown },
  { id: 'compare', label: 'Compare Two Stocks', icon: GitCompare },
  { id: 'delete', label: 'Delete Stock', icon: Trash2 },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  stockCount,
  mobileMenuOpen,
  onCloseMobileMenu,
}) => {
  const handleSelect = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobileMenu();
  };

  const navContent = (
    <div className="flex flex-col h-full py-4">
      <div className="px-3 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B6B76] dark:text-[#9A9AA5] px-3">
          Predictor Modules
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                isActive
                  ? 'bg-[#7C3AED] dark:bg-[#8B5CF6] text-white shadow-xs'
                  : 'text-[#6B6B76] dark:text-[#9A9AA5] hover:bg-zinc-100 dark:hover:bg-[#24242B] hover:text-[#18181B] dark:hover:text-[#EDEDF0]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-[#6B6B76] dark:text-[#9A9AA5]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.id === 'overview' && stockCount > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                    isActive
                      ? 'bg-violet-900/60 text-white'
                      : 'bg-zinc-200 dark:bg-[#24242B] text-[#18181B] dark:text-[#EDEDF0]'
                  }`}
                >
                  {stockCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Info Box in Sidebar */}
      <div className="mt-auto px-3 pt-3 border-t border-[#E4E4EB] dark:border-[#2E2E36]">
        <div className="p-3 rounded-xl bg-zinc-50 dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36]">
          <p className="text-xs font-semibold text-[#18181B] dark:text-[#EDEDF0]">
            SRM AP CSE 213
          </p>
          <p className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5] mt-0.5 leading-relaxed">
            Pure client-side Advanced Java algorithmic translation. Zero external APIs.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-[#E4E4EB] dark:border-[#2E2E36] bg-white dark:bg-[#17171B] h-[calc(100vh-4rem)] sticky top-16 transition-colors">
        {navContent}
      </aside>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#121214]/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobileMenu}
          />
          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#17171B] h-full shadow-2xl flex flex-col z-50 border-r border-[#E4E4EB] dark:border-[#2E2E36]">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
