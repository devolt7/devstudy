import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, useNavigate, useLocation } from 'react-router-dom';
import { Stream, WritingMode, HandwritingStyle, InkColor, PaperType, PaperSize, PaperTone, GeneratedContent, GenerationConfig, StudentDetails, TeacherMode, LayoutContextType, PenType, QAColorMode } from '../types';
import { STREAMS, TEACHER_MODES, FONTS } from '../constants';
import { Button, Input, Select, TextArea, Card } from '../components/UI';
import { GeminiService } from '../services/geminiService';
import HandwritingPaper from '../components/HandwritingPaper';
import TypedPaper from '../components/TypedPaper';
import PaperContainer from '../components/PaperContainer';
import ExportModal from '../components/ExportModal';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { 
  ChevronDown, ChevronUp, User, Upload, FileText, Type, X, 
  Sparkles, Pencil, Edit3, Check, ArrowLeft, PenTool, 
  Layout as LayoutIcon, Download, Loader2, Palette,
  MoveVertical,
  Maximize,
  BrainCircuit,
  Zap,
  Calendar,
  Grid,
  Plus,
  Layers,
  Eye,
  Type as TypeIcon,
  Minimize,
  Cloud,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import Mascot from '../components/Mascot';
import { useAuth } from '../context/AuthContext';
import { saveToHistory, SavedContentItem, isFirebaseConfigured } from '../services/firebase';

interface BaseGeneratorProps {
  type: 'assignment' | 'notes' | 'report' | 'viva';
  title: string;
  allowFileUpload?: boolean;
}

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`;

const colors: { id: InkColor, hex: string, name: string }[] = [
    { id: 'blue', hex: '#1a237e', name: 'Real Blue' },
    { id: 'light_blue', hex: '#0ea5e9', name: 'Sky' },
    { id: 'royal_blue', hex: '#4338ca', name: 'Royal' },
    { id: 'black', hex: '#0f172a', name: 'Black' },
    { id: 'red', hex: '#b91c1c', name: 'Red' },
    { id: 'custom', hex: 'conic-gradient(from 180deg at 50% 50%, #FF0000 0deg, #00FF00 120deg, #0000FF 240deg, #FF0000 360deg)', name: 'Custom' },
];

const MobileHandle = () => (
    <div className="w-full flex justify-center pb-2 md:hidden">
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full" />
    </div>
);

interface StylePanelProps {
    isOpen: boolean;
    onClose: () => void;
    panelRef: React.RefObject<HTMLDivElement | null>;
    writingMode: WritingMode;
    handwritingStyle: HandwritingStyle;
    setHandwritingStyle: (val: HandwritingStyle) => void;
    inkColor: InkColor;
    setInkColor: (val: InkColor) => void;
    customInkColor: string;
    setCustomInkColor: (val: string) => void;
    penType: PenType;
    setPenType: (val: PenType) => void;
    inkThickness: number;
    setInkThickness: (val: number) => void;
    autoColor: boolean;
    setAutoColor: (val: boolean) => void;
    qaColorMode: QAColorMode;
    setQaColorMode: (val: QAColorMode) => void;
}

const StylePanel: React.FC<StylePanelProps> = ({ 
    isOpen, onClose, panelRef, writingMode, 
    handwritingStyle, setHandwritingStyle, 
    inkColor, setInkColor, customInkColor, setCustomInkColor,
    penType, setPenType, inkThickness, setInkThickness,
    autoColor, setAutoColor, qaColorMode, setQaColorMode
}) => {
    const [showAllFonts, setShowAllFonts] = useState(false);

    useEffect(() => {
        if (!isOpen) setShowAllFonts(false);
    }, [isOpen]);

    if (!isOpen) return null;

    const fontKeys = Object.keys(FONTS.handwritten);
    const displayedFonts = showAllFonts ? fontKeys : fontKeys.slice(0, 4);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex justify-end flex-col md:block pointer-events-none">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto md:hidden transition-opacity" onClick={onClose}></div>
            
            {/* Panel Container */}
            <div 
              ref={panelRef}
              className="pointer-events-auto w-full md:w-[360px] bg-white dark:bg-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl animate-slide-up md:animate-fade-in print-hide flex flex-col rounded-t-3xl md:rounded-2xl max-h-[55vh] md:max-h-[80vh] fixed bottom-0 md:top-28 md:right-8 md:bottom-auto border-t md:border border-slate-200 dark:border-slate-800 overflow-hidden ring-1 ring-white/10"
            >
                {/* Fixed Header - Solid Background & Shadow */}
                <div className="shrink-0 pt-3 px-5 pb-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-30 relative shadow-sm">
                    <MobileHandle />
                    <div className="flex justify-between items-center">
                        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <Palette size={18} className="text-primary-600"/> Style Studio
                        </h3>
                        <button onClick={onClose} className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                            <X size={16}/>
                        </button>
                    </div>
                </div>
                
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar overscroll-contain bg-white dark:bg-slate-900">
                    {writingMode === 'handwritten' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Handwriting Font</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {displayedFonts.map((style) => (
                                        <button
                                            key={style}
                                            onClick={() => setHandwritingStyle(style as HandwritingStyle)}
                                            className={`p-2.5 rounded-lg border transition-all relative overflow-hidden group ${handwritingStyle === style ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-bold shadow-sm' : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                            style={{ fontFamily: (FONTS.handwritten as any)[style] }}
                                        >
                                            <span className="relative z-10 text-xs">{style.charAt(0).toUpperCase() + style.slice(1)}</span>
                                        </button>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setShowAllFonts(!showAllFonts)}
                                    className="w-full py-2 text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors flex items-center justify-center gap-1 uppercase tracking-wide"
                                >
                                    {showAllFonts ? 'Show Less' : 'View All Styles'} <ChevronRight size={12} className={`transform transition-transform ${showAllFonts ? '-rotate-90' : 'rotate-90'}`} />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ink Color</label>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                                {colors.map((c) => (
                                    <button
                                        key={c.id}
                                        onClick={() => setInkColor(c.id)}
                                        className={`w-8 h-8 rounded-full border-[2px] transition-transform hover:scale-110 flex-shrink-0 ${inkColor === c.id ? 'border-white dark:border-slate-700 shadow-md ring-2 ring-primary-500 scale-110' : 'border-transparent'}`}
                                        style={{ background: c.hex }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                            {inkColor === 'custom' && (
                                 <div className="animate-fade-in">
                                     <input type="color" value={customInkColor} onChange={(e) => setCustomInkColor(e.target.value)} className="w-full h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                                 </div>
                            )}
                        </div>

                        {writingMode === 'handwritten' && (
                          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                               <div className="space-y-2">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pen Pressure</label>
                                   <div className="flex bg-slate-100 dark:bg-slate-800/80 rounded-lg p-1">
                                       <button 
                                          onClick={() => setPenType('ballpoint')} 
                                          className={`flex-1 py-1.5 text-[10px] uppercase rounded-md transition-all duration-300 font-bold ${penType === 'ballpoint' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                       >
                                          Ballpoint
                                       </button>
                                       <button 
                                          onClick={() => setPenType('gel')} 
                                          className={`flex-1 py-1.5 text-[10px] uppercase rounded-md transition-all duration-300 font-bold ${penType === 'gel' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                       >
                                          Gel Pen
                                       </button>
                                   </div>
                               </div>
                               
                               <div className="space-y-2">
                                   <div className="flex justify-between">
                                       <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Stroke Thickness</label>
                                       <span className="text-[10px] font-mono text-primary-600 font-bold">{inkThickness.toFixed(1)}px</span>
                                   </div>
                                   <input 
                                      type="range" min="0" max="2" step="0.1" 
                                      value={inkThickness} 
                                      onChange={(e) => setInkThickness(parseFloat(e.target.value))} 
                                      className="w-full accent-primary-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                                   />
                               </div>

                               <div className="flex items-center justify-between pt-1">
                                   <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Smart Coloring</label>
                                   <button 
                                       onClick={() => setAutoColor(!autoColor)} 
                                       className={`w-10 h-5 rounded-full transition-colors relative shadow-inner ${autoColor ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                                   >
                                       <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${autoColor ? 'left-6' : 'left-1'}`} />
                                   </button>
                               </div>

                               {autoColor && (
                                   <div className="grid grid-cols-3 gap-2 animate-fade-in">
                                       {(['classic', 'inverse', 'unified'] as QAColorMode[]).map(mode => (
                                           <button 
                                              key={mode} 
                                              onClick={() => setQaColorMode(mode)}
                                              className={`text-[9px] py-1.5 px-2 rounded-lg border font-bold uppercase transition-all ${qaColorMode === mode ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-400 text-primary-700 dark:text-primary-300' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                                           >
                                              {mode}
                                           </button>
                                       ))}
                                   </div>
                               )}
                          </div>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

interface LayoutPanelProps {
    isOpen: boolean;
    onClose: () => void;
    panelRef: React.RefObject<HTMLDivElement | null>;
    paperType: PaperType;
    setPaperType: (val: PaperType) => void;
    paperTone: PaperTone;
    setPaperTone: (val: PaperTone) => void;
    paperSize: PaperSize;
    setPaperSize: (val: PaperSize) => void;
    showTitle: boolean;
    setShowTitle: (val: boolean) => void;
    showWatermark: boolean;
    setShowWatermark: (val: boolean) => void;
    watermarkText: string;
    setWatermarkText: (val: string) => void;
    fontSize: number;
    setFontSize: (val: number) => void;
    lineHeight: number;
    setLineHeight: (val: number) => void;
    marginLeft: number;
    setMarginLeft: (val: number) => void;
    marginRight: number;
    setMarginRight: (val: number) => void;
    marginTop: number;
    setMarginTop: (val: number) => void;
    marginBottom: number;
    setMarginBottom: (val: number) => void;
    verticalOffset: number;
    setVerticalOffset: (val: number) => void;
}

const LayoutPanel: React.FC<LayoutPanelProps> = ({
    isOpen, onClose, panelRef,
    paperType, setPaperType, paperTone, setPaperTone, paperSize, setPaperSize,
    showTitle, setShowTitle, showWatermark, setShowWatermark, watermarkText, setWatermarkText,
    fontSize, setFontSize, lineHeight, setLineHeight,
    marginLeft, setMarginLeft, marginRight, setMarginRight,
    marginTop, setMarginTop, marginBottom, setMarginBottom,
    verticalOffset, setVerticalOffset
}) => {
    if (!isOpen) return null;
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex justify-end flex-col md:block pointer-events-none">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto md:hidden transition-opacity" onClick={onClose}></div>
          
          <div 
            ref={panelRef}
            className="pointer-events-auto w-full md:w-[360px] bg-white dark:bg-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl animate-slide-up md:animate-fade-in print:hidden flex flex-col rounded-t-3xl md:rounded-2xl max-h-[55vh] md:max-h-[80vh] fixed bottom-0 md:top-28 md:right-8 md:bottom-auto border-t md:border border-slate-200 dark:border-slate-800 overflow-hidden ring-1 ring-white/10"
          >
              {/* Fixed Header - Solid Background & Shadow */}
              <div className="shrink-0 pt-3 px-5 pb-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-30 relative shadow-sm">
                  <MobileHandle />
                  <div className="flex justify-between items-center">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                          <Maximize size={18} className="text-primary-600"/> Layout Engine
                      </h3>
                      <button onClick={onClose} className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                          <X size={16}/>
                      </button>
                  </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar overscroll-contain bg-white dark:bg-slate-900">
                   <div className="space-y-5">
                       <div className="space-y-2">
                          <div className="flex items-center gap-2">
                             <Layers size={12} className="text-slate-400"/>
                             <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Paper Finish</label>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                              {(['clean', 'dull', 'realistic'] as PaperTone[]).map(pt => (
                                  <button
                                      key={pt}
                                      onClick={() => setPaperTone(pt)}
                                      className={`py-2 text-[10px] rounded-lg border uppercase transition-all font-bold ${paperTone === pt ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                  >
                                      {pt}
                                  </button>
                              ))}
                          </div>
                      </div>

                      <div className="py-3 border-y border-slate-100 dark:border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                  <Type size={14} className="text-slate-400"/>
                                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Show Title</span>
                              </div>
                              <button 
                                onClick={() => setShowTitle(!showTitle)}
                                className={`w-10 h-5 rounded-full transition-colors relative shadow-inner ${showTitle ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                              >
                                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${showTitle ? 'left-6' : 'left-1'}`} />
                              </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                  <Eye size={14} className="text-slate-400"/>
                                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Watermark</span>
                              </div>
                              <button 
                                onClick={() => setShowWatermark(!showWatermark)}
                                className={`w-10 h-5 rounded-full transition-colors relative shadow-inner ${showWatermark ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                              >
                                 <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform shadow-sm ${showWatermark ? 'left-6' : 'left-1'}`} />
                              </button>
                          </div>
                          
                          {showWatermark && (
                              <div className="animate-slide-down pt-1">
                                  <input 
                                    type="text" 
                                    value={watermarkText} 
                                    onChange={(e) => setWatermarkText(e.target.value)}
                                    placeholder="Enter Watermark Text..."
                                    className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary-500/50"
                                  />
                              </div>
                          )}
                      </div>

                      <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Paper Format</label>
                          <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                  {(['ruled', 'margin', 'plain'] as PaperType[]).map(pt => (
                                      <button
                                          key={pt}
                                          onClick={() => setPaperType(pt)}
                                          className={`w-full py-2 px-3 text-[10px] text-left rounded-lg border transition-all flex items-center gap-2 uppercase ${paperType === pt ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                      >
                                          <div className={`w-2.5 h-2.5 rounded-full border ${paperType === pt ? 'border-primary-500 bg-primary-500' : 'border-slate-300'}`}></div>
                                          {pt}
                                      </button>
                                  ))}
                              </div>
                              <div className="space-y-2">
                                  {(['a4', 'letter', 'notebook'] as PaperSize[]).map(ps => (
                                      <button
                                          key={ps}
                                          onClick={() => setPaperSize(ps)}
                                          className={`w-full py-2 px-3 text-[10px] text-left rounded-lg border transition-all flex items-center gap-2 uppercase ${paperSize === ps ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-bold' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                                      >
                                          <div className={`w-2.5 h-2.5 rounded border ${paperSize === ps ? 'border-primary-500 bg-primary-500' : 'border-slate-300'}`}></div>
                                          {ps}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                             <div className="flex justify-between">
                                 <div className="flex items-center gap-2">
                                    <MoveVertical size={12} className="text-slate-400"/>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Line Alignment</label>
                                 </div>
                                 <span className="text-[10px] font-mono text-primary-600 font-bold">{verticalOffset}px</span>
                             </div>
                             <input type="range" min="-20" max="20" step="1" value={verticalOffset} onChange={(e) => setVerticalOffset(parseInt(e.target.value))} className="w-full accent-primary-600 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Margin Control (px)</label>
                          <div className="grid grid-cols-2 gap-2">
                              {[{l:'Top', v:marginTop, s:setMarginTop}, {l:'Bottom', v:marginBottom, s:setMarginBottom}, {l:'Left', v:marginLeft, s:setMarginLeft}, {l:'Right', v:marginRight, s:setMarginRight}].map((m, i) => (
                                  <div key={i} className="space-y-1">
                                      <label className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">{m.l}</label>
                                      <input type="number" value={m.v} onChange={(e) => m.s(parseInt(e.target.value))} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-primary-500/50 outline-none transition-all" />
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>,
      document.body
    );
};

interface DiagramPanelProps {
    isOpen: boolean;
    onClose: () => void;
    panelRef: React.RefObject<HTMLDivElement | null>;
    diagramPrompt: string;
    setDiagramPrompt: (val: string) => void;
    handleManualDiagramAdd: () => void;
    isGeneratingDiagram: boolean;
}

const DiagramPanel: React.FC<DiagramPanelProps> = ({
    isOpen, onClose, panelRef,
    diagramPrompt, setDiagramPrompt,
    handleManualDiagramAdd, isGeneratingDiagram
}) => {
    if (!isOpen) return null;
    return createPortal(
      <div className="fixed inset-0 z-[9999] flex justify-end flex-col md:block pointer-events-none">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] pointer-events-auto md:hidden transition-opacity" onClick={onClose}></div>

          <div 
            ref={panelRef}
            className="pointer-events-auto w-full md:w-[360px] bg-white dark:bg-slate-900 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl animate-slide-up md:animate-fade-in print:hidden flex flex-col rounded-t-3xl md:rounded-2xl max-h-[55vh] md:max-h-auto fixed bottom-0 md:top-28 md:right-8 md:bottom-auto border-t md:border border-slate-200 dark:border-slate-800 overflow-hidden ring-1 ring-white/10"
          >
              {/* Fixed Header - Solid Background & Shadow */}
              <div className="shrink-0 pt-3 px-5 pb-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 z-30 relative shadow-sm">
                  <MobileHandle />
                  <div className="flex justify-between items-center">
                      <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                          <Pencil size={18} className="text-primary-600"/> Diagram Creator
                      </h3>
                      <button onClick={onClose} className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                          <X size={16}/>
                      </button>
                  </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-5 pb-8 custom-scrollbar overscroll-contain bg-white dark:bg-slate-900">
                  <div className="space-y-4">
                      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                          <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-2">Prompt Description</h4>
                          <TextArea 
                            placeholder="e.g. 'Labeled diagram of a Plant Cell'" 
                            value={diagramPrompt} 
                            onChange={(e) => setDiagramPrompt(e.target.value)} 
                            rows={3}
                            className="mb-3 text-sm bg-white dark:bg-slate-900"
                          />
                          <Button 
                            size="sm" 
                            onClick={handleManualDiagramAdd} 
                            isLoading={isGeneratingDiagram} 
                            disabled={!diagramPrompt.trim()} 
                            className="w-full shadow-lg shadow-primary-500/20"
                          >
                            <Sparkles size={14} className="mr-2" /> Generate & Insert
                          </Button>
                          <p className="text-[10px] text-slate-400 mt-2 text-center">
                            Inserts at top. Drag to reposition.
                          </p>
                      </div>
                  </div>
              </div>
          </div>
      </div>,
      document.body
    );
};

export const BaseGenerator: React.FC<BaseGeneratorProps> = ({ type, title, allowFileUpload = false }) => {
  const { setEditorMode } = useOutletContext<LayoutContextType>();
  const navigate = useNavigate();
  const location = useLocation();
  const { userProfile, currentUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  
  const [currentDocId, setCurrentDocId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'error' | null>(null);

  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editableContent, setEditableContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [editorHeight, setEditorHeight] = useState('1123px'); 

  const [diagrams, setDiagrams] = useState<Record<string, string>>({});
  const [diagramPrompt, setDiagramPrompt] = useState('');
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false);
  
  const [showDiagramTools, setShowDiagramTools] = useState(false);
  const [showStyleSettings, setShowStyleSettings] = useState(false);
  const [showLayoutSettings, setShowLayoutSettings] = useState(false);

  const stylePanelRef = useRef<HTMLDivElement>(null);
  const layoutPanelRef = useRef<HTMLDivElement>(null);
  const diagramPanelRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [visiblePages, setVisiblePages] = useState<number[] | 'all'>('all');

  const [inputType, setInputType] = useState<'text' | 'file'>('text');
  const [fileData, setFileData] = useState<{data: string, mimeType: string, name: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [topic, setTopic] = useState('');
  const [stream, setStream] = useState<Stream>('Engineering');
  const [teacherMode, setTeacherMode] = useState<TeacherMode>('average');
  
  const [writingMode, setWritingMode] = useState<WritingMode>('handwritten');
  
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineHeight, setLineHeight] = useState<number>(32); 
  const [verticalOffset, setVerticalOffset] = useState<number>(4);
  
  const [marginLeft, setMarginLeft] = useState<number>(100); 
  const [marginRight, setMarginRight] = useState<number>(30);
  const [marginTop, setMarginTop] = useState<number>(120);
  const [marginBottom, setMarginBottom] = useState<number>(60);

  const [showTitle, setShowTitle] = useState(true);
  const [showWatermark, setShowWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  
  const [isStudentDetailsCollapsed, setIsStudentDetailsCollapsed] = useState(true);
  const [studentDetails, setStudentDetails] = useState<StudentDetails>({
    name: '',
    instituteName: '',
    branch: '',
    semester: '',
    enrollmentNo: '',
    subjectCode: '',
    stream: 'Engineering',
    defaultSubject: ''
  });

  useEffect(() => {
      if (location.state?.loadContent) {
          const item = location.state.loadContent as SavedContentItem;
          setResult({
              title: item.title,
              content: item.content,
              type: item.type as any
          });
          setEditableContent(item.content);
          setDiagrams(item.diagrams || {});
          setTopic(item.title);
          setCurrentDocId(item.id || null);
      }
  }, [location.state]);

  useEffect(() => {
    if (userProfile) {
        setStudentDetails(prev => ({
            ...prev,
            name: userProfile.name || prev.name,
            instituteName: userProfile.instituteName || prev.instituteName,
            branch: userProfile.branch || prev.branch,
            semester: userProfile.semester || prev.semester,
            enrollmentNo: userProfile.enrollmentNo || prev.enrollmentNo,
            subjectCode: userProfile.defaultSubject || userProfile.subjectCode || prev.subjectCode,
            stream: userProfile.stream || prev.stream,
        }));
        if (userProfile.stream) setStream(userProfile.stream);
    }
  }, [userProfile]);

  const [includeDate, setIncludeDate] = useState(true);
  const [dateValue, setDateValue] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [handwritingStyle, setHandwritingStyle] = useState<HandwritingStyle>('indian'); 
  const [inkColor, setInkColor] = useState<InkColor>('blue');
  const [customInkColor, setCustomInkColor] = useState<string>('#2563eb');
  const [penType, setPenType] = useState<PenType>('ballpoint');
  const [inkThickness, setInkThickness] = useState<number>(0); 
  const [autoColor, setAutoColor] = useState<boolean>(true);
  const [qaColorMode, setQaColorMode] = useState<QAColorMode>('classic');
  const [paperType, setPaperType] = useState<PaperType>('ruled');
  const [paperSize, setPaperSize] = useState<PaperSize>('a4');
  const [paperTone, setPaperTone] = useState<PaperTone>('clean');

  const getPaperWidth = () => {
      switch(paperSize) {
          case 'a4': return 794;
          case 'letter': return 816;
          case 'notebook': return 665;
          default: return 794;
      }
  };

  const getPaperHeight = () => {
      switch(paperSize) {
          case 'a4': return 1123;
          case 'letter': return 1056;
          case 'notebook': return 945;
          default: return 1123;
      }
  };

  const formatDateForPaper = (isoDate: string) => {
      if (!isoDate) return '';
      const [year, month, day] = isoDate.split('-');
      return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    if (result) {
        setEditorMode(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        setEditorMode(false);
    }
    return () => setEditorMode(false);
  }, [result, setEditorMode]);

  useEffect(() => {
    if (writingMode === 'typed') {
        setShowStyleSettings(false);
        setShowLayoutSettings(false);
    }
  }, [writingMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (toolbarRef.current && toolbarRef.current.contains(event.target as Node)) {
            return;
        }
        if (showStyleSettings && stylePanelRef.current && !stylePanelRef.current.contains(event.target as Node)) {
            setShowStyleSettings(false);
        }
        if (showLayoutSettings && layoutPanelRef.current && !layoutPanelRef.current.contains(event.target as Node)) {
            setShowLayoutSettings(false);
        }
        if (showDiagramTools && diagramPanelRef.current && !diagramPanelRef.current.contains(event.target as Node)) {
            setShowDiagramTools(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showStyleSettings, showLayoutSettings, showDiagramTools]);


  useLayoutEffect(() => {
    if (isEditingContent && textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        const scrollHeight = textareaRef.current.scrollHeight;
        const minHeight = getPaperHeight();
        const newHeight = Math.max(minHeight, scrollHeight);
        textareaRef.current.style.height = `${newHeight}px`;
        setEditorHeight(`${newHeight}px`);
    }
  }, [editableContent, isEditingContent, paperSize, lineHeight, fontSize]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const mimeType = base64String.split(';')[0].split(':')[1];
        setFileData({
            data: base64Data,
            mimeType: mimeType,
            name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetailChange = (field: keyof StudentDetails, value: string) => {
    setStudentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGenerate = async () => {
    if (inputType === 'text' && !topic) return;
    if (inputType === 'file' && !fileData) return;

    setLoading(true);
    setDiagrams({});
    setCurrentDocId(null);
    
    try {
      const config: GenerationConfig = {
        stream,
        topic: inputType === 'text' ? topic : `Analysis of uploaded file: ${fileData?.name}`,
        tone: type === 'report' ? 'formal' : 'academic',
        teacherMode
      };

      const filePayload = inputType === 'file' && fileData ? {
          data: fileData.data,
          mimeType: fileData.mimeType
      } : undefined;

      let content = '';
      if (type === 'assignment') content = await GeminiService.generateAssignment(config, filePayload);
      else if (type === 'notes') content = await GeminiService.generateNotes(config, filePayload);
      else if (type === 'report') content = await GeminiService.generateReport(config, filePayload);
      else if (type === 'viva') content = await GeminiService.generateViva(config, filePayload);
      else content = 'Error: Unknown type';
      
      const generatedData: GeneratedContent = { 
          title: inputType === 'text' ? topic : (fileData?.name || `Generated ${type}`),
          content: content,
          type: type
      };

      setResult(generatedData);
      setEditableContent(content);
      setLoading(false);

      const diagramRegex = /\[DIAGRAM_REQ:\s*(.*?)\]/g;
      const matches = [...content.matchAll(diagramRegex)];
      
      if (matches.length > 0) {
          setIsGeneratingDiagram(true);
          let updatedContent = content;
          const promises = matches.map(async (match, index) => {
              const prompt = match[1];
              const uniqueId = `diag_${Date.now()}_${index}`;
              return { prompt, uniqueId };
          });
          const tasks = await Promise.all(promises);
          tasks.forEach(({ prompt, uniqueId }) => {
              updatedContent = updatedContent.split(`[DIAGRAM_REQ: ${prompt}]`).join(`[DIAGRAM_ID: ${uniqueId}]`);
          });
          setResult({ ...generatedData, content: updatedContent });
          setEditableContent(updatedContent);

          await Promise.all(tasks.map(async ({ prompt, uniqueId }) => {
              try {
                  const img = await GeminiService.generateDiagram(prompt);
                  setDiagrams(prev => ({ ...prev, [uniqueId]: img }));
              } catch (e) {
                  console.error("Failed diagram:", prompt);
              }
          }));
          setIsGeneratingDiagram(false);
      }
    } catch (error) {
      alert("Failed to generate content.");
      setLoading(false);
    }
  };

  const handleManualDiagramAdd = async () => {
      if (!diagramPrompt) return;
      setIsGeneratingDiagram(true);
      const uniqueId = `diag_manual_${Date.now()}`;
      try {
          const img = await GeminiService.generateDiagram(diagramPrompt);
          setDiagrams(prev => ({ ...prev, [uniqueId]: img }));
          const tag = `\n[DIAGRAM_ID: ${uniqueId}]\n`;
          const newContent = tag + editableContent;
          setEditableContent(newContent);
          if (result) setResult({ ...result, content: newContent });
          setDiagramPrompt('');
          setShowDiagramTools(false);
      } catch (e) {
          alert("Failed manual diagram");
      } finally {
          setIsGeneratingDiagram(false);
      }
  };

  const handleRegenerateDiagram = async (id: string) => {
      const newPrompt = prompt('Enter description to regenerate diagram:', 'Academic Diagram');
      if (!newPrompt) return;
      setIsGeneratingDiagram(true);
      try {
          const img = await GeminiService.generateDiagram(newPrompt);
          setDiagrams(prev => ({ ...prev, [id]: img }));
      } catch (e) {
          alert("Failed to regenerate");
      } finally {
          setIsGeneratingDiagram(false);
      }
  };

  const handleDeleteDiagram = (id: string) => {
      const regex = new RegExp(`\\[DIAGRAM_ID:\\s*${id}(?:\\s*\\|\\s*H:\\s*\\d+)?\\]`, 'g');
      
      const newContent = editableContent.replace(regex, '');
      setEditableContent(newContent);
      if (result) setResult({ ...result, content: newContent });
      const newDiagrams = { ...diagrams };
      delete newDiagrams[id];
      setDiagrams(newDiagrams);
  };

  const handleDuplicateDiagram = (oldId: string, newId: string) => {
      setDiagrams(prev => ({ ...prev, [newId]: prev[oldId] }));
  };

  const handleContentChange = (newContent: string) => {
      setEditableContent(newContent);
      if (result) setResult({ ...result, content: newContent });
  };

  const handleSaveToCloud = async () => {
      if (!currentUser || !result) {
          if (!currentUser) alert("Please sign in to save to cloud.");
          return;
      }
      
      if (!isFirebaseConfigured()) {
          alert("Cloud saving requires Firebase configuration.");
          return;
      }

      setIsSaving(true);
      try {
          const item: Omit<SavedContentItem, 'createdAt' | 'updatedAt'> = {
              uid: currentUser.uid,
              type: type,
              title: result.title,
              content: editableContent,
              diagrams: diagrams,
              config: {
                  handwritingStyle, inkColor, paperType
              }
          };

          const newId = await saveToHistory(item, currentDocId || undefined);
          setCurrentDocId(newId);
          setSaveStatus('saved');
          setTimeout(() => setSaveStatus(null), 2000); 
      } catch (error) {
          console.error("Save failed", error);
          setSaveStatus('error');
          setTimeout(() => setSaveStatus(null), 2000);
      } finally {
          setIsSaving(false);
      }
  };

  const handleExport = async (format: 'pdf' | 'images' | 'docx', pages: number[] | 'all', quality: 'standard' | 'high' = 'standard') => {
      setIsExporting(true);
      setVisiblePages(pages);
      
      await new Promise(resolve => setTimeout(resolve, 800));

      try {
          const pageElements = document.querySelectorAll('[id^="page-"]');
          if (pageElements.length === 0) throw new Error("No pages found for export");

          const pageWidth = getPaperWidth();
          const pageHeight = getPaperHeight();

          if (format === 'pdf') {
              const doc = new jsPDF('p', 'mm', 'a4');
              
              for (let i = 0; i < pageElements.length; i++) {
                  const originalEl = pageElements[i] as HTMLElement;
                  const innerContent = originalEl.querySelector('div[class*="relative"]') as HTMLElement;
                  if (!innerContent) continue;

                  const clone = innerContent.cloneNode(true) as HTMLElement;
                  
                  clone.style.width = `${pageWidth}px`;
                  clone.style.height = `${pageHeight}px`;
                  clone.style.transform = 'none';
                  clone.style.margin = '0';
                  clone.style.position = 'fixed';
                  clone.style.top = '0';
                  clone.style.left = '0';
                  clone.style.zIndex = '-9999';
                  clone.style.boxShadow = 'none';
                  
                  document.body.appendChild(clone);

                  try {
                      if (i > 0) doc.addPage();
                      
                      const canvas = await html2canvas(clone, { 
                          scale: quality === 'high' ? 2 : 1.5,
                          useCORS: true, 
                          logging: false,
                          backgroundColor: '#ffffff',
                          width: pageWidth,
                          height: pageHeight,
                          windowWidth: pageWidth,
                          windowHeight: pageHeight
                      });
                      
                      const imgType = quality === 'high' ? 'image/png' : 'image/jpeg';
                      const imgQuality = quality === 'high' ? 1.0 : 0.85;
                      const compression = quality === 'high' ? 'NONE' : 'JPEG';
                      const imgData = canvas.toDataURL(imgType, imgQuality);
                      const pdfWidth = 210; 
                      const pdfHeight = 297;
                      
                      doc.addImage(imgData, compression, 0, 0, pdfWidth, pdfHeight);
                  } finally {
                      document.body.removeChild(clone);
                  }
              }
              doc.save(`${result?.title || 'DevStudy_Export'}.pdf`);
          
          } else if (format === 'images') {
               for (let i = 0; i < pageElements.length; i++) {
                  const originalEl = pageElements[i] as HTMLElement;
                  const innerContent = originalEl.querySelector('div[class*="relative"]') as HTMLElement;
                  if (!innerContent) continue;

                  const clone = innerContent.cloneNode(true) as HTMLElement;
                  clone.style.width = `${pageWidth}px`;
                  clone.style.height = `${pageHeight}px`;
                  clone.style.transform = 'none';
                  clone.style.position = 'fixed';
                  clone.style.top = '0';
                  clone.style.left = '0';
                  clone.style.zIndex = '-9999';
                  document.body.appendChild(clone);

                  try {
                      const canvas = await html2canvas(clone, {
                          scale: 2, 
                          useCORS: true,
                          logging: false,
                          backgroundColor: '#ffffff',
                          width: pageWidth,
                          height: pageHeight,
                          windowWidth: pageWidth
                      });
                      
                      const link = document.createElement('a');
                      link.download = `${result?.title}_page_${i + 1}.png`;
                      link.href = canvas.toDataURL('image/png');
                      link.click();
                  } finally {
                      document.body.removeChild(clone);
                  }
                  
                  await new Promise(resolve => setTimeout(resolve, 200));
               }
          } else if (format === 'docx') {
              const contentToExport = editableContent || result?.content || '';
              const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${result?.title}</title></head><body style="font-family: 'Times New Roman', serif; font-size: 12pt;">`;
              const postHtml = "</body></html>";
              
              let htmlContent = contentToExport
                  .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                  .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                  .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                  .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
                  .replace(/\*(.*)\*/gim, '<i>$1</i>')
                  .replace(/^Q(\d+)[\.:\)] (.*)/gim, '<p><b>Q$1. $2</b></p>') 
                  .replace(/^Answer: (.*)/gim, '<p>Answer: $1</p>')
                  .replace(/\n/gim, '<br>');
              
              if (studentDetails && (studentDetails.name || studentDetails.enrollmentNo)) {
                  const headerHtml = `
                    <div style="text-align:center; margin-bottom:20px;">
                        <h2>${studentDetails.instituteName || ''}</h2>
                        <p>${studentDetails.name || ''} | ${studentDetails.enrollmentNo || ''}</p>
                        <hr/>
                    </div>
                  `;
                  htmlContent = headerHtml + htmlContent;
              }

              const html = preHtml + htmlContent + postHtml;
              
              const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
              
              const url = URL.createObjectURL(blob);
              
              const downloadLink = document.createElement("a");
              document.body.appendChild(downloadLink);
              downloadLink.href = url;
              downloadLink.download = `${result?.title || 'DevStudy_Document'}.doc`;
              downloadLink.click();
              
              document.body.removeChild(downloadLink);
              URL.revokeObjectURL(url);
          }

      } catch (e) {
          console.error("Export failed", e);
          alert("Export failed. Please try again.");
      } finally {
          setVisiblePages('all');
          setIsExporting(false);
          setShowExportModal(false);
      }
  };

  const toggleEditMode = () => {
    if (isEditingContent && result) setResult({ ...result, content: editableContent });
    setIsEditingContent(!isEditingContent);
  };
  
  const getEditorFont = () => {
      if (writingMode === 'typed') return 'serif';
      return (FONTS.handwritten as any)[handwritingStyle] || FONTS.handwritten.indian;
  };

  const toggleStylePanel = () => {
      setShowStyleSettings(!showStyleSettings);
      setShowLayoutSettings(false);
      setShowDiagramTools(false);
  };

  const toggleLayoutPanel = () => {
      setShowLayoutSettings(!showLayoutSettings);
      setShowStyleSettings(false);
      setShowDiagramTools(false);
  };

  const toggleDiagramPanel = () => {
      setShowDiagramTools(!showDiagramTools);
      setShowStyleSettings(false);
      setShowLayoutSettings(false);
  };

  const getEditorStyle = () => {
      let baseColor = '#ffffff';
      let lineColor = '#aebcd4';
      let grainLayer = null;
  
      if (paperTone === 'clean') {
          baseColor = '#ffffff';
          lineColor = '#bfdbfe';
      } else if (paperTone === 'dull') {
          baseColor = '#f1f5f9';
          lineColor = '#94a3b8';
      } else if (paperTone === 'realistic') {
          baseColor = '#fdfbf7';
          lineColor = '#b0bec5';
          grainLayer = NOISE_SVG;
      }
  
      interface Layer {
          image: string;
          size: string;
          position: string;
      }
      const layers: Layer[] = [];

      if (grainLayer) {
        layers.push({ image: grainLayer, size: '400px 400px', position: '0 0' });
      }

      if (paperType !== 'plain') {
          const marginX = marginLeft - 24; 
          layers.push({
            // Increased width to 3px and darker color for better visibility on mobile zoom-out
            image: `linear-gradient(90deg, transparent ${marginX}px, #dc2626 ${marginX}px, #dc2626 ${marginX + 3}px, transparent ${marginX + 3}px)`,
            size: '100% 100%',
            position: '0 0'
          });
      }

      if (paperType === 'ruled' || paperType === 'margin') {
        const headerY = marginTop;
        layers.push({
             image: `linear-gradient(180deg, transparent ${headerY-4}px, ${lineColor} ${headerY-4}px, transparent ${headerY-3}px, transparent ${headerY-1}px, ${lineColor} ${headerY-1}px, transparent ${headerY}px)`,
             size: '100% 100%',
             position: '0 0'
        });
      }

      if (paperType === 'ruled' || paperType === 'margin') {
        layers.push({
            image: `linear-gradient(to bottom, ${baseColor} ${marginTop}px, transparent ${marginTop}px)`,
            size: '100% 100%',
            position: '0 0'
        });
      }
  
      if (paperType === 'ruled' || paperType === 'margin') {
          layers.push({
              image: `linear-gradient(${lineColor} 1px, transparent 1px)`,
              size: `100% ${lineHeight}px`,
              position: `0 ${marginTop}px`
          });
      }
      
      return {
          backgroundColor: baseColor,
          backgroundImage: layers.map(l => l.image).join(', '),
          backgroundSize: layers.map(l => l.size).join(', '),
          backgroundPosition: layers.map(l => l.position).join(', '),
          backgroundAttachment: 'local'
      };
  };

  const PageBreaksOverlay = () => {
    const totalH = parseInt(editorHeight) || getPaperHeight();
    const h = getPaperHeight();
    const count = Math.floor(totalH / h);
    const markers = [];
    for (let i = 1; i <= count; i++) {
        markers.push(
            <div key={i} className="absolute w-full border-b-2 border-dashed border-red-300/30 flex items-center justify-end px-2 z-0 pointer-events-none" style={{ top: i * h, left: 0 }}>
                <span className="text-[10px] text-red-300 font-bold bg-white/50 px-1 rounded">Page Break {i + 1}</span>
            </div>
        );
    }
    return <div className="absolute inset-0 pointer-events-none z-0">{markers}</div>;
  };

  const MobileHUD = () => {
    if (showStyleSettings || showLayoutSettings || showDiagramTools) return null;
    return createPortal(
        <div className="md:hidden fixed bottom-4 inset-x-4 z-[70] animate-slide-up print-hide pointer-events-none flex justify-center">
            <div className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-xl rounded-full shadow-2xl p-1.5 flex justify-between items-center border border-white/10 dark:border-slate-200/30 pointer-events-auto min-w-[280px]">
                <button onClick={toggleEditMode} className={`flex-1 flex flex-col items-center justify-center gap-1 h-12 w-12 rounded-full transition-all ${isEditingContent ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5 active:scale-95'}`}>
                    {isEditingContent ? <Check size={20}/> : <Edit3 size={20}/>}
                </button>
                <div className="w-px h-6 bg-white/10 dark:bg-black/10 mx-1"></div>
                <button onClick={() => setWritingMode(prev => prev === 'typed' ? 'handwritten' : 'typed')} className="flex-1 flex flex-col items-center justify-center gap-1 h-12 w-12 rounded-full text-slate-400 hover:bg-white/5 active:scale-95 transition-all">
                    {writingMode === 'typed' ? <PenTool size={20}/> : <TypeIcon size={20}/>}
                </button>
                {writingMode === 'handwritten' && (
                    <>
                        <div className="w-px h-6 bg-white/10 dark:bg-black/10 mx-1"></div>
                        <button onClick={toggleStylePanel} className={`flex-1 flex flex-col items-center justify-center gap-1 h-12 w-12 rounded-full transition-all ${showStyleSettings ? 'text-primary-400 dark:text-primary-600 bg-white/10 dark:bg-black/5' : 'text-slate-400 hover:bg-white/5 active:scale-95'}`}>
                            <Palette size={20}/>
                        </button>
                        <div className="w-px h-6 bg-white/10 dark:bg-black/10 mx-1"></div>
                        <button onClick={toggleLayoutPanel} className={`flex-1 flex flex-col items-center justify-center gap-1 h-12 w-12 rounded-full transition-all ${showLayoutSettings ? 'text-primary-400 dark:text-primary-600 bg-white/10 dark:bg-black/5' : 'text-slate-400 hover:bg-white/5 active:scale-95'}`}>
                            <Maximize size={20}/>
                        </button>
                    </>
                )}
            </div>
        </div>,
        document.body
    );
  };

  const getGenerateButtonText = () => {
      if (type === 'viva') return 'Generate Questions';
      if (type === 'report') return 'Generate Article';
      if (type === 'notes') return 'Generate Notes';
      return 'Generate Assignment';
  };

  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in space-y-8">
            <div className="relative">
                <div className="relative animate-float">
                    <Mascot state="thinking" size={140} />
                </div>
            </div>
            <div className="text-center space-y-3">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white animate-pulse">DevBot is Thinking...</h3>
                <p className="text-slate-500 font-medium">Synthesizing {type} structure & magic</p>
            </div>
            <div className="w-72 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full animate-shimmer" style={{ width: '50%' }}></div>
            </div>
        </div>
    );
  }

  if (result) {
    return (
      <div className="relative pb-24 md:pb-10 min-h-screen print:pb-0 print:animate-none">
        <ExportModal 
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            onExport={handleExport}
            isProcessing={isExporting}
            pageCount={totalPages}
        />

        {/* TOP TOOLBAR */}
        <div ref={toolbarRef} className="sticky top-4 z-50 flex items-center justify-between mb-8 glass-panel p-3 rounded-2xl shadow-xl shadow-slate-200/20 dark:shadow-black/40 print-hide mx-auto w-[98%] md:w-[95%] max-w-6xl transition-all duration-300 animate-slide-down backdrop-blur-xl border border-white/50 dark:border-slate-700/50">
            
            <div className="flex items-center gap-3 shrink-0 max-w-[65%] md:max-w-none overflow-hidden">
                <Button variant="ghost" size="sm" onClick={() => { setResult(null); setEditorMode(false); navigate(location.pathname, { replace: true, state: {} }); }} className="rounded-lg p-2.5 hover:bg-slate-200/50">
                    <ArrowLeft size={20} />
                </Button>
                <div className="flex items-center gap-3 overflow-hidden">
                     <Mascot state="happy" size={36} className="hidden sm:block shrink-0" />
                     <div className="min-w-0 flex flex-col justify-center">
                        <h2 className="font-bold text-base text-slate-900 dark:text-white leading-tight truncate">
                            {result.title}
                        </h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest hidden sm:block">{result.type} Mode Active</p>
                        </div>
                     </div>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-1.5 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-lg mx-4 overflow-x-auto no-scrollbar shrink">
                <Button size="sm" variant={isEditingContent ? 'primary' : 'ghost'} onClick={toggleEditMode} className="gap-2 rounded-lg whitespace-nowrap">
                    {isEditingContent ? <><Check size={16}/> <span className="hidden xl:inline">Done</span></> : <><Edit3 size={16}/> <span className="hidden xl:inline">Edit Text</span></>}
                </Button>
                
                <Button size="sm" variant="ghost" onClick={() => setWritingMode(prev => prev === 'typed' ? 'handwritten' : 'typed')} className="gap-2 rounded-lg whitespace-nowrap">
                    {writingMode === 'typed' ? <PenTool size={16} /> : <TypeIcon size={16} />}
                    <span className="hidden xl:inline">{writingMode === 'typed' ? 'Handwrite' : 'Type'}</span>
                </Button>
                
                <Button size="sm" variant={showDiagramTools ? 'primary' : 'ghost'} onClick={toggleDiagramPanel} className="gap-2 rounded-lg whitespace-nowrap">
                    <Pencil size={16} /> <span className="hidden xl:inline">Diagrams</span>
                </Button>
                
                {writingMode === 'handwritten' && (
                    <>
                        <Button size="sm" variant={showStyleSettings ? 'primary' : 'ghost'} onClick={toggleStylePanel} className="gap-2 rounded-lg whitespace-nowrap">
                            <Palette size={16} /> <span className="hidden xl:inline">Style</span>
                        </Button>

                        <Button size="sm" variant={showLayoutSettings ? 'primary' : 'ghost'} onClick={toggleLayoutPanel} className="gap-2 rounded-lg whitespace-nowrap">
                            <Maximize size={16} /> <span className="hidden xl:inline">Layout</span>
                        </Button>
                    </>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                 <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleSaveToCloud} 
                    disabled={isSaving}
                    className={`gap-2 rounded-lg px-3 py-2.5 transition-all ${saveStatus === 'saved' ? 'text-green-600 bg-green-50' : saveStatus === 'error' ? 'text-red-500 bg-red-50' : ''}`}
                >
                    {isSaving ? <Loader2 size={18} className="animate-spin"/> : saveStatus === 'saved' ? <CheckCircle2 size={18}/> : <Cloud size={18} />}
                    <span className="hidden lg:inline text-xs ml-1 font-bold">Cloud Save</span>
                </Button>

                <Button size="sm" variant="secondary" onClick={() => setShowExportModal(true)} className="gap-2 rounded-lg px-4 lg:px-5 py-2.5 shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20">
                    <Download size={18} /> <span className="hidden lg:inline">Export</span>
                </Button>
            </div>
        </div>

        <StylePanel 
            isOpen={showStyleSettings} onClose={() => setShowStyleSettings(false)} panelRef={stylePanelRef}
            writingMode={writingMode} handwritingStyle={handwritingStyle} setHandwritingStyle={setHandwritingStyle}
            inkColor={inkColor} setInkColor={setInkColor} customInkColor={customInkColor} setCustomInkColor={setCustomInkColor}
            penType={penType} setPenType={setPenType} inkThickness={inkThickness} setInkThickness={setInkThickness}
            autoColor={autoColor} setAutoColor={setAutoColor} qaColorMode={qaColorMode} setQaColorMode={setQaColorMode}
        />

        <LayoutPanel 
            isOpen={showLayoutSettings} onClose={() => setShowLayoutSettings(false)} panelRef={layoutPanelRef}
            paperType={paperType} setPaperType={setPaperType} paperTone={paperTone} setPaperTone={setPaperTone}
            paperSize={paperSize} setPaperSize={setPaperSize} showTitle={showTitle} setShowTitle={setShowTitle}
            showWatermark={showWatermark} setShowWatermark={setShowWatermark} watermarkText={watermarkText} setWatermarkText={setWatermarkText}
            fontSize={fontSize} setFontSize={setFontSize} lineHeight={lineHeight} setLineHeight={setLineHeight}
            marginLeft={marginLeft} setMarginLeft={setMarginLeft} marginRight={marginRight} setMarginRight={setMarginRight}
            marginTop={marginTop} setMarginTop={setMarginTop} marginBottom={marginBottom} setMarginBottom={setMarginBottom}
            verticalOffset={verticalOffset} setVerticalOffset={setVerticalOffset}
        />

        <DiagramPanel 
            isOpen={showDiagramTools} onClose={() => setShowDiagramTools(false)} panelRef={diagramPanelRef}
            diagramPrompt={diagramPrompt} setDiagramPrompt={setDiagramPrompt} handleManualDiagramAdd={handleManualDiagramAdd}
            isGeneratingDiagram={isGeneratingDiagram}
        />

        {isGeneratingDiagram && (
            <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-800 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-slide-down print-hide border border-slate-200 dark:border-slate-700">
                <Loader2 className="animate-spin text-primary-600" size={20} />
                <span className="text-sm font-bold tracking-wide text-primary-700 dark:text-primary-300">Illustrating with AI...</span>
            </div>
        )}

        {/* DOCUMENT PREVIEW */}
        <div className="print-show relative min-h-screen w-full flex flex-col items-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
             {isEditingContent ? (
                 <PaperContainer paperWidth={getPaperWidth()}>
                    <div className="relative bg-white shadow-2xl shadow-slate-400/20 rounded-sm overflow-hidden"
                        style={{
                            width: getPaperWidth(), minHeight: getPaperHeight(), height: editorHeight,
                            paddingTop: marginTop, paddingBottom: marginBottom, paddingLeft: marginLeft, paddingRight: marginRight,
                            ...getEditorStyle()
                        }}
                    >
                        <PageBreaksOverlay />
                        <textarea
                            ref={textareaRef}
                            value={editableContent}
                            onChange={(e) => setEditableContent(e.target.value)}
                            placeholder="Start typing or editing your academic content..."
                            className="relative z-10 w-full h-full bg-transparent outline-none resize-none border-none p-0 m-0 overflow-hidden focus:ring-0"
                            style={{
                                fontFamily: getEditorFont(),
                                fontSize: `${fontSize}px`,
                                lineHeight: `${lineHeight}px`,
                                color: inkColor === 'black' ? '#0f172a' : (inkColor === 'custom' ? customInkColor : '#1d4ed8'),
                                transform: writingMode === 'handwritten' ? `translateY(${verticalOffset}px)` : 'none',
                            }}
                            spellCheck="false"
                        />
                    </div>
                 </PaperContainer>
            ) : (
                <div className="py-5 md:py-10 w-full">
                    <PaperContainer paperWidth={getPaperWidth()}>
                        {writingMode === 'typed' ? (
                            <TypedPaper 
                                content={result.content} title={result.title} showTitle={showTitle}
                                studentDetails={studentDetails} fontSize={fontSize} margins={{top: marginTop, bottom: marginBottom, left: marginLeft, right: marginRight}} 
                                lineHeight={lineHeight} paperSize={paperSize} paperType={paperType} diagrams={diagrams} 
                                visiblePages={visiblePages} onPageCountChange={setTotalPages} isArticle={type === 'report'}
                            />
                        ) : (
                            <HandwritingPaper 
                                content={result.content} title={result.title} showTitle={showTitle} showWatermark={showWatermark} watermarkText={watermarkText}
                                handwritingStyle={handwritingStyle} inkColor={inkColor} customInkColor={customInkColor} penType={penType} inkThickness={inkThickness}
                                autoColor={autoColor} qaColorMode={qaColorMode} paperType={paperType} paperTone={paperTone} paperSize={paperSize} 
                                studentDetails={studentDetails} fontSize={fontSize} lineHeight={lineHeight} verticalOffset={verticalOffset} 
                                customDate={includeDate ? (dateValue ? formatDateForPaper(dateValue) : '') : undefined}
                                margins={{top: marginTop, bottom: marginBottom, left: marginLeft, right: marginRight}} 
                                diagrams={diagrams} onRegenerateDiagram={handleRegenerateDiagram} onDeleteDiagram={handleDeleteDiagram}
                                onDuplicateDiagram={handleDuplicateDiagram} onContentChange={handleContentChange} visiblePages={visiblePages} onPageCountChange={setTotalPages}
                            />
                        )}
                    </PaperContainer>
                </div>
            )}
        </div>
        <MobileHUD />
      </div>
    );
  }

  // INITIAL FORM VIEW
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center animate-fade-in p-4">
       <div className="mb-8 text-center space-y-4">
           <Mascot state="idle" size={140} className="drop-shadow-xl" />
           <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
           <p className="text-slate-500 font-medium max-w-md mx-auto leading-relaxed">
             Enter your topic details below. Our AI will synthesize the {type === 'viva' ? 'viva questions' : (type === 'report' ? 'article' : 'content')} instantly.
           </p>
       </div>

       {/* FORM CONTAINER */}
       <div className="w-full max-w-xl space-y-4">
           
           {(type === 'assignment' || type === 'report') && (
               <Card className="mb-2 overflow-hidden border-slate-200 dark:border-slate-800">
                    <button 
                        onClick={() => setIsStudentDetailsCollapsed(!isStudentDetailsCollapsed)}
                        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center text-primary-600 shadow-sm">
                               <User size={20} />
                            </div>
                            <div className="text-left">
                               <span className="block text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Student Profile</span>
                               <p className="text-[10px] text-slate-500 font-bold">Add Name, Roll No, Date</p>
                            </div>
                        </div>
                        {isStudentDetailsCollapsed ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronUp size={20} className="text-slate-400" />}
                    </button>

                    {!isStudentDetailsCollapsed && (
                        <div className="p-5 pt-0 space-y-4 animate-slide-down border-t border-slate-100 dark:border-slate-800 mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <Input label="Student Name" value={studentDetails.name} onChange={(e) => handleDetailChange('name', e.target.value)} placeholder="Your Name" />
                                <Input label="Institution" value={studentDetails.instituteName} onChange={(e) => handleDetailChange('instituteName', e.target.value)} placeholder="College Name" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <Input label="Branch" value={studentDetails.branch} onChange={(e) => handleDetailChange('branch', e.target.value)} placeholder="CSE" />
                                <Input label="Semester" value={studentDetails.semester} onChange={(e) => handleDetailChange('semester', e.target.value)} placeholder="Sem IV" />
                                <Input label="Subject Code" value={studentDetails.subjectCode} onChange={(e) => handleDetailChange('subjectCode', e.target.value)} placeholder="CS-101" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Enrollment Number" value={studentDetails.enrollmentNo} onChange={(e) => handleDetailChange('enrollmentNo', e.target.value)} placeholder="Roll No" />
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1">Date</label>
                                    <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-700">
                                        <input type="checkbox" checked={includeDate} onChange={e => setIncludeDate(e.target.checked)} className="w-4 h-4 accent-primary-600 rounded cursor-pointer" />
                                        <input type="date" value={dateValue} onChange={(e) => setDateValue(e.target.value)} disabled={!includeDate} className="bg-transparent text-sm text-slate-900 dark:text-white outline-none w-full disabled:opacity-50" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
               </Card>
           )}

           <Card className="p-6 md:p-8 space-y-6 shadow-xl shadow-slate-200/50 dark:shadow-none border-slate-200 dark:border-slate-800">
               <div className="space-y-5">
                  {allowFileUpload && (
                      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                          <button onClick={() => setInputType('text')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all shadow-sm ${inputType === 'text' ? 'bg-white dark:bg-slate-700 text-primary-600' : 'text-slate-500 hover:bg-white/50'}`}>Topic Input</button>
                          <button onClick={() => setInputType('file')} className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all shadow-sm ${inputType === 'file' ? 'bg-white dark:bg-slate-700 text-primary-600' : 'text-slate-500 hover:bg-white/50'}`}>Upload File</button>
                      </div>
                  )}

                  {inputType === 'text' ? (
                      <div className="space-y-4">
                          <Input label="Topic or Question" placeholder="e.g. Thermodynamics Laws..." value={topic} onChange={(e) => setTopic(e.target.value)} autoFocus className="text-lg font-medium" />
                      </div>
                  ) : (
                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all cursor-pointer group" onClick={() => fileInputRef.current?.click()}>
                          <input ref={fileInputRef} type="file" accept=".pdf,.txt,.docx" className="hidden" onChange={handleFileChange} />
                          <div className="w-16 h-16 bg-primary-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"><Upload className="text-primary-600" size={32} /></div>
                          <p className="font-bold text-slate-700 dark:text-slate-300 text-lg">{fileData ? fileData.name : "Click to Upload Context"}</p>
                          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">PDF, TXT, DOCX</p>
                      </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select label="Stream" options={STREAMS} value={stream} onChange={(e) => setStream(e.target.value as Stream)} direction="top" />
                      <Select label="Teacher Persona" options={TEACHER_MODES.map(m => m.label)} value={TEACHER_MODES.find(m => m.value === teacherMode)?.label || ''} onChange={(e) => { const mode = TEACHER_MODES.find(m => m.label === e.target.value)?.value; if (mode) setTeacherMode(mode as TeacherMode); }} direction="top" />
                  </div>
               </div>

               <Button size="lg" className="w-full py-4 text-lg shadow-lg shadow-primary-600/20 rounded-xl" onClick={handleGenerate} disabled={inputType === 'text' && !topic}>
                  <Sparkles className="mr-2 animate-pulse" /> {getGenerateButtonText()}
               </Button>
           </Card>
       </div>
    </div>
  );
};