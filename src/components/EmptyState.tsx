/**
 * @file EmptyState.tsx
 * Redesigned EmptyState with violet primary CTA and neutral charcoal surfaces.
 */

import React from 'react';
import { PlusCircle, Database, HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  onGoToAdd: () => void;
  onLoadSampleData?: () => void;
  featureTitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onGoToAdd,
  onLoadSampleData,
  featureTitle,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-[#8B5CF6]/15 border border-violet-200 dark:border-violet-500/30 flex items-center justify-center text-[#7C3AED] dark:text-[#8B5CF6] mb-5 shadow-xs">
        <Database className="w-7 h-7" />
      </div>

      <h3 className="text-xl font-bold text-[#18181B] dark:text-[#EDEDF0] tracking-tight">
        No Stocks Defined Yet
      </h3>

      <p className="mt-2 text-sm text-[#6B6B76] dark:text-[#9A9AA5] leading-relaxed">
        {featureTitle ? `To use ${featureTitle}, ` : ''}
        you need to define at least one stock. In accordance with the CSE 213 project design, 
        all stock histories are supplied directly by you through pasting, manual entry, or CSV import.
      </p>

      <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={onGoToAdd}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Add Your First Stock
        </button>

        {onLoadSampleData && (
          <button
            type="button"
            onClick={onLoadSampleData}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#18181B] dark:text-[#EDEDF0] bg-zinc-100 hover:bg-zinc-200 dark:bg-[#1C1C21] dark:hover:bg-[#24242B] border border-[#E4E4EB] dark:border-[#2E2E36] transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-[#6B6B76] dark:text-[#9A9AA5]" />
            Load Sample Demo Stocks
          </button>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-[#E4E4EB] dark:border-[#2E2E36] text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
        <span>No external APIs</span>
        <span className="mx-2">·</span>
        <span>Persisted in browser localStorage</span>
        <span className="mx-2">·</span>
        <span>Zero tracking</span>
      </div>
    </div>
  );
};
