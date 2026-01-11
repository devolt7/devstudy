import React, { useState, useRef } from 'react';

type MascotState = 'idle' | 'happy' | 'thinking' | 'writing' | 'idea' | 'love' | 'blush';

interface MascotProps {
  state?: MascotState;
  size?: number;
  className?: string;
}

const Mascot: React.FC<MascotProps> = ({ state: propState = 'idle', size = 64, className = '' }) => {
  const [tempState, setTempState] = useState<MascotState | null>(null);
  const clickTimeoutRef = useRef<number | null>(null);
  const lastSingleTapAction = useRef<'blush' | 'love'>('love'); // Start assuming love so first tap is blush

  // Use temporary interaction state if active, otherwise fall back to prop state
  const currentState = tempState || propState;

  const handleInteraction = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (clickTimeoutRef.current) {
          // Double Click -> Force Flying Kiss
          clearTimeout(clickTimeoutRef.current);
          clickTimeoutRef.current = null;
          triggerState('love');
      } else {
          // Wait to see if it's a double click
          clickTimeoutRef.current = window.setTimeout(() => {
              clickTimeoutRef.current = null;
              // Single Click -> Alternate between Blush and Kiss
              const nextAction = lastSingleTapAction.current === 'blush' ? 'love' : 'blush';
              triggerState(nextAction);
              lastSingleTapAction.current = nextAction;
          }, 250); 
      }
  };

  const triggerState = (s: MascotState) => {
      setTempState(s);
      // Duration based on animation length
      const duration = s === 'love' ? 2000 : 2500; 
      setTimeout(() => setTempState(null), duration);
  };

  return (
    <div 
        onClick={handleInteraction}
        className={`relative inline-flex items-center justify-center cursor-pointer select-none ${className}`} 
        style={{ width: size, height: size }}
    >
       <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl overflow-visible" fill="none" xmlns="http://www.w3.org/2000/svg">
         <defs>
            {/* Gradients */}
            <linearGradient id="headGradient" x1="100" y1="20" x2="100" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>
            <linearGradient id="bodyGradient" x1="100" y1="100" x2="100" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#4338CA" />
            </linearGradient>
            <linearGradient id="screenGradient" x1="100" y1="45" x2="100" y2="85" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
               <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
               <feMerge>
                   <feMergeNode in="coloredBlur"/>
                   <feMergeNode in="SourceGraphic"/>
               </feMerge>
            </filter>
            
            {/* --- ANIMATIONS --- */}
            <style>
                {`
                    /* Floating Idle */
                    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
                    .mascot-float { animation: float 4s ease-in-out infinite; }

                    /* BLUSH ANIMATIONS */
                    @keyframes blushHead {
                        0% { transform: translateY(0); }
                        20% { transform: translateY(5px) rotate(-3deg); }
                        40% { transform: translateY(5px) rotate(3deg); }
                        60% { transform: translateY(5px) rotate(-2deg); }
                        100% { transform: translateY(0); }
                    }
                    @keyframes cheekPulse {
                        0%, 100% { opacity: 0; transform: scale(0.5); }
                        20%, 80% { opacity: 0.8; transform: scale(1.1); }
                    }

                    /* KISS ANIMATIONS - Completely Redesigned to fix detachment */
                    
                    /* Arm Rotation Only - Pivot at shoulder (140, 130) */
                    @keyframes kissArmAction {
                        0% { transform: rotate(0deg); }
                        20% { transform: rotate(-135deg); } /* Hand moves up near mouth */
                        40% { transform: rotate(-135deg); } /* Hold */
                        60% { transform: rotate(-20deg); } /* Throw Kiss Forward */
                        80% { transform: rotate(0deg); } /* Return */
                        100% { transform: rotate(0deg); }
                    }

                    /* Head leans forward slightly for the kiss */
                    @keyframes kissHeadAction {
                        0% { transform: translateY(0) rotate(0); }
                        20% { transform: translateY(2px) rotate(5deg); } /* Lean into hand */
                        40% { transform: translateY(2px) rotate(5deg); }
                        60% { transform: translateY(-2px) rotate(-3deg); } /* Throw back */
                        100% { transform: translateY(0) rotate(0); }
                    }

                    /* Heart pops out when hand extends */
                    @keyframes heartPop {
                        0% { opacity: 0; transform: scale(0) translate(100px, 80px); }
                        50% { opacity: 0; transform: scale(0.1) translate(100px, 80px); } /* Wait for hand */
                        60% { opacity: 1; transform: scale(1) translate(130px, 60px); } /* Pop */
                        100% { opacity: 0; transform: scale(1.5) translate(160px, 20px) rotate(15deg); } /* Float away */
                    }

                    .head-blush-anim { animation: blushHead 2.5s ease-in-out forwards; transform-origin: 100px 100px; }
                    .cheek-anim { animation: cheekPulse 2.5s ease-in-out forwards; transform-box: fill-box; transform-origin: center; }

                    /* Important: transform-box: fill-box allows rotation around the element's coordinate system if set correctly, 
                       but here we use specific pixel origin for the shoulder joint */
                    .arm-kiss-anim { animation: kissArmAction 2s ease-in-out forwards; transform-box: view-box; transform-origin: 140px 130px; }
                    
                    .head-kiss-anim { animation: kissHeadAction 2s ease-in-out forwards; transform-origin: 100px 100px; }
                    .heart-pop-anim { animation: heartPop 2s ease-out forwards; transform-origin: center; }
                `}
            </style>
         </defs>

         {/* Shadow */}
         <ellipse cx="100" cy="185" rx="50" ry="6" fill="black" fillOpacity="0.15" className="animate-pulse" />

         {/* --- MAIN ROBOT GROUP --- */}
         <g className="mascot-float">
             
             {/* Left Arm (Behind) */}
             <path d="M60 130 C 40 130 30 150 40 160" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" />
             <circle cx="40" cy="160" r="12" fill="#6366F1" />

             {/* Right Arm (Animated) */}
             <g className={currentState === 'love' ? 'arm-kiss-anim' : ''}>
                 <path d="M140 130 C 160 130 170 150 160 160" stroke="#CBD5E1" strokeWidth="12" strokeLinecap="round" />
                 <circle cx="160" cy="160" r="12" fill="#6366F1" />
             </g>

             {/* Body */}
             <rect x="60" y="110" width="80" height="60" rx="20" fill="url(#bodyGradient)" />
             <circle cx="100" cy="140" r="16" fill="white" fillOpacity="0.15" />
             <path d="M92 140 L98 146 L108 134" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>

             {/* Head Group (Animated) */}
             <g className={currentState === 'love' ? 'head-kiss-anim' : (currentState === 'blush' ? 'head-blush-anim' : '')}>
                {/* Antennas */}
                <g>
                    <line x1="100" y1="30" x2="100" y2="10" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="100" cy="10" r="6" fill={currentState === 'love' ? '#EC4899' : '#38BDF8'} filter="url(#glow)" />
                </g>

                {/* Face Plate */}
                <rect x="40" y="30" width="120" height="90" rx="24" fill="url(#headGradient)" stroke="white" strokeWidth="2" />
                <rect x="52" y="45" width="96" height="50" rx="14" fill="url(#screenGradient)" />
                
                {/* --- EXPRESSIONS --- */}
                
                {/* 1. BLUSH STATE */}
                {currentState === 'blush' && (
                    <g>
                        {/* Eyes > < */}
                        <path d="M65 65 L75 75 L65 85" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
                        <path d="M135 65 L125 75 L135 85" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />
                        {/* Cheeks */}
                        <circle cx="60" cy="82" r="10" fill="#F472B6" className="cheek-anim" opacity="0" filter="url(#glow)" />
                        <circle cx="140" cy="82" r="10" fill="#F472B6" className="cheek-anim" opacity="0" filter="url(#glow)" />
                        {/* Mouth */}
                        <path d="M95 85 Q100 88 105 85" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
                    </g>
                )}

                {/* 2. LOVE STATE (Heart Eyes - Fixed Positions) */}
                {currentState === 'love' && (
                    <g>
                        {/* Left Heart Eye */}
                        <path 
                            d="M66 68 C 66 63 60 63 60 68 C 60 74 72 78 72 78 C 72 78 84 74 84 68 C 84 63 78 63 78 68 C 78 71 72 74 72 74 C 72 74 66 71 66 68 Z" 
                            fill="#F472B6" 
                            filter="url(#glow)" 
                        />
                        {/* Right Heart Eye */}
                        <path 
                            d="M118 68 C 118 63 112 63 112 68 C 112 74 124 78 124 78 C 124 78 136 74 136 68 C 136 63 130 63 130 68 C 130 71 124 74 124 74 C 124 74 118 71 118 68 Z" 
                            fill="#F472B6" 
                            filter="url(#glow)" 
                        />
                        {/* Kiss Mouth */}
                        <circle cx="100" cy="82" r="3" stroke="#38BDF8" strokeWidth="3" fill="none" />
                    </g>
                )}

                {/* 3. STANDARD STATES */}
                {(currentState === 'idle' || currentState === 'happy' || currentState === 'thinking') && (
                    <g>
                        {/* Eyes */}
                        {currentState === 'thinking' ? (
                            <>
                                <circle cx="76" cy="65" r="8" fill="#38BDF8" filter="url(#glow)" />
                                <circle cx="124" cy="65" r="5" fill="#38BDF8" filter="url(#glow)" />
                            </>
                        ) : (
                            <>
                                <path d="M68 65 Q76 55 84 65" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" filter="url(#glow)" />
                                <path d="M116 65 Q124 55 132 65" stroke="#38BDF8" strokeWidth="4" strokeLinecap="round" filter="url(#glow)" />
                            </>
                        )}
                        {/* Mouth */}
                        <path d="M85 80 Q100 88 115 80" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
                        {/* Subtle Blush */}
                        <circle cx="65" cy="75" r="4" fill="#F472B6" opacity="0.4" />
                        <circle cx="135" cy="75" r="4" fill="#F472B6" opacity="0.4" />
                    </g>
                )}
             </g>
         </g>

         {/* --- PARTICLES (Hearts) --- */}
         {currentState === 'love' && (
             <g className="heart-pop-anim">
                 <path d="M0 0 C 0 -10 -10 -10 -10 0 C -10 7 0 15 0 15 C 0 15 10 7 10 0 C 10 -10 0 -10 0 0 Z" fill="#EC4899" />
             </g>
         )}
       </svg>
    </div>
  );
};

export default Mascot;