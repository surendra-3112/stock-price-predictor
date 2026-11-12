/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Stock, Currency, ActiveTab } from './types';
import {
  loadStoredStocks,
  saveStoredStocks,
  loadStoredCurrency,
  saveStoredCurrency,
  loadStoredTheme,
  saveStoredTheme,
} from './utils/storage';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { HowItWorksModal } from './components/HowItWorksModal';

// Feature Tabs
import { OverviewTab } from './components/tabs/OverviewTab';
import { AddStockTab } from './components/tabs/AddStockTab';
import { PredictTab } from './components/tabs/PredictTab';
import { IndicatorsTab } from './components/tabs/IndicatorsTab';
import { HistoryTab } from './components/tabs/HistoryTab';
import { AccuracyTab } from './components/tabs/AccuracyTab';
import { ForecastTab } from './components/tabs/ForecastTab';
import { PriceChangeTab } from './components/tabs/PriceChangeTab';
import { CompareTab } from './components/tabs/CompareTab';
import { DeleteTab } from './components/tabs/DeleteTab';

export default function App() {
  const [stocks, setStocks] = useState<Stock[]>(() => loadStoredStocks());
  const [currency, setCurrency] = useState<Currency>(() => loadStoredCurrency());
  const [theme, setTheme] = useState<'dark' | 'light'>(() => loadStoredTheme());
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedStockName, setSelectedStockName] = useState<string>('');
  
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  useEffect(() => {
    saveStoredStocks(stocks);
    if (stocks.length > 0) {
      const exists = stocks.some(
        (s) => s.name.toLowerCase() === selectedStockName.toLowerCase()
      );
      if (!exists) {
        setSelectedStockName(stocks[0].name);
      }
    } else {
      setSelectedStockName('');
    }
  }, [stocks, selectedStockName]);

  useEffect(() => {
    saveStoredCurrency(currency);
  }, [currency]);

  const handleAddStock = (newStock: Stock) => {
    setStocks((prev) => {
      const filtered = prev.filter(
        (s) => s.name.toLowerCase() !== newStock.name.toLowerCase()
      );
      return [...filtered, newStock];
    });
    setSelectedStockName(newStock.name);
  };

  const handleUpdateStock = (updatedStock: Stock) => {
    setStocks((prev) =>
      prev.map((s) =>
        s.name.toLowerCase() === updatedStock.name.toLowerCase() ? updatedStock : s
      )
    );
  };

  const handleDeleteStock = (name: string) => {
    setStocks((prev) =>
      prev.filter((s) => s.name.toLowerCase() !== name.toLowerCase())
    );
  };

  const handleClearAllStocks = () => {
    setStocks([]);
    setSelectedStockName('');
  };

  const handleLoadSampleDemoStocks = () => {
    const demoStocks: Stock[] = [
      {
        name: 'RELIANCE',
        history: [2410, 2435, 2420, 2465, 2480, 2475, 2510, 2535, 2560, 2590],
        addedAt: Date.now() - 300000,
        notes: 'Sample Indian Conglomerate',
      },
      {
        name: 'TCS',
        history: [3500, 3520, 3510, 3540, 3530, 3565, 3580, 3610, 3640],
        addedAt: Date.now() - 200000,
        notes: 'Sample IT Services Leader',
      },
      {
        name: 'INFY',
        history: [1520, 1505, 1490, 1480, 1495, 1470, 1460, 1450, 1435],
        addedAt: Date.now() - 100000,
        notes: 'Sample Tech Firm (Downtrend)',
      },
    ];

    setStocks(demoStocks);
    setSelectedStockName(demoStocks[0].name);
    setActiveTab('overview');
  };

  const handleNavigateTab = (tab: ActiveTab, stockName?: string) => {
    if (stockName) {
      setSelectedStockName(stockName);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F9] dark:bg-[#121214] text-[#18181B] dark:text-[#EDEDF0] transition-colors">
      
      {/* Top Header */}
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        currency={currency}
        onToggleCurrency={(c) => setCurrency(c)}
        onOpenHowItWorks={() => setHowItWorksOpen(true)}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((o) => !o)}
        stockCount={stocks.length}
      />

      {/* Main Layout Area: Sidebar + Active Tab Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          stockCount={stocks.length}
          mobileMenuOpen={mobileMenuOpen}
          onCloseMobileMenu={() => setMobileMenuOpen(false)}
        />

        {/* Dynamic Tab Content Body */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          
          {activeTab === 'overview' && (
            <OverviewTab
              stocks={stocks}
              currency={currency}
              onNavigateTab={handleNavigateTab}
              onLoadSampleData={handleLoadSampleDemoStocks}
            />
          )}

          {activeTab === 'add' && (
            <AddStockTab
              stocks={stocks}
              onAddStock={handleAddStock}
              currency={currency}
              onNavigateTab={handleNavigateTab}
            />
          )}

          {activeTab === 'predict' && (
            <PredictTab
              stocks={stocks}
              selectedStockName={selectedStockName}
              onSelectStockName={setSelectedStockName}
              currency={currency}
              onNavigateTab={handleNavigateTab}
              onLoadSampleData={handleLoadSampleDemoStocks}
            />
          )}

          {activeTab === 'indicators' && (
            <IndicatorsTab
              stocks={stocks}
              selectedStockName={selectedStockName}
              onSelectStockName={setSelectedStockName}
              currency={currency}
              onNavigateTab={handleNavigateTab}
              onLoadSampleData={handleLoadSampleDemoStocks}
            />
          )}

          {activeTab === 'history' && (
            <HistoryTab
              stocks={stocks}
              selectedStockName={selectedStockName}
              onSelectStockName={setSelectedStockName}
              onUpdateStock={handleUpdateStock}
              currency={currency}
              onNavigateTab={handleNavigateTab}
              onLoadSampleData={handleLoadSampleDemoStocks}
            />
          )}

          {activeTab === 'accuracy' && (
            <AccuracyTab
              stocks={stocks}
              selectedStockName={selectedStockName}
              onSelectStockName={setSelectedStockName}
              currency={currency}
              onNavigateTab={handleNavigateTab}
              onLoadSampleData={handleLoadSampleDemoStocks}
            />
          )}

          {activeTab === 'forecast' && (
            <ForecastTab
              stocks={stocks}
              currency={currency}
              onNavigateTab={handleNavigateTab}
              onLoadSampleData={handleLoadSampleDemoStocks}
            />
          )}

          {activeTab === 'price-change' && (
            <PriceChangeTab
              stocks={stocks}
              selectedStockName={selectedStockName}
              onSelectStockName={setSelectedStockName}
              currency={currency}
              onNavigateTab={handleNavigateTab}
              onLoadSampleData={handleLoadSampleDemoStocks}
            />
          )}

          {activeTab === 'compare' && (
            <CompareTab
              stocks={stocks}
              currency={currency}
              onNavigateTab={handleNavigateTab}
              onLoadSampleData={handleLoadSampleDemoStocks}
            />
          )}

          {activeTab === 'delete' && (
            <DeleteTab
              stocks={stocks}
              onDeleteStock={handleDeleteStock}
              onClearAllStocks={handleClearAllStocks}
              currency={currency}
              onNavigateTab={handleNavigateTab}
              onLoadSampleData={handleLoadSampleDemoStocks}
            />
          )}

        </main>
      </div>

      {/* Disclaimer Footer */}
      <footer className="border-t border-[#E4E4EB] dark:border-[#2E2E36] bg-white/80 dark:bg-[#17171B]/80 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-[#6B6B76] dark:text-[#9A9AA5] no-print transition-colors">
        <div className="max-w-4xl mx-auto space-y-1">
          <p className="font-medium text-[#18181B] dark:text-[#EDEDF0]">
            Predictions are estimates based on a simple linear trend and are not financial advice. Actual stock performance may differ.
          </p>
          <p className="text-[11px] text-[#6B6B76] dark:text-[#6B6B76]">
            CSE 213 – Advanced Java Programming | SRM University AP · Pure Client-Side Computation
          </p>
        </div>
      </footer>

      {/* How It Works Formula Modal */}
      <HowItWorksModal
        isOpen={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
      />

    </div>
  );
}
