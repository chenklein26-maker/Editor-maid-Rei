import React, { useEffect, useState, useMemo } from 'react';
import { Hexagon, Activity, Terminal, Scan, Crosshair, Sparkles, Sword, BookOpen, Heart, Sun, Cloud, Zap, Fingerprint, Globe, ShieldAlert, Crown, Flower, Sunrise, Leaf, Rocket, Sprout, CircuitBoard, Code, Shield } from 'lucide-react';

interface WelcomeOverlayProps {
  onDismiss: (finalTheme: string) => void;
  forcedTheme?: string;
}

// Full 15 Theme Catalog
type ThemeType = 
  // Original Series (Minimal/Abstract)
  | 'SYSTEM' | 'BATTLE' | 'FANTASY' | 'ROMANCE' | 'SCHOOL'
  // Light Novel Series (Complex/Typography-heavy)
  | 'ISEKAI_GUILD' | 'MAGIC_ACADEMY' | 'URBAN_SLICE' | 'SPIRIT_FOREST' | 'SWORD_LEGEND' | 'NUMEROLOGY_TECH'
  // Wa-fu Series (Japanese Traditional)
  | 'SAKURA_WIND' | 'SHRINE_MAIDEN' | 'AUTUMN_MAPLE' | 'HANABI_FEST';

