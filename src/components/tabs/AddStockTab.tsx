/**
 * @file AddStockTab.tsx
 * Add / Load Stock tab styled with neutral charcoal and violet accents.
 */

import React, { useState } from 'react';
import {
  FileText,
  ListPlus,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Stock, Currency, ActiveTab } from '../../types';
import { parsePastedPrices, validateStockInput, formatCurrency } from '../../utils/storage';

interface AddStockTabProps {
  stocks: Stock[];
  onAddStock: (stock: Stock) => void;
  currency: Currency;
  onNavigateTab: (tab: ActiveTab, selectedStock?: string) => void;
}

type InputMethod = 'paste' | 'manual' | 'csv';

export const AddStockTab: React.FC<AddStockTabProps> = ({
  stocks,
  onAddStock,
  currency,
  onNavigateTab,
}) => {
  const [method, setMethod] = useState<InputMethod>('paste');
  const [stockName, setStockName] = useState('');
  
  // Method A: Paste
  const [pasteText, setPasteText] = useState('');
  
  // Method B: Manual One-by-One
  const [manualPriceInput, setManualPriceInput] = useState('');
  const [manualPriceList, setManualPriceList] = useState<number[]>([]);
  
  // Method C: CSV Upload
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number>(0);
  const [csvParsedPrices, setCsvParsedPrices] = useState<number[]>([]);
  
  // State feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successStock, setSuccessStock] = useState<Stock | null>(null);
  const [isDemoDataLoaded, setIsDemoDataLoaded] = useState(false);

  const getActivePrices = (): { prices: number[]; parseErrors: string[] } => {
    if (method === 'paste') {
      const res = parsePastedPrices(pasteText);
      return { prices: res.prices, parseErrors: res.errors };
    } else if (method === 'manual') {
      return { prices: manualPriceList, parseErrors: [] };
    } else {
      return { prices: csvParsedPrices, parseErrors: [] };
    }
  };

  const handleAddManualPrice = () => {
    const val = parseFloat(manualPriceInput.trim());
    if (isNaN(val) || !Number.isFinite(val) || val <= 0) {
      setErrorMsg('Price must be a valid positive number greater than 0.');
      return;
    }
    setManualPriceList([...manualPriceList, val]);
    setManualPriceInput('');
    setErrorMsg(null);
  };

  const handleRemoveManualPrice = (index: number) => {
    setManualPriceList(manualPriceList.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      setCsvRawText(content);
      parseCsvData(content, selectedColumnIndex);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the selected file.');
    };
    reader.readAsText(file);
  };

  const parseCsvData = (content: string, colIdx: number) => {
    const lines = content
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      setCsvHeaders([]);
      setCsvParsedPrices([]);
      setErrorMsg('Uploaded file is empty.');
      return;
    }

    const firstRowTokens = lines[0].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
    const hasHeader = firstRowTokens.some((col) => isNaN(Number(col)));
    const headers = hasHeader ? firstRowTokens : firstRowTokens.map((_, i) => `Column ${i + 1}`);
    setCsvHeaders(headers);

    const dataStartIdx = hasHeader ? 1 : 0;
    const targetCol = Math.min(colIdx, headers.length - 1);
    setSelectedColumnIndex(targetCol);

    const extracted: number[] = [];
    for (let i = dataStartIdx; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length > targetCol) {
        const cleaned = cols[targetCol].replace(/^[₹$€£,]+/, '').replace(/,/g, '');
        const num = parseFloat(cleaned);
        if (!isNaN(num) && Number.isFinite(num) && num > 0) {
          extracted.push(num);
        }
      }
    }

    setCsvParsedPrices(extracted);
    if (extracted.length === 0) {
      setErrorMsg(`No valid positive prices found in column "${headers[targetCol]}".`);
    } else {
      setErrorMsg(null);
    }
  };

  const handleColumnChange = (newColIdx: number) => {
    setSelectedColumnIndex(newColIdx);
    if (csvRawText) {
      parseCsvData(csvRawText, newColIdx);
    }
  };

  const handleLoadSampleData = () => {
    const sampleTicker = `TATA-TECH-${Math.floor(Math.random() * 900 + 100)}`;
    const samplePrices = [1240.50, 1248.00, 1255.75, 1251.20, 1262.40, 1270.00, 1268.50, 1279.80, 1285.30, 1294.60];
    
    setStockName(sampleTicker);
    setPasteText(samplePrices.join(', '));
    setManualPriceList(samplePrices);
    setMethod('paste');
    setIsDemoDataLoaded(true);
    setErrorMsg(null);
    setSuccessStock(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const { prices, parseErrors } = getActivePrices();

    if (parseErrors.length > 0) {
      setErrorMsg(`Input contains invalid values: ${parseErrors.slice(0, 3).join('; ')}`);
      return;
    }

    const validationError = validateStockInput(stockName, prices, stocks);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    const newStock: Stock = {
      name: stockName.trim(),
      history: prices,
      addedAt: Date.now(),
      notes: isDemoDataLoaded ? 'Loaded from sample demo' : 'User imported',
    };

    onAddStock(newStock);
    setSuccessStock(newStock);
    setIsDemoDataLoaded(false);

    setStockName('');
    setPasteText('');
    setManualPriceList([]);
    setCsvParsedPrices([]);
    setCsvFileName(null);
    setCsvRawText('');
  };

  const { prices: currentActivePrices } = getActivePrices();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4E4EB] dark:border-[#2E2E36]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#18181B] dark:text-[#EDEDF0] tracking-tight">
            Add / Load Stock
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6B76] dark:text-[#9A9AA5] mt-1">
            Define custom stocks with historical closing prices (oldest → newest).
          </p>
        </div>

        {/* Violet Load Sample Data button */}
        <button
          type="button"
          onClick={handleLoadSampleData}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-[#7C3AED] dark:text-violet-300 bg-violet-50 dark:bg-[#8B5CF6]/15 border border-violet-200/80 dark:border-violet-500/30 hover:bg-violet-100 dark:hover:bg-[#8B5CF6]/25 transition-colors shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Load Sample Data
        </button>
      </div>

      {/* Demo Data Banner when prefilled */}
      {isDemoDataLoaded && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-[#D97706] dark:text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <span className="font-semibold">Sample Demo Data Prefilled:</span> You can review, rename, or edit the prices below before submitting.
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successStock && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] dark:text-[#22C55E] shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Stock "{successStock.name}" added successfully!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Saved {successStock.history.length} price points. Latest price: {formatCurrency(successStock.history[successStock.history.length - 1], currency)}.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onNavigateTab('predict', successStock.name)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] rounded-xl transition-colors"
            >
              <span>View Prediction</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setSuccessStock(null)}
              className="px-2.5 py-1.5 text-xs font-medium text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#18181B] dark:hover:text-[#EDEDF0]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Stock Name Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#18181B] dark:text-[#EDEDF0]">
            Stock Name / Ticker Symbol <span className="text-[#E11D48] dark:text-[#F43F5E]">*</span>
          </label>
          <input
            type="text"
            value={stockName}
            onChange={(e) => {
              setStockName(e.target.value);
              setErrorMsg(null);
            }}
            placeholder="e.g. INFY, RELIANCE, TCS, AAPL"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] placeholder:text-[#6B6B76]/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8B5CF6]"
            required
          />
          <p className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5]">
            Stock names are case-insensitive and must be unique in your portfolio.
          </p>
        </div>

        {/* Input Method Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#18181B] dark:text-[#EDEDF0]">
            Select Price Input Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1 bg-zinc-100 dark:bg-[#17171B] rounded-xl border border-[#E4E4EB] dark:border-[#2E2E36]">
            <button
              type="button"
              onClick={() => { setMethod('paste'); setErrorMsg(null); }}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                method === 'paste'
                  ? 'bg-white dark:bg-[#1C1C21] text-[#7C3AED] dark:text-[#8B5CF6] shadow-xs'
                  : 'text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#18181B] dark:hover:text-[#EDEDF0]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>(a) Paste List</span>
            </button>

            <button
              type="button"
              onClick={() => { setMethod('manual'); setErrorMsg(null); }}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                method === 'manual'
                  ? 'bg-white dark:bg-[#1C1C21] text-[#7C3AED] dark:text-[#8B5CF6] shadow-xs'
                  : 'text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#18181B] dark:hover:text-[#EDEDF0]'
              }`}
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>(b) One-by-One</span>
            </button>

            <button
              type="button"
              onClick={() => { setMethod('csv'); setErrorMsg(null); }}
              className={`flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                method === 'csv'
                  ? 'bg-white dark:bg-[#1C1C21] text-[#7C3AED] dark:text-[#8B5CF6] shadow-xs'
                  : 'text-[#6B6B76] dark:text-[#9A9AA5] hover:text-[#18181B] dark:hover:text-[#EDEDF0]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>(c) CSV File</span>
            </button>
          </div>
        </div>

        {/* METHOD A: Paste Textarea */}
        {method === 'paste' && (
          <div className="space-y-2 p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
            <label className="block text-xs font-semibold text-[#18181B] dark:text-[#EDEDF0]">
              Paste Price Series (separated by commas, spaces, or newlines)
            </label>
            <textarea
              rows={4}
              value={pasteText}
              onChange={(e) => {
                setPasteText(e.target.value);
                setErrorMsg(null);
              }}
              placeholder="e.g. 150.25, 152.00, 151.75, 154.50, 156.20, 158.00"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] placeholder:text-[#6B6B76]/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8B5CF6]"
            />
            <p className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5]">
              Enter prices chronologically from oldest (first) to newest (last). Currency symbols are automatically stripped.
            </p>
          </div>
        )}

        {/* METHOD B: One-by-One Manual Entry */}
        {method === 'manual' && (
          <div className="space-y-4 p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="block text-xs font-semibold text-[#18181B] dark:text-[#EDEDF0]">
                  Enter Price ({currency === 'INR' ? '₹' : '$'})
                </label>
                <input
                  type="number"
                  step="any"
                  value={manualPriceInput}
                  onChange={(e) => setManualPriceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddManualPrice();
                    }
                  }}
                  placeholder="e.g. 154.50"
                  className="w-full px-3.5 py-2 rounded-xl text-sm font-mono bg-zinc-50 dark:bg-[#17171B] border border-[#E4E4EB] dark:border-[#2E2E36] text-[#18181B] dark:text-[#EDEDF0] placeholder:text-[#6B6B76]/60 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-[#8B5CF6]"
                />
              </div>
              <button
                type="button"
                onClick={handleAddManualPrice}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] rounded-xl transition-colors whitespace-nowrap"
              >
                Add Price
              </button>
            </div>

            {manualPriceList.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[#6B6B76] dark:text-[#9A9AA5]">
                  <span>Entered Prices ({manualPriceList.length} items, chronological order):</span>
                  <button
                    type="button"
                    onClick={() => setManualPriceList([])}
                    className="text-[#E11D48] dark:text-[#F43F5E] hover:underline text-[11px]"
                  >
                    Clear list
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-zinc-50 dark:bg-[#17171B] rounded-xl border border-[#E4E4EB] dark:border-[#2E2E36]">
                  {manualPriceList.map((p, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-[#1C1C21] text-xs font-mono text-[#18181B] dark:text-[#EDEDF0] border border-[#E4E4EB] dark:border-[#2E2E36]"
                    >
                      <span className="text-[10px] text-[#6B6B76] dark:text-[#9A9AA5]">#{idx + 1}</span>
                      <span>{formatCurrency(p, currency)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveManualPrice(idx)}
                        className="text-[#6B6B76] hover:text-[#E11D48] dark:hover:text-[#F43F5E] ml-1"
                        title="Remove price"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] italic">
                No prices added yet. Enter a value above and click "Add Price" (or press Enter).
              </p>
            )}
          </div>
        )}

        {/* METHOD C: CSV File Upload */}
        {method === 'csv' && (
          <div className="space-y-4 p-4 rounded-xl bg-white dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] shadow-xs">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#18181B] dark:text-[#EDEDF0]">
                Upload CSV File
              </label>
              <input
                type="file"
                accept=".csv,text/csv,text/plain"
                onChange={handleFileUpload}
                className="block w-full text-xs text-[#6B6B76] dark:text-[#9A9AA5] file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 dark:file:bg-[#8B5CF6]/15 dark:file:text-violet-300 hover:file:bg-violet-100"
              />
              <p className="text-[11px] text-[#6B6B76] dark:text-[#9A9AA5]">
                Supports single-column price lists or standard historical tables (e.g., Date, Close, Volume).
              </p>
            </div>

            {csvHeaders.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-[#E4E4EB] dark:border-[#2E2E36]">
                <label className="block text-xs font-semibold text-[#18181B] dark:text-[#EDEDF0]">
                  Select Price Column:
                </label>
                <div className="flex flex-wrap gap-2">
                  {csvHeaders.map((hdr, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleColumnChange(idx)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border ${
                        selectedColumnIndex === idx
                          ? 'bg-[#7C3AED] dark:bg-[#8B5CF6] text-white border-transparent'
                          : 'bg-zinc-50 dark:bg-[#17171B] text-[#18181B] dark:text-[#EDEDF0] border-[#E4E4EB] dark:border-[#2E2E36] hover:bg-zinc-100 dark:hover:bg-[#24242B]'
                      }`}
                    >
                      {hdr}
                    </button>
                  ))}
                </div>
                {csvFileName && (
                  <p className="text-[11px] text-[#7C3AED] dark:text-[#8B5CF6] font-medium">
                    Extracted {csvParsedPrices.length} prices from "{csvFileName}".
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Live Validation / Error Feedback */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#E11D48] dark:text-[#F43F5E] shrink-0 mt-0.5" />
            <div className="text-xs text-[#E11D48] dark:text-[#F43F5E] font-medium leading-relaxed">
              {errorMsg}
            </div>
          </div>
        )}

        {/* Live Preview Summary */}
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-[#1C1C21] border border-[#E4E4EB] dark:border-[#2E2E36] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="text-xs text-[#6B6B76] dark:text-[#9A9AA5] space-y-0.5">
            <div className="font-semibold text-[#18181B] dark:text-[#EDEDF0]">
              Input Summary: {currentActivePrices.length} valid price points detected
            </div>
            {currentActivePrices.length >= 2 ? (
              <div className="text-[#6B6B76] dark:text-[#9A9AA5]">
                First: <span className="font-mono text-[#18181B] dark:text-[#EDEDF0]">{formatCurrency(currentActivePrices[0], currency)}</span> · 
                Latest: <span className="font-mono text-[#18181B] dark:text-[#EDEDF0]">{formatCurrency(currentActivePrices[currentActivePrices.length - 1], currency)}</span>
              </div>
            ) : (
              <div className="text-[#D97706] dark:text-[#F59E0B]">
                Minimum 2 prices required to calculate slope and predict future trajectory.
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!stockName.trim() || currentActivePrices.length < 2}
            className={`px-5 py-2.5 text-xs font-semibold rounded-xl text-white shadow-xs transition-colors flex items-center justify-center gap-2 ${
              !stockName.trim() || currentActivePrices.length < 2
                ? 'bg-zinc-300 dark:bg-[#2E2E36] text-zinc-500 cursor-not-allowed opacity-60'
                : 'bg-[#7C3AED] hover:bg-[#6D28D9] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED] active:scale-98'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Save Stock to Portfolio
          </button>
        </div>

      </form>
    </div>
  );
};
