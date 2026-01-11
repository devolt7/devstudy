import React, { useState, useRef, useEffect } from 'react';
import { X, Move, Maximize2 } from 'lucide-react';

interface DraggableImageProps {
  id: string;
  src: string;
  initialX: number;
  initialY: number;
  onRemove: (id: string) => void;
  isPrintMode?: boolean;
}

const DraggableImage: React.FC<DraggableImageProps> = ({ id, src, initialX, initialY, onRemove, isPrintMode }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ w: 300, h: 300 }); // Default size
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      } else if (isResizing) {
        if (imgRef.current) {
          const rect = imgRef.current.getBoundingClientRect();
          setSize({
            w: Math.max(100, e.clientX - rect.left),
            h: Math.max(100, e.clientY - rect.top)
          });
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if not clicking the delete button or resize handle
    if ((e.target as HTMLElement).closest('.controls')) return;
    
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  return (
    <div
      ref={imgRef}
      className={`absolute z-10 group ${isPrintMode ? '' : 'cursor-move hover:ring-2 hover:ring-indigo-400 rounded-lg'}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.w,
        height: size.h,
        // Multiply blend mode makes white background transparent, perfect for "pencil sketch" on paper
        mixBlendMode: 'multiply' 
      }}
      onMouseDown={!isPrintMode ? handleMouseDown : undefined}
    >
      <img 
        src={src} 
        alt="Diagram" 
        className="w-full h-full object-contain pointer-events-none select-none"
      />
      
      {/* Controls - Hidden during print */}
      {!isPrintMode && (
        <div className="controls opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Delete Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(id); }}
            className="absolute -top-3 -right-3 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600"
            title="Remove Diagram"
          >
            <X size={14} />
          </button>

          {/* Resize Handle */}
          <div
            onMouseDown={handleResizeStart}
            className="absolute -bottom-2 -right-2 bg-indigo-500 text-white p-1 rounded-full shadow-md cursor-se-resize hover:bg-indigo-600"
            title="Resize"
          >
             <Maximize2 size={14} />
          </div>
          
          {/* Move Hint */}
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1 pointer-events-none">
             <Move size={10} /> Drag
          </div>
        </div>
      )}
    </div>
  );
};

export default DraggableImage;
