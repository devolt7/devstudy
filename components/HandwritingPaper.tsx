import React, { useMemo, useState, useRef, useEffect, memo } from 'react';
import { HandwritingStyle, InkColor, PaperType, PaperSize, StudentDetails, PenType, QAColorMode, PaperTone } from '../types';
import { FONTS } from '../constants';
import { Move, Maximize2, Trash2, RefreshCw, Copy, Crop, X } from 'lucide-react';

interface HandwritingPaperProps {
  content: string;
  handwritingStyle: HandwritingStyle;
  inkColor: InkColor;
  customInkColor?: string;
  penType?: PenType; 
  inkThickness?: number; 
  autoColor?: boolean; 
  qaColorMode?: QAColorMode;
  paperType: PaperType;
  paperTone?: PaperTone;
  paperSize?: PaperSize;
  title?: string;
  showTitle?: boolean; 
  showWatermark?: boolean; 
  watermarkText?: string; 
  studentDetails?: StudentDetails | null;
  fontSize?: number;
  lineHeight?: number; 
  verticalOffset?: number; 
  customDate?: string; 
  margins?: { top: number, bottom: number, left: number, right: number };
  diagrams?: Record<string, string>;
  onRegenerateDiagram?: (id: string) => void;
  onDeleteDiagram?: (id: string) => void;
  onDuplicateDiagram?: (oldId: string, newId: string) => void;
  onContentChange?: (newContent: string) => void;
  visiblePages?: number[] | 'all';
  onPageCountChange?: (count: number) => void;
  onPaperClick?: () => void;
}

