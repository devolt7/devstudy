import React, { useRef, useEffect, useState } from 'react';

interface PaperContainerProps {
  children: React.ReactNode;
  paperWidth?: number; // Default A4 width 794px
}

const PaperContainer: React.FC<PaperContainerProps> = ({ children, paperWidth = 794 }) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (outerRef.current) {
        const screenWidth = window.innerWidth;
        // Use the outerRef width but cap it at screen width to prevent overflow expansion loops
        const containerWidth = outerRef.current.offsetWidth;
        const availableWidth = Math.min(screenWidth, containerWidth);
        
        // Dynamic buffer: Smaller on mobile to maximize paper visibility
        const isMobile = screenWidth < 768;
        const buffer = isMobile ? 16 : 48; 
        
        let targetScale = (availableWidth - buffer) / paperWidth;
        
        // Clamp scale: Max 1.0 (no upscaling), Min 0.1 (sanity check)
        targetScale = Math.min(1.0, Math.max(0.1, targetScale));
        
        setScale(targetScale);
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (outerRef.current) observer.observe(outerRef.current);
    
    window.addEventListener('resize', handleResize);
    
    // Safety check for layout stabilization
    const timeout = setTimeout(handleResize, 200);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [paperWidth]);

  return (
    <div 
        ref={outerRef} 
        className="w-full max-w-[100vw] flex flex-col items-center relative overflow-hidden print:block print:w-auto print:m-0 print:p-0 print:overflow-visible"
    >
      <div 
        className="origin-top transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] print-transform-none print:!m-0 will-change-transform"
        style={{ 
          width: paperWidth,
          transform: `scale(${scale})`,
          // Compensate for the empty space below the scaled element (scale affects visual size but not layout flow)
          marginBottom: `calc((1 - ${scale}) * -100%)` 
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PaperContainer;