const AVAILABLE_THEMES: ThemeType[] = [
    'SYSTEM', 'BATTLE', 'FANTASY', 'ROMANCE', 'SCHOOL',
    'ISEKAI_GUILD', 'MAGIC_ACADEMY', 'URBAN_SLICE', 'SPIRIT_FOREST', 'SWORD_LEGEND', 'NUMEROLOGY_TECH',
    'SAKURA_WIND', 'SHRINE_MAIDEN', 'AUTUMN_MAPLE', 'HANABI_FEST'
];

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ onDismiss, forcedTheme }) => {
  const [step, setStep] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  // Initialize theme synchronously
  const [theme, setTheme] = useState<ThemeType>(() => {
    if (forcedTheme && forcedTheme !== 'RANDOM' && AVAILABLE_THEMES.includes(forcedTheme as ThemeType)) {
        return forcedTheme as ThemeType;
    }
    return AVAILABLE_THEMES[Math.floor(Math.random() * AVAILABLE_THEMES.length)];
  });

  // Memoize random decorative elements
  const randomPositions = useMemo(() => Array.from({length: 15}).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      scale: 0.5 + Math.random() * 0.5
  })), []);

  useEffect(() => {
    if (forcedTheme && forcedTheme !== 'RANDOM' && AVAILABLE_THEMES.includes(forcedTheme as ThemeType)) {
        setTheme(forcedTheme as ThemeType);
    }

    const timers = [
      setTimeout(() => setStep(1), 500),   // Background & Base
      setTimeout(() => setStep(2), 1200),  // Main Title
      setTimeout(() => setStep(3), 2000),  // Subtitle & Decorations
      setTimeout(() => setStep(4), 3000),  // Details & CTA
    ];

    return () => timers.forEach(clearTimeout);
  }, [forcedTheme]);

  const handleClick = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(theme), 800);
  };

  /* ==================================================================================
     SECTION 1: ORIGINAL THEMES (RESTORED - MINIMALIST)
     ================================================================================== */

  const renderSystemTheme = () => (
    <>
      <div className="absolute inset-0 bg-[#F0F8FF] z-0"></div>
      {/* Darker Grid for Console Feel */}
      <div className={`absolute inset-0 z-0 opacity-[0.03] transition-opacity duration-1000 ${step >= 1 ? 'opacity-[0.03]' : 'opacity-0'}`} 
           style={{ backgroundImage: 'linear-gradient(#0F172A 1px, transparent 1px), linear-gradient(90deg, #0F172A 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
      </div>
      
      {/* Rings - Darker/Slate now */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vh] h-[80vh] border border-slate-300 rounded-full transition-all duration-[3000ms] ease-out ${step >= 1 ? 'scale-100 opacity-100 rotate-180' : 'scale-50 opacity-0 rotate-0'}`}></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vh] h-[60vh] border border-slate-400 rounded-full border-dashed transition-all duration-[4000ms] ease-out ${step >= 1 ? 'scale-100 opacity-100 -rotate-180' : 'scale-50 opacity-0 rotate-0'}`}></div>
      
      {/* Kanji - Darker Slate */}
      <div className={`absolute right-[5%] top-[10%] text-[20rem] font-black text-slate-900/10 leading-none select-none pointer-events-none transition-all duration-1000 ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`} style={{ writingMode: 'vertical-rl' }}>
        零
      </div>
      <Crosshair className={`absolute top-8 left-1/2 -translate-x-1/2 w-4 h-4 text-slate-500 opacity-50`} />
    </>
  );

  const renderBattleTheme = () => (
    <>
      <div className="absolute inset-0 bg-slate-900 z-0"></div>
      <div className={`absolute inset-0 z-0 transition-all duration-300 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
         <div className="absolute top-0 left-0 w-full h-full bg-red-600 mix-blend-overlay opacity-20 transform -skew-x-12 translate-x-1/2"></div>
         <div className="absolute top-0 right-1/4 w-2 h-full bg-white opacity-10 transform -skew-x-12"></div>
      </div>
      <div className={`absolute left-[5%] bottom-[10%] text-[25rem] font-black text-white/5 leading-none select-none pointer-events-none transition-all duration-200 ease-in ${step >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`} style={{ fontFamily: 'Noto Sans JP' }}>
        斬
      </div>
    </>
  );

  const renderFantasyTheme = () => (
    <>
       <div className="absolute inset-0 bg-[#FDFBF7] z-0"></div>
       <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vh] h-[90vh] border border-amber-300/30 rounded-full flex items-center justify-center transition-all duration-[5000ms] ${step >= 1 ? 'opacity-100 rotate-180' : 'opacity-0 rotate-0'}`}>
          <div className="w-[70%] h-[70%] border border-amber-500/20 rotate-45 border-double border-4"></div>
       </div>
       <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#FDFBF7_90%)] z-0`}></div>
       <div className={`absolute top-20 right-20 text-amber-400 ${step >= 3 ? 'opacity-100 animate-pulse' : 'opacity-0'}`}><Sparkles size={48} strokeWidth={1}/></div>
       <div className={`absolute left-[10%] top-[20%] text-[15rem] font-serif text-amber-900/5 leading-none select-none pointer-events-none transition-all duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`} style={{ writingMode: 'vertical-rl' }}>
        召喚
      </div>
    </>
  );

  const renderRomanceTheme = () => (
    <>
       <div className="absolute inset-0 bg-gradient-to-b from-pink-50 to-blue-50 z-0"></div>
       <div className={`absolute top-[20%] right-[20%] w-64 h-64 bg-pink-300/20 rounded-full blur-3xl transition-all duration-[3000ms] ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}></div>
       <div className={`absolute bottom-[10%] left-[10%] w-96 h-96 bg-blue-300/20 rounded-full blur-3xl transition-all duration-[3000ms] delay-500 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}></div>
       <Heart className={`absolute top-12 left-1/4 text-pink-200 fill-pink-100 ${step >= 3 ? 'opacity-100 animate-bounce' : 'opacity-0'}`} size={24} />
       <div className={`absolute right-[8%] bottom-[20%] text-[12rem] font-serif text-pink-900/5 leading-none select-none pointer-events-none transition-all duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`} style={{ writingMode: 'vertical-rl' }}>
        恋
      </div>
    </>
  );

  const renderSchoolTheme = () => (
    <>
       <div className="absolute inset-0 bg-white z-0" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
       <div className={`absolute left-10 top-0 bottom-0 w-[2px] bg-red-100 z-0 transition-all duration-1000 ${step >= 1 ? 'h-full' : 'h-0'}`}></div>
       <div className={`absolute top-20 right-20 w-0 h-0 border-l-[50px] border-l-transparent border-t-[75px] border-t-sky-100 border-r-[50px] border-r-transparent rotate-12 transition-all duration-1000 ${step >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-150'}`}></div>
       <div className={`absolute right-[5%] top-[15%] text-[18rem] font-sans font-black text-sky-900/5 leading-none select-none pointer-events-none transition-all duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`} style={{ writingMode: 'vertical-rl' }}>
        青春
      </div>
    </>
  );

  /* ==================================================================================
     SECTION 2: LIGHT NOVEL THEMES (NEW - COMPLEX & TIDY)
     ================================================================================== */

  // 6. SPIRIT_FOREST (Nature/Elf) - Replaced GOTHIC_MANOR
  const renderSpiritForest = () => (
    <div className="absolute inset-0 bg-[#F0FDF4] overflow-hidden font-serif z-0">
         <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(to right, #86efac 1px, transparent 1px)', backgroundSize: '100px 100%' }}></div>
         {/* Sunbeams */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-emerald-100/50 to-transparent"></div>
         
         {/* Floating particles (Fireflies/Spores) */}
         {randomPositions.map((pos, i) => (
             <div key={i} className={`absolute bg-emerald-400 rounded-full opacity-60 animate-pulse`}
                  style={{ width: Math.random() > 0.5 ? '4px' : '8px', height: Math.random() > 0.5 ? '4px' : '8px', left: pos.left, top: pos.top, transitionDelay: pos.delay }}>
             </div>
         ))}

         <div className={`absolute right-[15%] top-[20%] text-emerald-900/10 text-[12rem] font-black leading-none select-none pointer-events-none transition-all duration-1000 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ writingMode: 'vertical-rl' }}>
             森の歌
         </div>
         
         <div className={`absolute left-10 bottom-10 w-32 h-32 border-l-2 border-b-2 border-emerald-300 transition-all duration-1000 ${step >= 1 ? 'scale-100' : 'scale-0 origin-bottom-left'}`}></div>
    </div>
  );

  // 7. ISEKAI_GUILD (Fantasy Parchment)
  const renderIsekaiGuild = () => (
    <div className="absolute inset-0 bg-[#F5F1E6] overflow-hidden font-serif z-0">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
        <div className={`absolute inset-6 border-4 border-double border-[#8B4513] transition-all duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="absolute top-0 left-0 w-8 h-8 border-r border-b border-[#8B4513] bg-[#F5F1E6]"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-l border-t border-[#8B4513] bg-[#F5F1E6]"></div>
        </div>
        <div className={`absolute right-[15%] top-[15%] text-[#8B4513] opacity-40 text-4xl font-black tracking-widest border-r-2 border-[#8B4513] pr-6 py-12 transition-all duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`} style={{ writingMode: 'vertical-rl' }}>
            転生したら編集者だった件
        </div>
        <div className={`absolute left-20 top-20 w-32 h-32 border-4 border-red-800 rounded-full flex items-center justify-center text-red-800 font-black text-xl rotate-[-15deg] opacity-50 transition-all duration-500 delay-700 ${step >= 3 ? 'scale-100 opacity-50' : 'scale-150 opacity-0'}`}>
            <div className="border border-red-800 rounded-full w-28 h-28 flex items-center justify-center">
                QUEST <br/> ACCEPTED
            </div>
        </div>
        <div className={`absolute bottom-10 left-0 w-full text-center text-[#8B4513] text-xs font-serif italic tracking-[0.2em] transition-opacity duration-1000 ${step >= 4 ? 'opacity-60' : 'opacity-0'}`}>
             Ex Astris, Scientia. 
        </div>
    </div>
  );

  // 8. MAGIC_ACADEMY (Celestial)
  const renderMagicAcademy = () => (
    <div className="absolute inset-0 bg-[#0F172A] overflow-hidden text-white font-serif z-0">
        <div className={`absolute inset-0 transition-opacity duration-2000 ${step >= 1 ? 'opacity-40' : 'opacity-0'}`}>
             <svg className="absolute w-full h-full">
                <line x1="10%" y1="10%" x2="30%" y2="40%" stroke="rgba(147, 197, 253, 0.3)" strokeWidth="1" />
                <line x1="30%" y1="40%" x2="50%" y2="20%" stroke="rgba(147, 197, 253, 0.3)" strokeWidth="1" />
                <line x1="50%" y1="20%" x2="80%" y2="80%" stroke="rgba(147, 197, 253, 0.3)" strokeWidth="1" />
                <circle cx="10%" cy="10%" r="3" fill="white" />
                <circle cx="30%" cy="40%" r="2" fill="white" />
                <circle cx="50%" cy="20%" r="4" fill="#93C5FD" />
                <circle cx="80%" cy="80%" r="3" fill="white" />
             </svg>
        </div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-blue-400/20 rounded-full flex items-center justify-center transition-all duration-[8000ms] linear ${step >= 1 ? 'rotate-180 opacity-100' : 'rotate-0 opacity-0'}`}>
            <div className="w-[500px] h-[500px] border border-blue-300/30 rounded-full flex items-center justify-center border-dashed">
                <div className="w-[300px] h-[300px] border border-purple-400/40 transform rotate-45"></div>
                <div className="w-[300px] h-[300px] border border-purple-400/40 transform rotate-[22.5deg]"></div>
            </div>
        </div>
        <div className={`absolute left-12 top-1/2 -translate-y-1/2 text-blue-200/50 text-xs tracking-[0.5em] transition-all duration-1000 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`} style={{ writingMode: 'vertical-rl' }}>
            PROJECT: GRIMOIRE // INITIATED
        </div>
    </div>
  );

  // 9. URBAN_SLICE (City Pop / Modern)
  const renderUrbanSlice = () => (
    <div className="absolute inset-0 bg-white overflow-hidden font-sans text-slate-900 z-0">
        <div className={`absolute top-0 right-0 w-[40%] h-full bg-[#22d3ee] transition-transform duration-700 ease-out ${step >= 1 ? 'translate-x-0' : 'translate-x-full'}`}></div>
        <div className={`absolute bottom-0 left-0 w-full h-[35%] bg-[#fb923c] transition-transform duration-700 delay-100 ease-out ${step >= 1 ? 'translate-y-0' : 'translate-y-full'}`}></div>
        <div className={`absolute top-24 left-24 w-16 h-16 rounded-full border-[6px] border-[#22d3ee] transition-all duration-500 delay-300 ${step >= 2 ? 'scale-100' : 'scale-0'}`}></div>
        <div className={`absolute top-40 left-32 w-4 h-4 bg-[#fb923c] rounded-full`}></div>
        <div className="absolute right-0 top-0 w-[40%] h-full opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2.5px)', backgroundSize: '20px 20px' }}></div>
        <div className={`absolute bottom-[35%] right-[5%] text-[12rem] font-black text-white leading-none tracking-tighter transition-all duration-700 delay-300 ${step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            01
        </div>
        <div className={`absolute top-10 left-10 bg-black text-white px-4 py-1 text-sm font-bold tracking-widest transform -rotate-2 transition-all duration-500 delay-500 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            EPISODE: WORKFLOW
        </div>
    </div>
  );

  // NEW: SWORD_LEGEND (Sword & Magic)
  const renderSwordLegend = () => (
    <div className="absolute inset-0 bg-[#F1F5F9] overflow-hidden font-serif z-0">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #94a3b8 0, #94a3b8 1px, transparent 0, transparent 50%)', backgroundSize: '10px 10px' }}></div>
        
        {/* Shield Emblem */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-1000 ${step >= 1 ? 'scale-100 opacity-20' : 'scale-50 opacity-0'}`}>
            <Shield size={600} strokeWidth={1} className="text-slate-900" />
        </div>

        {/* Crossing Swords (CSS) */}
        <div className={`absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-indigo-900/10 to-transparent skew-x-12 transition-all duration-1000 ${step >= 1 ? 'translate-x-0' : 'translate-x-full'}`}></div>
        
        {/* Floating Particles (Embers/Sparks) */}
        {randomPositions.map((pos, i) => (
             <div key={i} className={`absolute bg-amber-500 rounded-full opacity-60 animate-bounce`}
                  style={{ width: '4px', height: '4px', left: pos.left, top: pos.top, transitionDelay: pos.delay, animationDuration: '3s' }}>
             </div>
        ))}

        <div className={`absolute left-10 top-[20%] text-[10rem] font-black text-slate-900/5 leading-none select-none pointer-events-none transition-all duration-1000 ${step >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`} style={{ writingMode: 'vertical-rl' }}>
            英雄譚
        </div>

        <div className={`absolute bottom-20 right-20 flex items-center space-x-4 transition-all duration-1000 delay-500 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
             <div className="w-24 h-px bg-slate-400"></div>
             <div className="text-xs font-bold tracking-[0.5em] text-slate-600 uppercase">Oath & Honor</div>
        </div>
    </div>
  );

  // NEW: NUMEROLOGY_TECH (Index Style / Sci-Magic / Light Mode Academy)
  const renderNumerologyTech = () => (
    <div className="absolute inset-0 bg-white overflow-hidden font-mono z-0">
        {/* Hex Grid Background - Changed to Blue to reduce Green feel */}
        <div className="absolute inset-0 z-0 opacity-20" 
             style={{ 
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill-opacity='0.1' fill='%233b82f6' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                 backgroundSize: '60px 60px'
             }}>
        </div>

        {/* Rotating Magic Circles (Mandala) - Augmented Reality Feel (Blue lines) */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-blue-500/20 border-dashed flex items-center justify-center transition-all duration-[2000ms] ${step >= 1 ? 'opacity-100 scale-100 rotate-180' : 'opacity-0 scale-50 rotate-0'}`}>
             <div className="w-[600px] h-[600px] rounded-full border border-blue-500/20 flex items-center justify-center animate-[spin_60s_linear_infinite]">
                 <div className="w-[400px] h-[400px] border border-blue-500/20 transform rotate-45"></div>
                 <div className="w-[400px] h-[400px] border border-blue-500/20 transform -rotate-45"></div>
             </div>
        </div>

        {/* Floating Sparks (Electromagnetic) - Yellow Zaps */}
        {randomPositions.slice(0, 8).map((pos, i) => (
             <Zap key={i} className={`absolute text-yellow-400 fill-yellow-200 opacity-60 animate-bounce`}
                  style={{ width: '16px', height: '16px', left: pos.left, top: pos.top, transitionDelay: pos.delay, animationDuration: '2s' }} />
        ))}

        {/* Digital Readouts - Darker Text for contrast on light bg */}
        <div className={`absolute left-0 top-0 h-full w-24 border-r border-blue-200 bg-white/60 backdrop-blur-sm flex flex-col justify-between py-10 items-center transition-all duration-1000 ${step >= 1 ? 'translate-x-0' : '-translate-x-full'}`}>
             <CircuitBoard className="text-blue-600 w-6 h-6 mb-4" />
             <div className="flex-1 w-px bg-blue-900/10 relative">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-20 bg-blue-500/50 animate-pulse"></div>
             </div>
             <Code className="text-blue-600 w-6 h-6 mt-4" />
        </div>

        {/* Scanning Line - Blue with Yellow core */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] animate-[scan_4s_linear_infinite]`}></div>

        <div className={`absolute right-10 bottom-32 text-slate-900/5 text-[8rem] font-black leading-none select-none pointer-events-none transition-all duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
            LEVEL 5
        </div>

        <div className={`absolute top-20 right-20 text-right transition-all duration-1000 delay-300 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-blue-600 font-bold text-xs tracking-widest mb-1 flex items-center justify-end">
                <Zap className="w-3 h-3 mr-1 text-yellow-500 fill-yellow-500" /> SYSTEM_OVERRIDE
            </div>
            <div className="text-slate-500 text-[10px] w-32 ml-auto">Injecting magical formula into logical circuits...</div>
        </div>
    </div>
  );

  /* ==================================================================================
     SECTION 3: WA-FU SERIES (JAPANESE TRADITIONAL)
     ================================================================================== */

  // 10. SAKURA_WIND (Taisho Roman)
  const renderSakuraWind = () => (
    <div className="absolute inset-0 bg-[#FFF0F5] overflow-hidden font-serif z-0">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 100%, #FBCFE8 20%, transparent 20%), radial-gradient(circle at 50% 100%, #FBCFE8 20%, transparent 20%)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }}></div>
        <div className={`absolute top-0 left-0 w-full h-full opacity-30 transition-opacity duration-1000 ${step >= 1 ? 'opacity-30' : 'opacity-0'}`}>
            <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 blur-2xl rounded-full mix-blend-multiply"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-yellow-400 blur-3xl rounded-full mix-blend-multiply"></div>
        </div>
        {randomPositions.map((pos, i) => (
             <div key={i} className={`absolute bg-pink-300 rounded-tl-xl rounded-br-xl opacity-60 pointer-events-none transition-all duration-[3000ms]`}
                  style={{ width: '12px', height: '12px', left: pos.left, top: pos.top, transform: `rotate(${Math.random() * 360}deg)`, transitionDelay: pos.delay }}>
             </div>
        ))}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50vh] h-[50vh] bg-red-500 rounded-full mix-blend-multiply opacity-10 transition-all duration-1000 ${step >= 1 ? 'scale-100' : 'scale-0'}`}></div>
        <div className={`absolute right-10 top-0 h-full flex flex-col justify-center text-[#9D174D] font-black text-2xl tracking-[1em] opacity-30 select-none transition-all duration-1000 ${step >= 1 ? 'translate-x-0' : 'translate-x-10 opacity-0'}`} style={{ writingMode: 'vertical-rl' }}>
            大正浪漫・花鳥風月
        </div>
    </div>
  );

  // 11. SHRINE_MAIDEN (Shinto)
  const renderShrineMaiden = () => (
    <div className="absolute inset-0 bg-[#FFFAF0] overflow-hidden font-serif z-0">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 39px, #FF4500 40px)' }}></div>
         <div className={`absolute top-[10%] left-1/2 -translate-x-1/2 w-[80%] h-[80%] transition-all duration-1000 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="absolute top-0 left-0 w-full h-8 bg-[#CC2E1A] rounded-full shadow-lg"></div>
            <div className="absolute top-16 left-[5%] w-[90%] h-6 bg-[#CC2E1A] rounded-full shadow-md"></div>
            <div className="absolute top-0 left-[20%] w-6 h-full bg-[#CC2E1A] shadow-md"></div>
            <div className="absolute top-0 right-[20%] w-6 h-full bg-[#CC2E1A] shadow-md"></div>
            <div className={`absolute top-16 left-1/2 -translate-x-1/2 w-[60%] h-12 flex justify-center space-x-8 items-start pt-2 transition-all duration-1000 delay-500 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-6 h-12 bg-white skew-x-12 border border-slate-200"></div>
                <div className="w-6 h-12 bg-white -skew-x-12 border border-slate-200"></div>
                <div className="w-6 h-12 bg-white skew-x-12 border border-slate-200"></div>
            </div>
         </div>
         {randomPositions.map((pos, i) => (
             <div key={i} className={`absolute bg-yellow-400 rounded-tl-full rounded-br-full opacity-80 pointer-events-none transition-all duration-[4000ms]`}
                  style={{ width: '16px', height: '16px', left: pos.left, top: pos.top, transform: `rotate(${Math.random() * 360}deg)`, transitionDelay: pos.delay }}>
             </div>
         ))}
    </div>
  );

  // 12. AUTUMN_MAPLE (Momiji) - Replaces INK_ZEN
  const renderAutumnMaple = () => (
    <div className="absolute inset-0 bg-gradient-to-b from-[#7c2d12] to-[#431407] overflow-hidden font-serif z-0">
         {/* Textured Background */}
         <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: 'radial-gradient(circle, #f97316 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
         
         {/* Large Background Leaf Outline */}
         <div className={`absolute right-[-10%] bottom-[-10%] text-orange-900/40 transform -rotate-12 transition-all duration-[2000ms] ${step >= 1 ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
             <Leaf size={600} strokeWidth={0.5} />
         </div>

         {/* Falling Leaves */}
         {randomPositions.map((pos, i) => (
             <div key={i} className={`absolute text-orange-500/80 pointer-events-none transition-all duration-[4000ms] ease-in-out`}
                  style={{ left: pos.left, top: pos.top, transform: `rotate(${Math.random() * 360}deg) scale(${pos.scale})`, transitionDelay: pos.delay }}>
                  <Leaf size={24} fill="currentColor" />
             </div>
         ))}
         
         {/* Vertical Text */}
         <div className={`absolute left-10 top-0 h-full flex flex-col justify-center text-orange-100/20 font-serif text-4xl font-black tracking-[0.5em] select-none transition-all duration-1000 ${step >= 1 ? 'translate-x-0' : '-translate-x-10 opacity-0'}`} style={{ writingMode: 'vertical-rl' }}>
            寂寥・物哀・錦秋
         </div>
    </div>
  );

  // 13. HANABI_FEST (Summer Fireworks) - Replaces YOKAI_NIGHT
  const renderHanabiFest = () => (
    <div className="absolute inset-0 bg-[#020617] overflow-hidden font-sans z-0">
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b] to-transparent opacity-60"></div>
        
        {/* Fireworks Bursts (CSS only) */}
        {randomPositions.slice(0, 6).map((pos, i) => (
             <div key={i} className={`absolute rounded-full pointer-events-none transition-all duration-[1000ms] ease-out ${step >= 2 ? 'opacity-0 scale-150' : 'opacity-100 scale-0'}`}
                  style={{ 
                      left: pos.left, 
                      top: pos.top, 
                      width: '10px', 
                      height: '10px',
                      boxShadow: `0 0 0 40px ${['#ef4444', '#3b82f6', '#eab308', '#ec4899'][i % 4]}`,
                      transitionDelay: `${parseFloat(pos.delay) + 1}s`
                  }}>
             </div>
        ))}
        {/* Secondary Sparkles */}
        {randomPositions.slice(6).map((pos, i) => (
             <Sparkles key={i} className={`absolute text-white/50 animate-pulse`} 
                style={{ left: pos.left, top: pos.top, transform: `scale(${pos.scale})`, transitionDelay: pos.delay }} 
             />
        ))}

        {/* Silhouette Crowd/Landscape */}
        <div className={`absolute bottom-0 left-0 w-full h-32 bg-black/40 blur-xl transition-transform duration-1000 ${step >= 1 ? 'translate-y-0' : 'translate-y-full'}`}></div>
        
        {/* Large Text */}
        <div className={`absolute left-1/2 top-[20%] -translate-x-1/2 text-white opacity-10 text-[8rem] font-black tracking-widest pointer-events-none select-none transition-all duration-1000 ${step >= 2 ? 'scale-100 blur-sm' : 'scale-125 blur-xl'}`}>
            花火
        </div>

        <div className={`absolute right-10 bottom-32 text-pink-300 font-serif writing-vertical-rl text-xl tracking-[1em] opacity-60 transition-all duration-1000 delay-500 ${step >= 3 ? 'opacity-60' : 'opacity-0'}`} style={{ writingMode: 'vertical-rl' }}>
            刹那の輝き
        </div>
    </div>
  );


  // --- Dynamic Styles based on Theme ---
  const getThemeConfig = () => {
      switch(theme) {
          // Classic
          case 'SYSTEM': return { text: 'text-slate-900', accent: 'text-slate-500', font: 'font-sans font-black tracking-[0.1em]', bar: 'bg-slate-300', barFill: 'bg-slate-800' };
          case 'BATTLE': return { text: 'text-white', accent: 'text-red-600', font: 'font-black tracking-tighter italic', bar: 'bg-red-800', barFill: 'bg-white' };
          case 'FANTASY': return { text: 'text-amber-900', accent: 'text-amber-600', font: 'font-serif tracking-widest', bar: 'bg-amber-200', barFill: 'bg-amber-600' };
          case 'ROMANCE': return { text: 'text-slate-700', accent: 'text-pink-500', font: 'font-serif italic tracking-wide', bar: 'bg-slate-200', barFill: 'bg-pink-300' };
          case 'SCHOOL': return { text: 'text-slate-800', accent: 'text-sky-500', font: 'font-sans tracking-tight', bar: 'bg-slate-200', barFill: 'bg-sky-400' };
          
          // Light Novel
          case 'SPIRIT_FOREST': return { text: 'text-emerald-900', accent: 'text-emerald-600', font: 'font-serif font-bold tracking-widest', bar: 'bg-emerald-200', barFill: 'bg-emerald-600' };
          case 'ISEKAI_GUILD': return { text: 'text-[#5D4037]', accent: 'text-[#DAA520]', font: 'font-serif font-black tracking-normal', bar: 'bg-[#8B4513]', barFill: 'bg-[#DAA520]' };
          case 'MAGIC_ACADEMY': return { text: 'text-blue-100', accent: 'text-blue-400', font: 'font-serif tracking-widest', bar: 'bg-blue-900', barFill: 'bg-blue-400' };
          case 'URBAN_SLICE': return { text: 'text-slate-900', accent: 'text-white bg-[#fb923c] px-2', font: 'font-sans font-black tracking-tight', bar: 'bg-slate-900', barFill: 'bg-[#22d3ee]' };
          case 'SWORD_LEGEND': return { text: 'text-slate-800', accent: 'text-indigo-600', font: 'font-serif font-black tracking-widest', bar: 'bg-slate-300', barFill: 'bg-indigo-600' };
          case 'NUMEROLOGY_TECH': return { text: 'text-cyan-900', accent: 'text-cyan-600', font: 'font-mono font-bold tracking-tight', bar: 'bg-cyan-100', barFill: 'bg-cyan-600' };
          
          // Wa-fu (Japanese)
          case 'SAKURA_WIND': return { text: 'text-[#831843]', accent: 'text-[#F472B6]', font: 'font-serif font-black tracking-widest', bar: 'bg-[#FBCFE8]', barFill: 'bg-[#831843]' };
          case 'SHRINE_MAIDEN': return { text: 'text-[#CC2E1A]', accent: 'text-[#F59E0B]', font: 'font-serif tracking-wide', bar: 'bg-[#CC2E1A]', barFill: 'bg-white' };
          case 'AUTUMN_MAPLE': return { text: 'text-[#fff7ed]', accent: 'text-orange-500', font: 'font-serif font-bold tracking-[0.2em]', bar: 'bg-orange-900', barFill: 'bg-orange-500' };
          case 'HANABI_FEST': return { text: 'text-blue-100', accent: 'text-pink-400', font: 'font-black tracking-widest', bar: 'bg-[#1e1b4b]', barFill: 'bg-pink-500' };
          
          default: return { text: 'text-slate-900', accent: 'text-sky-500', font: 'font-sans font-black tracking-[0.05em]', bar: 'bg-slate-200', barFill: 'bg-sky-400' };
      }
  };

  const tc = getThemeConfig();

  return (
    <div 
      onClick={handleClick}
      className={`fixed inset-0 z-[100] cursor-pointer flex items-center justify-center overflow-hidden transition-all duration-1000 ${isExiting ? 'opacity-0 scale-110 filter blur-xl' : 'opacity-100'}`}
    >
      {/* Background Layers Render */}
      {theme === 'SYSTEM' && renderSystemTheme()}
      {theme === 'BATTLE' && renderBattleTheme()}
      {theme === 'FANTASY' && renderFantasyTheme()}
      {theme === 'ROMANCE' && renderRomanceTheme()}
      {theme === 'SCHOOL' && renderSchoolTheme()}
      
      {theme === 'ISEKAI_GUILD' && renderIsekaiGuild()}
      {theme === 'MAGIC_ACADEMY' && renderMagicAcademy()}
      {theme === 'URBAN_SLICE' && renderUrbanSlice()}
      {theme === 'SPIRIT_FOREST' && renderSpiritForest()}
      {theme === 'SWORD_LEGEND' && renderSwordLegend()}
      {theme === 'NUMEROLOGY_TECH' && renderNumerologyTech()}
      
      {theme === 'SAKURA_WIND' && renderSakuraWind()}
      {theme === 'SHRINE_MAIDEN' && renderShrineMaiden()}
      {theme === 'AUTUMN_MAPLE' && renderAutumnMaple()}
      {theme === 'HANABI_FEST' && renderHanabiFest()}

      {/* ================= TYPOGRAPHY CORE (Shared) ================= */}
      
      <div className="relative z-20 flex flex-row-reverse items-center justify-center h-[70vh] gap-12 md:gap-24 select-none">
        
        {/* Vertical Line Anchor */}
        <div className={`w-[2px] h-full relative overflow-hidden transition-all duration-1000 ${step >= 1 ? 'opacity-100 h-[60vh]' : 'opacity-0 h-0'} ${tc.bar}`}>
            <div className={`absolute top-0 left-0 w-full h-1/3 transition-all duration-[2000ms] delay-500 ${step >= 2 ? 'translate-y-[200%]' : '-translate-y-full'} ${tc.barFill}`}></div>
        </div>

        {/* MAIN TITLE */}
        <div 
           className={`flex flex-col items-center transition-all duration-1000 transform ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
           style={{ writingMode: 'vertical-rl' }}
        >
             <div className="flex items-center gap-4 mb-8 opacity-50">
                <span className={`text-[10px] font-mono tracking-widest uppercase rotate-180 ${tc.text}`}>
                    {theme.replace('_', ' ')}
                </span>
                <span className={`h-px w-8 ${tc.bar}`}></span>
             </div>
             
             <h1 className={`text-8xl md:text-9xl leading-none flex flex-col gap-4 ${tc.font} ${tc.text} drop-shadow-xl`}>
                <span>おか</span>
                <span className={tc.accent}>えり</span>
                <span>なさい</span>
                <span className={`text-transparent bg-clip-text bg-gradient-to-b from-current to-transparent opacity-70`}>ませ</span>
             </h1>
        </div>

        {/* SUBTITLE */}
        <div 
           className={`flex flex-col items-center transition-all duration-1000 delay-300 transform ${step >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
           style={{ writingMode: 'vertical-rl' }}
        >
             <div className={`border-l pl-4 py-2 mb-4 ${theme === 'BATTLE' || theme === 'SPIRIT_FOREST' || theme === 'SHRINE_MAIDEN' ? 'border-red-600' : 'border-slate-300'}`} style={{borderColor: theme === 'SPIRIT_FOREST' ? '#10b981' : undefined}}>
                <h2 className={`text-5xl md:text-6xl ${tc.text} ${theme.includes('FANTASY') || theme.includes('MAGIC') || theme.includes('GUILD') || theme === 'SPIRIT_FOREST' || theme === 'SAKURA_WIND' || theme === 'SHRINE_MAIDEN' || theme === 'AUTUMN_MAPLE' || theme === 'HANABI_FEST' || theme === 'SWORD_LEGEND' ? 'font-serif' : 'font-thin'} tracking-[0.3em] drop-shadow-md`}>
                    ご主人様
                </h2>
             </div>
             <p className={`text-xs font-mono ${tc.text} opacity-60 tracking-[0.5em] mt-6 uppercase`}>
                Welcome back, Master
             </p>
        </div>

        {/* DECORATIVE: SIDEBAR INFO */}
        <div className={`hidden lg:flex flex-col justify-between h-[50vh] transition-all duration-1000 delay-500 ${step >= 3 ? 'opacity-100' : 'opacity-0'}`}>
             <div className="flex flex-col items-center gap-2">
                 {(theme === 'SYSTEM') && <Scan className="w-6 h-6 text-slate-500 stroke-1" />}
                 {(theme === 'BATTLE') && <Sword className="w-6 h-6 text-red-500 stroke-1" />}
                 {(theme === 'FANTASY') && <BookOpen className="w-6 h-6 text-amber-500 stroke-1" />}
                 {theme === 'ROMANCE' && <Heart className="w-6 h-6 text-pink-400 stroke-1" />}
                 {theme === 'SCHOOL' && <Sun className="w-6 h-6 text-sky-400 stroke-1" />}
                 
                 {/* LN Icons */}
                 {theme === 'SPIRIT_FOREST' && <Sprout className="w-6 h-6 text-emerald-600 stroke-1" />}
                 {theme === 'ISEKAI_GUILD' && <Fingerprint className="w-6 h-6 text-amber-800 stroke-1" />}
                 {theme === 'MAGIC_ACADEMY' && <Globe className="w-6 h-6 text-blue-300 stroke-1" />}
                 {theme === 'URBAN_SLICE' && <Zap className="w-6 h-6 text-slate-800 stroke-1" />}
                 {theme === 'SWORD_LEGEND' && <Shield className="w-6 h-6 text-indigo-600 stroke-1" />}
                 {theme === 'NUMEROLOGY_TECH' && <CircuitBoard className="w-6 h-6 text-cyan-500 stroke-1" />}
                 
                 {/* Wa-fu Icons */}
                 {theme === 'SAKURA_WIND' && <Flower className="w-6 h-6 text-pink-400 stroke-1" />}
                 {theme === 'SHRINE_MAIDEN' && <Sunrise className="w-6 h-6 text-red-600 stroke-1" />}
                 {theme === 'AUTUMN_MAPLE' && <Leaf className="w-6 h-6 text-orange-500 stroke-1" />}
                 {theme === 'HANABI_FEST' && <Rocket className="w-6 h-6 text-purple-400 stroke-1" />}

                 <div className={`w-px h-24 bg-gradient-to-b from-current to-transparent ${tc.text} opacity-30`}></div>
             </div>
             
             <div className={`font-mono text-[10px] ${tc.text} opacity-50 tracking-widest uppercase rotate-180`} style={{ writingMode: 'vertical-rl' }}>
                 MAID REI // THEME: {theme}
             </div>

             <div className={`flex gap-0.5 h-16 items-end opacity-40`}>
                 {[...Array(12)].map((_, i) => (
                     <div key={i} className={`w-${i % 2 === 0 ? '1' : '0.5'} h-${Math.floor(Math.random() * 100)}% ${tc.bar}`}></div>
                 ))}
             </div>
        </div>

      </div>

      {/* Bottom Center: Call to Action (Shared) */}
      <div className={`absolute bottom-12 left-1/2 -translate-x-1/2 transition-all duration-1000 ${step >= 4 ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
         <button className="group relative px-8 py-3 bg-transparent overflow-hidden">
             <span className={`absolute top-0 left-0 w-full h-[1px] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ${tc.barFill}`}></span>
             <span className={`absolute bottom-0 right-0 w-full h-[1px] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ${tc.barFill}`}></span>
             
             <div className="flex flex-col items-center">
                 <span className={`text-xs font-black tracking-[0.5em] group-hover:opacity-100 transition-colors ${tc.text} drop-shadow-md`}>
                    SYSTEM START
                 </span>
                 <span className={`text-[9px] font-mono tracking-widest mt-1 opacity-50 group-hover:opacity-100 transition-opacity ${tc.text}`}>
                    Click anywhere to enter
                 </span>
             </div>
         </button>
      </div>
      
    </div>
  );
};