// SVG Noise Pattern for Grain (Used only in 'realistic' mode)
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`;

const DIAGRAM_REGEX = /\[DIAGRAM_ID:\s*([^\]|]+)(?:\s*\|\s*H:\s*(\d+))?\]/;

const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const isTableLine = (line: string) => {
    return line.trim().startsWith('|') && line.trim().endsWith('|');
};

// Optimized Line Component
const RealisticLine = memo<{ 
    line: string; 
    lineIndex: number; 
    primaryColor: string;
    secondaryColor: string;
    penType: PenType;
    inkThickness: number;
    fontSize: number;
    isQuestionMode: boolean;
    autoColor: boolean;
    qaColorMode: QAColorMode;
}>(({ line, lineIndex, primaryColor, secondaryColor, penType, inkThickness, fontSize, isQuestionMode, autoColor, qaColorMode }) => {
    
    if (isTableLine(line)) {
        const cells = line.trim().slice(1, -1).split('|');
        if (line.includes('---')) {
             return <div className="w-full h-4 border-b-2 border-slate-800 opacity-80 mb-2 transform rotate-1"></div>;
        }
        return (
            <div className="flex w-full border-b border-slate-400/50">
                {cells.map((cell, idx) => (
                    <div 
                        key={idx} 
                        className="flex-1 px-2 border-r border-slate-400/50 last:border-r-0"
                        style={{ fontSize: `${fontSize * 0.9}px`, color: primaryColor }}
                    >
                         <RealisticLine 
                            line={cell.trim()} 
                            lineIndex={lineIndex + idx} 
                            primaryColor={primaryColor}
                            secondaryColor={secondaryColor}
                            penType={penType}
                            inkThickness={inkThickness} 
                            fontSize={fontSize}
                            isQuestionMode={false}
                            autoColor={autoColor}
                            qaColorMode={qaColorMode}
                        />
                    </div>
                ))}
            </div>
        );
    }

    let finalColor = primaryColor;
    if (autoColor && qaColorMode !== 'unified') {
        if (qaColorMode === 'inverse') {
             finalColor = isQuestionMode ? primaryColor : secondaryColor;
        } else {
             finalColor = isQuestionMode ? secondaryColor : primaryColor;
        }
    } else {
        finalColor = primaryColor;
    }

    const penStyles: React.CSSProperties = {
        color: finalColor,
        mixBlendMode: 'normal', 
        fontWeight: penType === 'gel' || inkThickness > 0.5 ? 600 : 500,
        WebkitTextStrokeWidth: inkThickness > 0 ? `${inkThickness}px` : '0px',
        WebkitTextStrokeColor: finalColor,
        filter: penType === 'gel' ? 'contrast(1.1)' : 'none', 
    };

    const words = line.split(' ');
    const lineDrift = (seededRandom(lineIndex * 99) - 0.5) * 1.5; 

    return (
        <div 
            className="w-full whitespace-pre-wrap will-change-transform" 
            style={{ 
                display: 'block',
                paddingLeft: `${Math.max(0, lineDrift)}px`,
                ...penStyles
            }}
        >
            {words.map((word, wordIndex) => {
                const seed = lineIndex * 100 + wordIndex;
                const rotation = (seededRandom(seed) - 0.5) * 2; 
                const yOffset = (seededRandom(seed + 1) - 0.5) * 2;
                const wordSpacing = 0.25 + (seededRandom(seed + 2) - 0.5) * 0.1;
                
                let wordOpacity = 1;
                if (penType === 'ballpoint') {
                    wordOpacity = 0.9 + (seededRandom(seed + 5) * 0.1); 
                }

                if (!word) return <span key={seed}> </span>;

                return (
                    <span 
                        key={wordIndex} 
                        className="inline-block origin-bottom"
                        style={{
                            transform: `rotate(${rotation.toFixed(2)}deg) translateY(${yOffset.toFixed(2)}px)`,
                            marginRight: `${wordSpacing}em`,
                            opacity: wordOpacity,
                        }}
                    >
                        {word}
                    </span>
                );
            })}
        </div>
    );
});

interface DiagramWrapperProps {
    id: string;
    src: string | undefined;
    heightLines: number;
    lineHeight: number;
    isSelected: boolean;
    onSelect: (e: React.MouseEvent) => void;
    onDelete: () => void;
    onRegenerate: () => void;
    onDuplicate: () => void;
    onResize: (newLines: number) => void;
    onMoveStart: (e: React.MouseEvent) => void;
}

const DiagramWrapper: React.FC<DiagramWrapperProps> = memo(({ 
    id, src, heightLines, lineHeight, isSelected, 
    onSelect, onDelete, onRegenerate, onDuplicate, onResize, onMoveStart 
}) => {
    const [isResizing, setIsResizing] = useState(false);
    const [tempHeight, setTempHeight] = useState(heightLines);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTempHeight(heightLines);
    }, [heightLines]);

    useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const newH = e.clientY - rect.top;
                const lines = Math.max(3, Math.round(newH / lineHeight));
                setTempHeight(lines);
            }
        };
        const handleMouseUp = () => {
            setIsResizing(false);
            onResize(tempHeight);
        };
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, lineHeight, tempHeight, onResize]);

    return (
        <div 
            ref={containerRef}
            className={`w-full relative flex items-center justify-center group transition-all ${isSelected ? 'z-20' : 'z-0'}`} 
            style={{ height: tempHeight * lineHeight }}
            onClick={onSelect}
        >
            <div className={`absolute inset-0 transition-all pointer-events-none ${isSelected ? 'border-2 border-primary-500 bg-primary-50/10' : 'group-hover:border-2 group-hover:border-dashed group-hover:border-slate-300'}`}></div>

            {isSelected && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-xl shadow-xl flex items-center gap-1 p-1 z-50 animate-scale-in print:hidden">
                     <button className="p-2 hover:bg-slate-700 rounded-lg cursor-grab active:cursor-grabbing" onMouseDown={onMoveStart} title="Drag to Move">
                        <Move size={14} />
                     </button>
                     <div className="w-px h-4 bg-slate-700 mx-1"></div>
                     <button className="p-2 hover:bg-slate-700 rounded-lg" onClick={(e) => { e.stopPropagation(); onDuplicate(); }} title="Duplicate">
                        <Copy size={14} />
                     </button>
                     <button className="p-2 hover:bg-slate-700 rounded-lg" onClick={(e) => { e.stopPropagation(); onRegenerate(); }} title="Regenerate">
                        <RefreshCw size={14} />
                     </button>
                     <button className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-200 rounded-lg" onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete">
                        <Trash2 size={14} />
                     </button>
                </div>
            )}

            {src ? (
                <div className="relative w-3/4 h-[90%] select-none">
                    <img 
                        src={src} 
                        alt="Diagram" 
                        className="w-full h-full object-contain pointer-events-none"
                        style={{ mixBlendMode: 'multiply' }} 
                    />
                </div>
            ) : (
                <div className="w-full h-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-sm opacity-50 select-none">[Diagram Space]</div>
            )}

            {isSelected && (
                <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-primary-500 rounded-t-lg cursor-ns-resize flex items-center justify-center shadow-lg print:hidden"
                    onMouseDown={(e) => { e.stopPropagation(); setIsResizing(true); }}
                >
                    <div className="w-6 h-1 border-t border-b border-white/50"></div>
                </div>
            )}
        </div>
    );
});

const HandwritingPaper: React.FC<HandwritingPaperProps> = ({ 
  content, 
  handwritingStyle, 
  inkColor, 
  customInkColor = '#0000FF',
  penType = 'ballpoint',
  inkThickness = 0,
  autoColor = true,
  qaColorMode = 'classic',
  paperType,
  paperTone = 'clean',
  paperSize = 'a4',
  title,
  showTitle = true,
  showWatermark = false,
  watermarkText = 'CONFIDENTIAL',
  studentDetails,
  fontSize = 18,
  lineHeight = 32, 
  verticalOffset = 4,
  customDate,
  margins,
  diagrams = {},
  onRegenerateDiagram,
  onDeleteDiagram,
  onDuplicateDiagram,
  onContentChange,
  visiblePages = 'all',
  onPageCountChange,
  onPaperClick
}) => {
  const [selectedDiagramId, setSelectedDiagramId] = useState<string | null>(null);
  const [dragState, setDragState] = useState<{ isDragging: boolean, sourceIndex: number, targetIndex: number | null }>({ isDragging: false, sourceIndex: -1, targetIndex: null });
  const paperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const handleGlobalClick = (e: MouseEvent) => {
          if (paperRef.current && !paperRef.current.contains(e.target as Node)) {
              setSelectedDiagramId(null);
          }
      };
      window.addEventListener('mousedown', handleGlobalClick);
      return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  const hasStudentDetails = useMemo(() => {
    if (!studentDetails) return false;
    // Check if any visible field has content
    const fieldsToCheck = ['name', 'instituteName', 'branch', 'semester', 'enrollmentNo', 'subjectCode'];
    return fieldsToCheck.some(field => {
        const val = (studentDetails as any)[field];
        return val && typeof val === 'string' && val.trim().length > 0;
    });
  }, [studentDetails]);

  const cleanContent = useMemo(() => {
    let text = content;
    const placeholders: string[] = [];
    text = text.replace(/\[DIAGRAM_ID:\s*([^\]]+)\]/g, (match) => {
        const key = `{{{DIAGRAM-TAG-${placeholders.length}}}}`;
        placeholders.push(match);
        return key;
    });

    text = text.replace(/\*\*/g, '')
               .replace(/__/g, '')
               .replace(/\*/g, '')
               .replace(/_/g, '') 
               .replace(/`/g, '')
               .replace(/#/g, '');

    text = text.replace(/\n\s*\n\s*(?=Answer:|Ans:)/gi, '\n');
    text = text.replace(/\n{3,}/g, '\n\n');

    text = text.replace(/{{{DIAGRAM-TAG-(\d+)}}}/g, (_, index) => {
        return placeholders[parseInt(index, 10)];
    });
    return text;
  }, [content]);

  const dimensions = useMemo(() => {
    let width = 794; 
    let height = 1123; 
    if (paperSize === 'letter') { width = 816; height = 1056; }
    if (paperSize === 'notebook') { width = 665; height = 945; }
    const defaultMargins = { top: 120, bottom: 60, left: 100, right: 30 };
    const activeMargins = margins || defaultMargins;
    return { width, height, ...activeMargins };
  }, [paperSize, margins]);

  const primaryInkHex = useMemo(() => {
    if (inkColor === 'custom') return customInkColor;
    const map: any = { blue: '#1a237e', light_blue: '#0ea5e9', dark_blue: '#172554', royal_blue: '#4338ca', ocean_blue: '#0e7490', black: '#0f172a', red: '#b91c1c', purple: '#7e22ce' };
    return map[inkColor] || '#1a237e';
  }, [inkColor, customInkColor]);

  const pages = useMemo(() => {
    const MAX_HEIGHT = dimensions.height - dimensions.top - dimensions.bottom;
    const USABLE_WIDTH = dimensions.width - dimensions.left - dimensions.right;
    
    const AVG_CHAR_WIDTH_PX = fontSize * 0.5;
    const AVG_WORD_SPACING_PX = fontSize * 0.35;

    const LINES_PER_PAGE = Math.floor(MAX_HEIGHT / lineHeight) - 1;

    interface PageLine {
        type: 'text' | 'diagram';
        content: string; 
        isQuestionMode: boolean;
        heightLines: number; 
        sourceIndex: number; 
    }
    const resultPages: { items: PageLine[] }[] = [];
    
    let headerLinesReserved = 0;
    
    // Only reserve lines if content is actually shown
    if (showTitle && title) {
        headerLinesReserved += 2; // Reduced from 3 to 2 for tighter fit
    }
    
    if (hasStudentDetails) {
        if (studentDetails?.instituteName) headerLinesReserved += 2;
        headerLinesReserved += 4;
    } else {
        // If no details, barely reserve any extra space to avoid the "useless space" issue
        // The title margin will also be handled in the render loop
    }

    let currentLineOnPage = headerLinesReserved; 
    let currentItems: PageLine[] = [];
    let isQuestionMode = false;

    const pushPage = () => {
        if (currentItems.length > 0) {
            resultPages.push({ items: [...currentItems] });
            currentItems = [];
            currentLineOnPage = 0;
        }
    };

    const wrapText = (text: string): string[] => {
        if (text.trim() === '') return [''];
        if (isTableLine(text)) return [text];
        
        const words = text.replace(/\t/g, '    ').split(' ');
        let lines: string[] = [];
        let currentLineWords: string[] = [];
        let currentLineWidth = 0;

        for (const word of words) {
            const wordWidth = (word.length * AVG_CHAR_WIDTH_PX) + AVG_WORD_SPACING_PX;
            if (currentLineWidth + wordWidth <= USABLE_WIDTH || currentLineWords.length === 0) {
                currentLineWords.push(word);
                currentLineWidth += wordWidth;
            } else {
                if (currentLineWords.length > 0) {
                    lines.push(currentLineWords.join(' '));
                }
                currentLineWords = [word];
                currentLineWidth = wordWidth;
            }
        }
        if (currentLineWords.length > 0) {
            lines.push(currentLineWords.join(' '));
        }
        return lines;
    };

    const rawLines = cleanContent.split('\n');

    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        if (line.includes('---PAGE_BREAK---')) {
             pushPage();
             continue;
        }
        
        const diagramMatch = line.match(DIAGRAM_REGEX);
        if (diagramMatch) {
            const diagramId = diagramMatch[1].trim(); 
            const customH = diagramMatch[2] ? parseInt(diagramMatch[2]) : 10;
            const finalH = Math.max(3, customH);

            if (currentLineOnPage + finalH > LINES_PER_PAGE) {
                pushPage();
            }
            currentItems.push({ 
                type: 'diagram', 
                content: diagramId, 
                isQuestionMode: false, 
                heightLines: finalH, 
                sourceIndex: i 
            });
            currentLineOnPage += finalH;
            continue;
        }

        const isQuestionStart = /^Q\d+[\.:\)]/.test(line.trim()) || /^Question\s+\d+/.test(line.trim()) || /^Q\./.test(line.trim());
        if (isQuestionStart) { isQuestionMode = true; }
        if (line.trim().startsWith('Answer:') || line.trim().startsWith('Ans:')) { isQuestionMode = false; }

        const wrappedLines = wrapText(line);
        for (const wLine of wrappedLines) {
            if (currentLineOnPage >= LINES_PER_PAGE) { pushPage(); }
            currentItems.push({ 
                type: 'text', 
                content: wLine, 
                isQuestionMode: isQuestionMode, 
                heightLines: 1, 
                sourceIndex: i 
            });
            currentLineOnPage++;
        }
    }
    if (currentItems.length > 0) { resultPages.push({ items: currentItems }); }
    return resultPages.length > 0 ? resultPages : [{ items: [] }];

  }, [cleanContent, fontSize, lineHeight, dimensions, showTitle, title, studentDetails, hasStudentDetails]);

  useEffect(() => {
     if (onPageCountChange) onPageCountChange(pages.length);
  }, [pages.length, onPageCountChange]);

  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
        const elements = document.querySelectorAll('[data-source-index]');
        let closestIndex = -1;
        let minDist = Infinity;

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const dist = Math.abs(e.clientY - (rect.top + rect.height/2));
            if (dist < minDist) {
                minDist = dist;
                closestIndex = parseInt(el.getAttribute('data-source-index') || '-1');
            }
        });

        if (closestIndex !== -1 && closestIndex !== dragState.targetIndex) {
            setDragState(prev => ({ ...prev, targetIndex: closestIndex }));
        }
    };

    const handleMouseUp = () => {
        if (dragState.targetIndex !== null && dragState.targetIndex !== dragState.sourceIndex && onContentChange) {
            const lines = cleanContent.split('\n');
            const itemToMove = lines[dragState.sourceIndex];
            lines.splice(dragState.sourceIndex, 1);
            let insertAt = dragState.targetIndex;
            if (dragState.sourceIndex < dragState.targetIndex) insertAt--;
            lines.splice(insertAt, 0, itemToMove);
            onContentChange(lines.join('\n'));
        }
        setDragState({ isDragging: false, sourceIndex: -1, targetIndex: null });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragState, cleanContent, onContentChange]);

  const handleDiagramAction = (action: 'delete' | 'resize' | 'move' | 'duplicate', id: string, payload?: any) => {
      if (!onContentChange) return;
      const lines = cleanContent.split('\n');
      const index = lines.findIndex(l => {
          const m = l.match(DIAGRAM_REGEX);
          return m && m[1].trim() === id;
      });

      if (index === -1) return;

      if (action === 'delete' && onDeleteDiagram) {
          onDeleteDiagram(id);
      } 
      else if (action === 'resize') {
          const newH = payload;
          lines[index] = `[DIAGRAM_ID: ${id} | H: ${newH}]`;
          onContentChange(lines.join('\n'));
      }
      else if (action === 'duplicate' && onDuplicateDiagram) {
          const newId = `${id}_copy_${Date.now()}`;
          onDuplicateDiagram(id, newId);
          lines.splice(index + 1, 0, `[DIAGRAM_ID: ${newId} | H: ${payload || 10}]`);
          onContentChange(lines.join('\n'));
      }
  };

  const getFontFamily = () => (FONTS.handwritten as any)[handwritingStyle] || FONTS.handwritten.indian;

  const getPaperStyles = () => {
    let baseColor = '#ffffff';
    let lineColor = '#aebcd4';
    let grainLayer = null;
    let vignette = null;
    let shadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';

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
        vignette = `radial-gradient(circle, transparent 50%, rgba(0,0,0,0.03) 100%)`;
        shadow = 'inset 0 0 20px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    }

    interface Layer { image: string; size: string; position: string; }
    const layers: Layer[] = [];

    // Order matters for stacking: Top to Bottom in array (CSS renders first item on top)
    
    // 1. Textures
    if (grainLayer) layers.push({ image: grainLayer, size: '400px 400px', position: '0 0' });
    if (vignette) layers.push({ image: vignette, size: '100% 100%', position: '0 0' });

    // 2. Vertical Red Margin Line (Left) - Always visible if paper is not plain
    if (paperType !== 'plain') {
        const marginX = dimensions.left - 24; 
        layers.push({
            // Gradient for margin line: Transparent until marginX, then dark red for 3px, then transparent
            // Made thicker (3px) and darker (#dc2626) to withstand mobile scaling/zoom-out aliasing
            image: `linear-gradient(90deg, transparent ${marginX}px, #dc2626 ${marginX}px, #dc2626 ${marginX + 3}px, transparent ${marginX + 3}px)`,
            size: '100% 100%',
            position: '0 0'
        });
    }

    // 3. Ruling Lines
    if (paperType === 'ruled' || paperType === 'margin') {
        const headerY = dimensions.top;
        
        // Header Border (Top horizontal lines)
        layers.push({
             image: `linear-gradient(180deg, transparent ${headerY-4}px, ${lineColor} ${headerY-4}px, transparent ${headerY-3}px, transparent ${headerY-1}px, ${lineColor} ${headerY-1}px, transparent ${headerY}px)`,
             size: '100% 100%',
             position: '0 0'
        });

        // Mask to hide horizontal lines in the top margin area
        layers.push({
            image: `linear-gradient(to bottom, ${baseColor} ${dimensions.top}px, transparent ${dimensions.top}px)`,
            size: '100% 100%',
            position: '0 0'
        });

        // The Horizontal Lines
        layers.push({
            image: `linear-gradient(${lineColor} 1px, transparent 1px)`,
            size: `100% ${lineHeight}px`,
            position: `0 ${dimensions.top}px` 
        });
    }

    return {
        backgroundColor: baseColor,
        backgroundImage: layers.map(l => l.image).join(', '),
        backgroundSize: layers.map(l => l.size).join(', '),
        backgroundPosition: layers.map(l => l.position).join(', '),
        backgroundAttachment: 'local',
        boxShadow: shadow,
    };
  };

  return (
    <div className="flex flex-col gap-8 items-center w-full print:block print:gap-0" ref={paperRef}>
      {pages.map((page, pageIndex) => {
        const isVisible = visiblePages === 'all' || visiblePages.includes(pageIndex + 1);
        if (!isVisible) return null;

        return (
            <div key={pageIndex} id={`page-${pageIndex + 1}`} className="print:break-after-page w-full flex justify-center py-4 print:py-0">
                <div 
                    onClick={onPaperClick}
                    className={`relative transition-all print:shadow-none print:m-0 print:border-none overflow-hidden ${onPaperClick ? 'cursor-text hover:ring-2 hover:ring-primary-400/50' : ''}`}
                    style={{ 
                        width: dimensions.width, 
                        height: dimensions.height,
                        ...getPaperStyles(),
                        // Hardware acceleration for the paper container
                        transform: 'translateZ(0)',
                    }}
                >
                    {/* Watermark */}
                    {showWatermark && (
                        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.08] select-none overflow-hidden">
                            <div className="transform -rotate-45 whitespace-nowrap text-9xl font-black text-slate-900" style={{ fontSize: '120px' }}>
                                {watermarkText}
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="absolute top-0 w-full" style={{ height: dimensions.top }}>
                        {pageIndex > 0 && hasStudentDetails && (studentDetails?.name || studentDetails?.enrollmentNo) && (
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-1 flex flex-col items-center opacity-85"
                                style={{ fontFamily: getFontFamily(), color: '#1a1a1a', fontSize: '13px', lineHeight: '1.1' }}>
                                {studentDetails.name && <span>{studentDetails.name}</span>}
                                {studentDetails.enrollmentNo && <span>{studentDetails.enrollmentNo}</span>}
                            </div>
                        )}
                        <div className="absolute right-8 top-8 flex flex-col items-end gap-1 opacity-80">
                            <div className="flex items-end gap-2 border-b-2 border-slate-300/50 pb-0.5" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                                <span>Page No:</span>
                                <span style={{ fontFamily: getFontFamily(), color: primaryInkHex, fontSize: '16px', lineHeight: '10px' }}>{pageIndex + 1}</span>
                            </div>
                            <div className="flex items-end gap-2 border-b-2 border-slate-300/50 pb-0.5" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>
                                <span>Date:</span>
                                <span style={{ fontFamily: getFontFamily(), color: primaryInkHex, fontSize: '16px', lineHeight: '10px' }}>{customDate || '   /   /   '}</span>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div 
                        className={`h-full w-full relative z-10`}
                        style={{
                            paddingTop: dimensions.top, paddingBottom: dimensions.bottom,
                            paddingLeft: dimensions.left, paddingRight: dimensions.right,
                            fontFamily: getFontFamily(), fontSize: `${fontSize}px`, lineHeight: `${lineHeight}px`,
                            letterSpacing: '0.02em', transform: `translateY(${verticalOffset}px)`, boxSizing: 'border-box',
                        }}
                    >
                        {pageIndex === 0 && (
                            <>
                                {title && showTitle && (
                                    <div className="text-center w-full flex items-end justify-center" 
                                        style={{ 
                                            color: '#1a1a1a', 
                                            textDecoration: 'underline', 
                                            textDecorationColor: '#1a1a1a', 
                                            height: `${lineHeight * 2}px`, 
                                            // Condition: if no student details, reduce margin to 0 or small value
                                            marginBottom: hasStudentDetails ? `${lineHeight}px` : `${lineHeight * 0.25}px`, 
                                            fontSize: '24px', 
                                            fontWeight: 600, 
                                            lineHeight: `${lineHeight}px` 
                                        }}>
                                        {title}
                                    </div>
                                )}
                                {hasStudentDetails && studentDetails && (
                                    <div className="w-full mb-0" style={{ color: '#1a1a1a', marginBottom: `${lineHeight}px` }}>
                                        {studentDetails.instituteName && (
                                            <div className="text-center font-bold text-xl uppercase flex items-end justify-center" style={{ height: `${lineHeight}px`, marginBottom: `${lineHeight}px`, lineHeight: `${lineHeight}px` }}>{studentDetails.instituteName}</div>
                                        )}
                                        <div className="grid grid-cols-2 gap-x-8 px-4" style={{ fontSize: '16px' }}>
                                            <div className="flex items-end" style={{ height: `${lineHeight}px` }}>{studentDetails.name && `Name: ${studentDetails.name}`}</div>
                                            <div className="flex items-end justify-end" style={{ height: `${lineHeight}px` }}>{studentDetails.enrollmentNo && `Roll No: ${studentDetails.enrollmentNo}`}</div>
                                            <div className="flex items-end" style={{ height: `${lineHeight}px` }}>{studentDetails.branch && `Branch: ${studentDetails.branch}`}</div>
                                            <div className="flex items-end justify-end" style={{ height: `${lineHeight}px` }}>{studentDetails.semester && `Semester: ${studentDetails.semester}`}</div>
                                            <div className="col-span-2 flex items-end justify-center" style={{ height: `${lineHeight}px` }}>{studentDetails.subjectCode && `Subject: ${studentDetails.subjectCode}`}</div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {page.items.map((item, lineIdx) => {
                            const isDragTarget = dragState.isDragging && dragState.targetIndex === item.sourceIndex;

                            if (item.type === 'diagram') {
                                const diagramSrc = diagrams?.[item.content];
                                return (
                                    <React.Fragment key={lineIdx}>
                                        {isDragTarget && <div className="w-full h-1 bg-primary-500 my-1 rounded-full animate-pulse"></div>}
                                        <div data-source-index={item.sourceIndex}>
                                            <DiagramWrapper 
                                                id={item.content}
                                                src={diagramSrc}
                                                heightLines={item.heightLines}
                                                lineHeight={lineHeight}
                                                isSelected={selectedDiagramId === item.content}
                                                onSelect={(e) => { e.stopPropagation(); setSelectedDiagramId(item.content); }}
                                                onDelete={() => handleDiagramAction('delete', item.content)}
                                                onRegenerate={() => onRegenerateDiagram && onRegenerateDiagram(item.content)}
                                                onDuplicate={() => handleDiagramAction('duplicate', item.content, item.heightLines)}
                                                onResize={(h) => handleDiagramAction('resize', item.content, h)}
                                                onMoveStart={() => setDragState({ isDragging: true, sourceIndex: item.sourceIndex, targetIndex: item.sourceIndex })}
                                            />
                                        </div>
                                    </React.Fragment>
                                );
                            } else {
                                return (
                                    <React.Fragment key={lineIdx}>
                                        {isDragTarget && <div className="w-full h-1 bg-primary-500 my-1 rounded-full animate-pulse"></div>}
                                        <div data-source-index={item.sourceIndex} style={{ height: lineHeight, display: 'flex', alignItems: 'flex-end', overflow: 'visible' }}>
                                            <RealisticLine 
                                                line={item.content} lineIndex={lineIdx} primaryColor={primaryInkHex} secondaryColor={'#0f172a'}
                                                penType={penType} inkThickness={inkThickness} fontSize={fontSize} isQuestionMode={item.isQuestionMode}
                                                autoColor={autoColor} qaColorMode={qaColorMode}
                                            />
                                        </div>
                                    </React.Fragment>
                                );
                            }
                        })}
                    </div>
                </div>
            </div>
        );
      })}
    </div>
  );
};

export default HandwritingPaper;