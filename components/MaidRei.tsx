import React, { useEffect, useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface MaidReiProps {
  message: string;
  isProcessing: boolean;
}

export const MaidRei: React.FC<MaidReiProps> = ({ message, isProcessing }) => {
  const { t } = useLanguage();
  const [face, setFace] = useState('( ˙ ꒳ ˙ )');

  // --- Animation Logic ---
  useEffect(() => {
    // If processing, loop through "Focused/Quietly Working" faces
    if (isProcessing) {
        const busyFaces = [
            '( ˘ • ˘ )',   // Focused
            '( •̀ ⁻ •́ )',   // Serious mode
            '( › ‹ )',     // Little effort
            '( ˘ ⁻ ˘ )',   // Thinking
            '( ◕ ⁻ ◕ )'    // Processing
        ];
        let idx = 0;
        const interval = setInterval(() => {
            setFace(busyFaces[idx % busyFaces.length]);
            idx++;
        }, 1200); // Slower updates for a calmer feel
        return () => clearInterval(interval);
    } else {
        // Reset to default "Moe Blank Stare" immediately
        setFace('( ˙ ꒳ ˙ )');

        // Setup blinking loop (Soft blink)
        const blinkLoop = () => {
            setFace('( ⁻ ꒳ ⁻ )'); // Blink with same mouth
            setTimeout(() => {
                // Return to a random quiet/moe face
                const quietFaces = [
                    '( ˙ ꒳ ˙ )',   // Standard cute (The "Moe" baseline)
                    '( ˊ ᵕ ˋ )',   // Soft smile
                    '( . ⁻ . )',   // Just looking
                    '( o ˘ ◡ ˘ o )', // Peaceful/Content
                    '( º _ º )',   // Spaced out
                    '( ˙ ⁻ ˙ )'    // Neutral cute
                ];
                setFace(quietFaces[Math.floor(Math.random() * quietFaces.length)]);
            }, 180);

            // Schedule next blink - Random but generally slow
            const nextBlink = Math.random() * 4000 + 3000;
            timeoutId = setTimeout(blinkLoop, nextBlink);
        };

        let timeoutId = setTimeout(blinkLoop, 3000);
        return () => clearTimeout(timeoutId);
    }
  }, [isProcessing]);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end pointer-events-none font-sans">
      
      {/* Dialogue Bubble */}
      <div className={`mr-4 mb-3 relative bg-white/95 backdrop-blur-sm shadow-sm border border-slate-200 px-4 py-3 rounded-2xl rounded-br-none max-w-[220px] pointer-events-auto transition-all duration-300 origin-bottom-right transform ${message ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-4'}`}>
        <p className="text-xs font-bold text-slate-700 leading-relaxed">
           {isProcessing ? (
             <span className="flex items-center text-blue-500">
               <span className="animate-spin mr-2 opacity-60">✦</span> {t('maidRei.processing')}
             </span>
           ) : (
             message
           )}
        </p>
      </div>
      
      {/* Kaomoji Container */}
      <div className={`pointer-events-auto cursor-pointer select-none transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 flex items-center justify-center px-6 py-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-2 ${isProcessing ? 'border-amber-100 animate-pulse' : 'border-white'}`}>
        <div className="relative">
            {/* The Face */}
            <span className={`text-lg font-black text-slate-600 whitespace-nowrap tracking-widest transition-all duration-200 inline-block`} style={{ textShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                {face}
            </span>
            
            {/* Cute Cheeks (Blush) - Very Subtle Dots */}
            {!isProcessing && (
                <>
                    <span className="absolute -left-1 top-[60%] -translate-y-1/2 text-rose-200 opacity-60 text-[10px] font-bold select-none">･</span>
                    <span className="absolute -right-1 top-[60%] -translate-y-1/2 text-rose-200 opacity-60 text-[10px] font-bold select-none">･</span>
                </>
            )}

            {/* Status Indicator (Dot) - Made smaller and pastel */}
            <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border border-white shadow-sm transition-colors duration-500 ${isProcessing ? 'bg-amber-300' : 'bg-emerald-300'}`}></div>
        </div>
      </div>
    </div>
  );
};