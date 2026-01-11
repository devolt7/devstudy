import React, { useState } from 'react';
import { Button, Card, Input } from './UI';
import { Download, FileText, Image, X, FileType, Sparkles, Zap } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'images' | 'docx', pages: number[] | 'all', quality?: 'standard' | 'high') => void;
  isProcessing: boolean;
  pageCount: number;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, isProcessing, pageCount }) => {
  const [format, setFormat] = useState<'pdf' | 'images' | 'docx'>('pdf');
  const [pageSelection, setPageSelection] = useState<'all' | 'custom'>('all');
  const [quality, setQuality] = useState<'standard' | 'high'>('standard');
  const [customRange, setCustomRange] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleExport = () => {
    setError('');
    let selectedPages: number[] | 'all' = 'all';

    if (pageSelection === 'custom') {
      try {
        // Parse "1, 3-5" into [1, 3, 4, 5]
        const pages = new Set<number>();
        const parts = customRange.split(',').map(p => p.trim()).filter(p => p);
        
        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(n => parseInt(n));
                if (isNaN(start) || isNaN(end)) throw new Error("Invalid range");
                for (let i = start; i <= end; i++) pages.add(i);
            } else {
                const num = parseInt(part);
                if (isNaN(num)) throw new Error("Invalid number");
                pages.add(num);
            }
        }
        
        const sorted = Array.from(pages).filter(p => p >= 1 && p <= pageCount).sort((a, b) => a - b);
        if (sorted.length === 0) throw new Error("No valid pages selected");
        selectedPages = sorted;
      } catch (e) {
        setError("Invalid page range. Use format like '1, 3-5'.");
        return;
      }
    }

    onExport(format, selectedPages, quality);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 pb-10 px-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
        <Card className="w-full max-w-lg bg-white dark:bg-slate-900 p-6 shadow-2xl animate-scale-in border border-slate-200 dark:border-slate-800 relative">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Download size={22} className="text-primary-600" /> Download & Export
                </h3>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X size={20} className="text-slate-500" />
                </button>
            </div>

            <div className="space-y-6">
                {/* Format Selection */}
                <div>
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3 block">Choose Format</label>
                    <div className="grid grid-cols-3 gap-3">
                        <button 
                            onClick={() => setFormat('pdf')}
                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${format === 'pdf' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                                <FileText size={20} />
                            </div>
                            <span className="font-bold text-xs">PDF</span>
                        </button>
                        
                        <button 
                            onClick={() => setFormat('docx')}
                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${format === 'docx' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <FileType size={20} />
                            </div>
                            <span className="font-bold text-xs">Word</span>
                        </button>

                        <button 
                            onClick={() => setFormat('images')}
                            className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${format === 'images' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 shadow-md' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'}`}
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                                <Image size={20} />
                            </div>
                            <span className="font-bold text-xs">Images</span>
                        </button>
                    </div>
                </div>

                {/* PDF Quality Selection */}
                {format === 'pdf' && (
                    <div className="animate-fade-in">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2 block">PDF Quality</label>
                        <div className="flex gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                            <button 
                                onClick={() => setQuality('standard')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${quality === 'standard' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Zap size={14} className={quality === 'standard' ? 'text-amber-500' : ''} />
                                <span>Standard <span className="opacity-60 text-[10px] font-normal block sm:inline">(Small Size)</span></span>
                            </button>
                            <button 
                                onClick={() => setQuality('high')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${quality === 'high' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                <Sparkles size={14} className={quality === 'high' ? 'text-indigo-500' : ''} />
                                <span>High Quality <span className="opacity-60 text-[10px] font-normal block sm:inline">(HD Print)</span></span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Page Selection */}
                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Page Range (Total: {pageCount})</label>
                    <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                         <button 
                            onClick={() => setPageSelection('all')}
                            className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${pageSelection === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            All Pages
                        </button>
                        <button 
                            onClick={() => setPageSelection('custom')}
                            className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${pageSelection === 'custom' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Custom Range
                        </button>
                    </div>

                    {pageSelection === 'custom' && (
                        <div className="animate-slide-up">
                            <Input 
                                placeholder="e.g. 1, 3-5, 8" 
                                value={customRange} 
                                onChange={(e) => setCustomRange(e.target.value)}
                                className="text-sm border-slate-300"
                            />
                            {error && <p className="text-red-500 text-xs mt-1 font-semibold flex items-center gap-1"><X size={12}/> {error}</p>}
                            <p className="text-[10px] text-slate-400 mt-1 pl-1">Enter page numbers separated by commas or ranges.</p>
                        </div>
                    )}
                </div>

                <Button 
                    onClick={handleExport} 
                    isLoading={isProcessing}
                    className="w-full py-4 text-base font-bold shadow-xl shadow-primary-500/20 rounded-2xl"
                >
                    {isProcessing ? 'Processing Export...' : `Download ${format.toUpperCase()}`}
                </Button>
            </div>
        </Card>
    </div>
  );
};

export default ExportModal;