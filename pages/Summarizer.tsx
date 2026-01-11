import React, { useState, useRef } from 'react';
import { Button, Card, Spinner, TextArea } from '../components/UI';
import { GeminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Upload, RefreshCw, Zap, FileText, FileType, Image as ImageIcon, Copy, CheckCircle2 } from 'lucide-react';

const Summarizer: React.FC = () => {
  const [file, setFile] = useState<{data: string, mimeType: string, name: string} | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    processFile(selectedFile);
  };

  const processFile = (selectedFile: File | undefined) => {
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const mimeType = base64String.split(';')[0].split(':')[1];
        setFile({
            data: base64Data,
            mimeType: mimeType,
            name: selectedFile.name
        });
        setResult(null);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.add('border-amber-500', 'bg-amber-50', 'dark:bg-amber-900/20');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('border-amber-500', 'bg-amber-50', 'dark:bg-amber-900/20');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropZoneRef.current?.classList.remove('border-amber-500', 'bg-amber-50', 'dark:bg-amber-900/20');
    const droppedFile = e.dataTransfer.files?.[0];
    processFile(droppedFile);
  };

  const handleSummarize = async () => {
    if (!file) return;
    setLoading(true);
    setCopied(false);
    try {
      const summary = await GeminiService.summarizeContent(
          { data: file.data, mimeType: file.mimeType }, 
          instructions
      );
      setResult(summary);
    } catch (error) {
      alert("Failed to generate summary. Please ensure the file contains readable text or clear images.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileType size={40} className="text-red-500" />;
    if (mimeType.includes('image')) return <ImageIcon size={40} className="text-blue-500" />;
    return <FileText size={40} className="text-slate-500" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 mx-auto animate-float">
          <Zap size={32} fill="currentColor" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Smart Summarizer</h1>
        <p className="text-slate-500 font-medium max-w-lg mx-auto">Instant exam-ready summaries from images, PDFs, and documents.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Upload & Config */}
        <div className="lg:col-span-5 space-y-6">
          <div 
            ref={dropZoneRef}
            className="glass-panel p-8 border-dashed border-2 border-slate-300 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[340px] bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/20 ring-1 ring-white/20 dark:ring-white/10"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="text-center space-y-4 animate-scale-in">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl mx-auto border border-slate-100 dark:border-slate-700">
                  {getFileIcon(file.mimeType)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white truncate max-w-[240px]">{file.name}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Ready to process</p>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                >
                  <RefreshCw size={14} /> Change File
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-amber-500 shadow-xl shadow-amber-500/10 group-hover:scale-110 transition-transform duration-300">
                  <Upload size={32} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-lg text-slate-700 dark:text-white">Upload Material</p>
                  <p className="text-sm text-slate-400 font-medium">Images, PDFs, or DOCX files</p>
                  <p className="text-xs text-slate-400">Drag & drop or click to select</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,.pdf,.doc,.docx" 
              onChange={handleFileChange} 
            />
          </div>

          <div className="space-y-4">
            <TextArea 
              label="Custom Focus (Optional)"
              placeholder="e.g., 'Focus on definitions', 'List only key dates', 'Summarize for a 5-mark question'..." 
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            />
            
            <Button 
              className="w-full py-4 text-base bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-xl shadow-amber-500/20 rounded-2xl" 
              onClick={handleSummarize} 
              disabled={!file || loading} 
              isLoading={loading}
            >
              <Zap size={18} className="mr-2 fill-white" /> Generate Summary
            </Button>
          </div>
        </div>

        {/* Right Side: Result Display */}
        <div className="lg:col-span-7 h-full min-h-[500px]">
          {loading ? (
            <Card className="h-full min-h-[500px] flex flex-col items-center justify-center space-y-6">
              <Spinner />
              <div className="text-center space-y-2">
                <p className="font-bold text-lg text-slate-900 dark:text-white animate-pulse">Analyzing Content...</p>
                <p className="text-sm text-slate-500 max-w-[240px]">Distilling key concepts and exam points from your file.</p>
              </div>
            </Card>
          ) : result ? (
            <div className="h-full flex flex-col animate-slide-up">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
                <div className="px-6 py-4 bg-amber-50/50 dark:bg-amber-900/10 border-b border-amber-100 dark:border-amber-900/30 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-amber-600" />
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">Smart Summary</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="h-9 gap-2 text-amber-700 dark:text-amber-400 hover:bg-amber-100/50"
                  >
                    {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                    <span className="font-bold text-xs uppercase tracking-wider">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
                <div className="p-8 overflow-y-auto max-h-[700px] custom-scrollbar prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-li:my-1 prose-strong:text-amber-600 dark:prose-strong:text-amber-400">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <Card className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50/30 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800 p-10 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300">
                <FileText size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-lg text-slate-600 dark:text-slate-400">No Content Analyzed</h3>
                <p className="text-sm text-slate-400 max-w-[280px] mx-auto">Upload a file on the left to generate an intelligent study summary.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Summarizer;
