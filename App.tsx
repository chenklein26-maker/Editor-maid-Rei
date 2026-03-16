import React, { useState, useEffect } from 'react';
import { AppState, DEFAULT_ENDINGS, DEFAULT_IMAGES, DEFAULT_TITLES, DEFAULT_TEMPLATES, DEFAULT_PROMPTS, UIThemeStyle } from './types';
import { MaidRei } from './components/MaidRei';
import { AssetLibrary } from './components/modules/AssetLibrary';
import { WorkflowBoard } from './components/modules/WorkflowBoard';
import { StrategyRoom } from './components/modules/StrategyRoom';
import { WelcomeOverlay } from './components/WelcomeOverlay';
import { GitBranch, Database, Target, Hexagon, RefreshCw, Settings } from 'lucide-react';
import { Settings as SettingsModule } from './components/modules/Settings';
import { LanguageProvider, useLanguage } from './i18n/LanguageContext';

// Increment this key to force all users to reload default seed data (e.g. when defaults update)
const STORAGE_KEY = 'maid_rei_system_data_v7';

// Theme Configuration Map
const THEME_STYLES: Record<string, UIThemeStyle> = {
  // Default - SYSTEM (Tech/Console Style)
  'SYSTEM': {
    id: 'SYSTEM',
    appBg: 'bg-[#F0F8FF]',
    headerBg: 'bg-white/90 border-slate-200',
    panelBg: 'bg-white',
    panelBorder: 'border-slate-200',
    textMain: 'text-slate-900',
    textMuted: 'text-slate-500',
    accentBg: 'bg-[#1E293B]',
    accentText: 'text-white',
    inputBg: 'bg-[#F8FAFC]',
    font: 'font-sans'
  },

  // BATTLE: Improved contrast for text on dark bg
  'BATTLE': {
    id: 'BATTLE', appBg: 'bg-slate-950', headerBg: 'bg-slate-900/90 border-red-900/30',
    panelBg: 'bg-slate-900/80', panelBorder: 'border-red-900/40',
    textMain: 'text-slate-100', // Brighter white
    textMuted: 'text-slate-400', // Standard grey instead of dark red
    accentBg: 'bg-red-700', accentText: 'text-white', inputBg: 'bg-slate-950',
    font: 'font-sans'
  },
  // FANTASY: Darker brown text for readability
  'FANTASY': {
    id: 'FANTASY', appBg: 'bg-[#FDFBF7]', headerBg: 'bg-[#F5F1E6]/90 border-amber-200',
    panelBg: 'bg-[#FFFDF5]', panelBorder: 'border-amber-200',
    textMain: 'text-slate-800', // Was amber-900 (too brown)
    textMuted: 'text-amber-800/70', // Darker amber
    accentBg: 'bg-amber-600', accentText: 'text-white', inputBg: 'bg-[#FDFBF7]',
    font: 'font-serif'
  },
  // ROMANCE: Replaced unreadable pink text with slate
  'ROMANCE': {
    id: 'ROMANCE', appBg: 'bg-pink-50', headerBg: 'bg-white/60 border-pink-100',
    panelBg: 'bg-white/90', panelBorder: 'border-pink-200',
    textMain: 'text-slate-800', // Was slate-700
    textMuted: 'text-slate-500', // Was pink-400 (too light)
    accentBg: 'bg-pink-400', accentText: 'text-white', inputBg: 'bg-white',
    font: 'font-serif'
  },
  // SCHOOL: Replaced unreadable sky-blue text with slate
  'SCHOOL': {
    id: 'SCHOOL', appBg: 'bg-sky-50', headerBg: 'bg-white/80 border-sky-100',
    panelBg: 'bg-white', panelBorder: 'border-sky-200',
    textMain: 'text-slate-800',
    textMuted: 'text-slate-500', // Was sky-400 (too light)
    accentBg: 'bg-sky-500', accentText: 'text-white', inputBg: 'bg-sky-50/50',
    font: 'font-sans'
  },

  // ISEKAI: Darkened text significantly
  'ISEKAI_GUILD': {
    id: 'ISEKAI_GUILD', appBg: 'bg-[#EADDcf]', headerBg: 'bg-[#D6C0B0]/80 border-[#8B4513]',
    panelBg: 'bg-[#F5F1E6]', panelBorder: 'border-[#8B4513]/30',
    textMain: 'text-[#3E2723]', // Very dark brown
    textMuted: 'text-[#5D4037]', // Medium dark brown
    accentBg: 'bg-[#8B4513]', accentText: 'text-[#DAA520]', inputBg: 'bg-[#EADDcf]',
    font: 'font-serif'
  },
  // MAGIC: Lightened text for dark bg
  'MAGIC_ACADEMY': {
    id: 'MAGIC_ACADEMY', appBg: 'bg-[#0F172A]', headerBg: 'bg-[#1e293b]/90 border-blue-800',
    panelBg: 'bg-[#1e293b]/80', panelBorder: 'border-blue-500/30',
    textMain: 'text-slate-100', // White
    textMuted: 'text-slate-400', // Light grey
    accentBg: 'bg-blue-600', accentText: 'text-white', inputBg: 'bg-[#0F172A]',
    font: 'font-serif'
  },
  // URBAN: Clean slate text
  'URBAN_SLICE': {
    id: 'URBAN_SLICE', appBg: 'bg-white', headerBg: 'bg-white border-slate-100',
    panelBg: 'bg-white', panelBorder: 'border-slate-100',
    textMain: 'text-slate-900',
    textMuted: 'text-slate-500',
    accentBg: 'bg-[#22d3ee]', accentText: 'text-slate-900', inputBg: 'bg-slate-50',
    font: 'font-sans'
  },
  // SPIRIT_FOREST (Nature/Green)
  'SPIRIT_FOREST': {
    id: 'SPIRIT_FOREST', appBg: 'bg-[#F0FDF4]', headerBg: 'bg-white/90 border-emerald-200',
    panelBg: 'bg-white/80 backdrop-blur-sm', panelBorder: 'border-emerald-300',
    textMain: 'text-emerald-950',
    textMuted: 'text-emerald-700',
    accentBg: 'bg-emerald-600', accentText: 'text-white', inputBg: 'bg-[#DCFCE7]/30',
    font: 'font-serif'
  },
  // SWORD_LEGEND (Sword & Magic) - New
  'SWORD_LEGEND': {
    id: 'SWORD_LEGEND', appBg: 'bg-[#F1F5F9]', headerBg: 'bg-white/95 border-slate-300',
    panelBg: 'bg-white/90', panelBorder: 'border-slate-300',
    textMain: 'text-slate-800',
    textMuted: 'text-slate-500',
    accentBg: 'bg-[#4338ca]', accentText: 'text-white', inputBg: 'bg-[#E2E8F0]/50', // Indigo accent
    font: 'font-serif'
  },
  // NUMEROLOGY_TECH (Sci-Magic/Index) - Light Version
  'NUMEROLOGY_TECH': {
    id: 'NUMEROLOGY_TECH', appBg: 'bg-white', headerBg: 'bg-white/80 border-blue-200 backdrop-blur-md',
    panelBg: 'bg-white/95', panelBorder: 'border-blue-500/30',
    textMain: 'text-slate-900',
    textMuted: 'text-blue-900/60',
    accentBg: 'bg-blue-600', accentText: 'text-yellow-300', inputBg: 'bg-slate-50 border-blue-100',
    font: 'font-mono'
  },

  // SAKURA: Darkened pink text to purple-ish
  'SAKURA_WIND': {
    id: 'SAKURA_WIND', appBg: 'bg-[#FFF0F5]', headerBg: 'bg-[#FDF2F8]/90 border-pink-200',
    panelBg: 'bg-white/80 backdrop-blur-sm', panelBorder: 'border-pink-300',
    textMain: 'text-slate-900', // Was dark pink
    textMuted: 'text-pink-700', // Was light pink (invisible). Now dark pink.
    accentBg: 'bg-[#BE185D]', accentText: 'text-white', inputBg: 'bg-white/80',
    font: 'font-serif'
  },
  // SHRINE: Darkened orange text to rust/brown
  'SHRINE_MAIDEN': {
    id: 'SHRINE_MAIDEN', appBg: 'bg-[#FFFAF0]', headerBg: 'bg-white/90 border-orange-200',
    panelBg: 'bg-[#FFF7ED]', panelBorder: 'border-[#CC2E1A]/20',
    textMain: 'text-slate-800', // Was rust
    textMuted: 'text-orange-800/80', // Was bright orange. Now dark orange.
    accentBg: 'bg-[#CC2E1A]', accentText: 'text-white', inputBg: 'bg-white',
    font: 'font-serif'
  },
  // AUTUMN: Lightened text for dark brown bg
  'AUTUMN_MAPLE': {
    id: 'AUTUMN_MAPLE', appBg: 'bg-[#431407]', headerBg: 'bg-[#2c0b02]/90 border-orange-900',
    panelBg: 'bg-[#2c0b02]/80', panelBorder: 'border-orange-800/40',
    textMain: 'text-orange-50', // Almost white
    textMuted: 'text-orange-200/60', // Light orange
    accentBg: 'bg-orange-700', accentText: 'text-orange-100', inputBg: 'bg-[#431407]/50',
    font: 'font-serif'
  },
  // HANABI: Clean light text on black
  'HANABI_FEST': {
    id: 'HANABI_FEST', appBg: 'bg-[#020617]', headerBg: 'bg-[#0f172a]/90 border-indigo-900',
    panelBg: 'bg-[#0f172a]/70 backdrop-blur-md', panelBorder: 'border-indigo-500/30',
    textMain: 'text-slate-200',
    textMuted: 'text-slate-500',
    accentBg: 'bg-pink-600', accentText: 'text-white', inputBg: 'bg-[#020617]/50',
    font: 'font-sans'
  },
};

function AppContent() {
  const { t, language } = useLanguage();
  const [activeModule, setActiveModule] = useState<'home' | 'workflow' | 'strategy' | 'settings'>('home');
  const [globalMessage, setGlobalMessage] = useState(t('app.welcomeBack'));
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Track the actual active theme for UI styling
  const [activeThemeId, setActiveThemeId] = useState<string>('SYSTEM');

  // Update global message when language changes
  useEffect(() => {
    if (!isProcessing) {
      setGlobalMessage(t('app.welcomeBack'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Helper function to update year in prompts from 2025 to 2026
  const updatePromptsYear = (prompts: any) => {
    if (!prompts) return DEFAULT_PROMPTS;
    return {
      openingPrompt: prompts.openingPrompt?.replace(/2025/g, '2026') || DEFAULT_PROMPTS.openingPrompt,
      tipPrompt: prompts.tipPrompt?.replace(/2025/g, '2026') || DEFAULT_PROMPTS.tipPrompt
    };
  };

  // Helper function to update year in templates
  const updateTemplatesYear = (templates: any[]) => {
    if (!templates || !Array.isArray(templates)) return DEFAULT_TEMPLATES;
    return templates.map(template => ({
      ...template,
      customOpeningPrompt: template.customOpeningPrompt?.replace(/2025/g, '2026'),
      customTipPrompt: template.customTipPrompt?.replace(/2025/g, '2026')
    }));
  };

  // Centralized State Store with LocalStorage Persistence
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        const normalizedJobs = (parsed.jobs || []).map((job: any) => ({
          ...job,
          copied: job?.copied ?? false
        }));

        // Update prompts and templates to use 2026 instead of 2025
        const updatedPrompts = updatePromptsYear(parsed.prompts);

        // Merge & Force Sync Logic: Ensure code updates to prompts override stale local cache
        const loadedTemplates = parsed.templates || [];
        const mergedTemplates = DEFAULT_TEMPLATES.map(defTmpl => {
          const userTmpl = loadedTemplates.find((t: any) => t.id === defTmpl.id);
          if (userTmpl) {
            // Respect user modifications: Only fill in prompts if they are missing entirely
            return {
              ...defTmpl,
              ...userTmpl,
              customOpeningPrompt: userTmpl.customOpeningPrompt || defTmpl.customOpeningPrompt,
              customTipPrompt: userTmpl.customTipPrompt || defTmpl.customTipPrompt
            };
          }
          return defTmpl;
        });

        // Add any additional user-created templates that are NOT in defaults
        const customUserTemplates = loadedTemplates.filter((t: any) => !DEFAULT_TEMPLATES.some(d => d.id === t.id));
        const finalTemplates = updateTemplatesYear([...mergedTemplates, ...customUserTemplates]);

        return {
          titles: parsed.titles || DEFAULT_TITLES,
          images: parsed.images || DEFAULT_IMAGES,
          endings: parsed.endings || DEFAULT_ENDINGS,
          templates: finalTemplates,
          prompts: updatedPrompts,
          jobs: normalizedJobs,
          welcomeTheme: parsed.welcomeTheme || 'RANDOM',
          uiTheme: parsed.uiTheme || 'SYSTEM'
        };
      }
    } catch (e) {
      console.error("System boot error: corrupted local data", e);
    }
    // Fallback to defaults
    return {
      titles: DEFAULT_TITLES,
      images: DEFAULT_IMAGES,
      endings: DEFAULT_ENDINGS,
      templates: DEFAULT_TEMPLATES,
      prompts: DEFAULT_PROMPTS,
      jobs: [],
      welcomeTheme: 'RANDOM',
      uiTheme: 'SYSTEM'
    };
  });

  // Auto-update year from 2025 to 2026 on first load
  useEffect(() => {
    const needsUpdate =
      appState.prompts.openingPrompt?.includes('2025') ||
      appState.prompts.tipPrompt?.includes('2025') ||
      appState.templates.some(t =>
        t.customOpeningPrompt?.includes('2025') ||
        t.customTipPrompt?.includes('2025')
      );

    if (needsUpdate) {
      const updatedPrompts = {
        openingPrompt: appState.prompts.openingPrompt?.replace(/2025/g, '2026') || appState.prompts.openingPrompt,
        tipPrompt: appState.prompts.tipPrompt?.replace(/2025/g, '2026') || appState.prompts.tipPrompt
      };

      const updatedTemplates = appState.templates.map(t => ({
        ...t,
        customOpeningPrompt: t.customOpeningPrompt?.replace(/2025/g, '2026'),
        customTipPrompt: t.customTipPrompt?.replace(/2025/g, '2026')
      }));

      setAppState(prev => ({
        ...prev,
        prompts: updatedPrompts,
        templates: updatedTemplates
      }));
    }
  }, []); // Only run once on mount

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
      } catch (e) {
        console.error("Auto-save failed:", e);
        setGlobalMessage(language === 'zh' ? "警告：本地存储空间不足，自动保存失败。" : language === 'en' ? "Warning: Insufficient local storage space, auto-save failed." : "警告：ローカルストレージの容量不足、自動保存に失敗しました。");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [appState]);

  // Enforce locked theme from state immediately on load/change
  useEffect(() => {
    if (appState.uiTheme && appState.uiTheme !== 'AUTO') {
      setActiveThemeId(appState.uiTheme);
    }
  }, [appState.uiTheme]);

  const handleMessage = (msg: string) => {
    setGlobalMessage(msg);
    setIsProcessing(true);
    setTimeout(() => setIsProcessing(false), 2000);
  };

  const handleRestart = () => {
    setGlobalMessage(t('app.restarting'));
    setIsProcessing(true);
    setTimeout(() => {
      window.location.reload();
    }, 1200);
  };

  const handleWelcomeComplete = (finalTheme: string) => {
    // Only sync theme if UI is set to AUTO (default)
    // If UI is locked to a specific theme, we ignore the welcome screen's theme for the main UI
    if (!appState.uiTheme || appState.uiTheme === 'AUTO') {
      setActiveThemeId(finalTheme);
    }
    setShowWelcome(false);
  };

  const ts = THEME_STYLES[activeThemeId] || THEME_STYLES['SYSTEM'];

  const NavButton = ({ id, label, subLabel, icon: Icon }: { id: typeof activeModule, label: string, subLabel: string, icon: any }) => (
    <button
      onClick={() => setActiveModule(id)}
      className={`relative group px-6 py-4 flex flex-col items-center justify-center transition-all duration-300 ${activeModule === id ? ts.textMain : ts.textMuted}`}
    >
      <div className="flex items-center space-x-2 mb-1">
        <Icon className={`w-4 h-4 ${activeModule === id ? '' : 'opacity-50'} transition-colors`} style={{ color: activeModule === id ? undefined : 'currentColor' }} />
        <span className={`text-base font-bold tracking-tight ${activeModule === id ? 'font-black' : 'font-medium'}`}>{label}</span>
      </div>
      <span className="text-[9px] font-mono tracking-widest uppercase opacity-60">{subLabel}</span>

      {/* Active Indicator Line */}
      <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[3px] transition-all duration-300 ${activeModule === id ? 'w-12 opacity-100' : 'w-0 opacity-0'} ${ts.accentBg}`}></span>
    </button>
  );

  return (
    <div className={`h-screen w-screen selection:bg-rei-primary/30 flex flex-col overflow-hidden relative transition-colors duration-1000 ${ts.appBg} ${ts.font} ${ts.textMain}`}>

      {/* Background Grid Pattern - Dynamic Opacity */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Easter Egg Overlay */}
      {showWelcome && <WelcomeOverlay onDismiss={handleWelcomeComplete} forcedTheme={appState.welcomeTheme} />}

      {/* Top Header - LN Style */}
      <header className={`flex-none z-40 backdrop-blur-md border-b h-24 flex items-center justify-between px-8 lg:px-12 select-none relative transition-colors duration-1000 ${ts.headerBg} border-current/10`}>
        {/* Logo Section */}
        <div
          className="flex flex-col cursor-pointer group"
          onDoubleClick={() => setShowWelcome(true)}
          title="Double click for system reset..."
        >
          <div className="flex items-baseline space-x-1">
            <span className={`text-4xl lg:text-5xl font-black tracking-tighter leading-none`}>MAID</span>
            <span className={`text-4xl lg:text-5xl font-thin tracking-widest leading-none group-hover:opacity-80 transition-opacity`} style={{ color: ts.id === 'SYSTEM' ? '#EF5350' : 'currentColor', opacity: 0.8 }}>REI</span>
          </div>
          <div className="flex items-center space-x-3 mt-1">
            <span className="h-[1px] w-8 bg-current opacity-30"></span>
            <span className="text-[10px] font-bold tracking-[0.3em] opacity-60 uppercase">{t('app.automatedWorkflowSystem')}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <NavButton id="home" label={t('app.nav.assets')} subLabel="Assets" icon={Database} />
          <div className="w-[1px] h-8 bg-current opacity-20 rotate-12"></div>
          <NavButton id="workflow" label={t('app.nav.workflow')} subLabel="Workflow" icon={GitBranch} />
          <div className="w-[1px] h-8 bg-current opacity-20 rotate-12"></div>
          <NavButton id="strategy" label={t('app.nav.strategy')} subLabel="Strategy" icon={Target} />
          <div className="w-[1px] h-8 bg-current opacity-20 rotate-12"></div>
          <NavButton id="settings" label={t('app.nav.settings')} subLabel="Settings" icon={Settings} />
        </nav>

        {/* Status Widget */}
        <div className="flex items-center space-x-4">
          {/* One-Click Restart Button */}
          <button
            onClick={handleRestart}
            className={`flex items-center space-x-2 px-3 py-2 rounded-sm border transition-all duration-300 group ${ts.panelBorder} ${ts.inputBg} hover:${ts.accentBg} hover:border-transparent`}
            title={t('app.restart')}
          >
            <RefreshCw className={`w-4 h-4 transition-transform duration-700 group-hover:rotate-180 ${ts.textMuted} group-hover:text-white`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest hidden lg:block ${ts.textMuted} group-hover:text-white`}>{t('app.restart')}</span>
          </button>

          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-mono opacity-50 tracking-widest uppercase">{t('app.systemStatus')}</div>
            <div className="text-lg font-black tracking-tight font-mono">{t('app.online')} <span className="text-green-500">●</span></div>
          </div>
          <div className={`w-10 h-10 flex items-center justify-center rounded-sm shadow-lg text-white ${ts.accentBg}`}>
            <Hexagon className="w-5 h-5 animate-pulse-slow" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative w-full max-w-[1920px] mx-auto py-6 px-4 lg:px-8 z-10">
        {activeModule === 'home' && <AssetLibrary state={appState} setState={setAppState} setGlobalMessage={handleMessage} themeStyle={ts} />}
        {activeModule === 'workflow' && <WorkflowBoard appState={appState} setState={setAppState} setGlobalMessage={handleMessage} themeStyle={ts} />}
        {activeModule === 'strategy' && <StrategyRoom state={appState} setState={setAppState} setGlobalMessage={handleMessage} themeStyle={ts} />}
        {activeModule === 'settings' && <SettingsModule setGlobalMessage={handleMessage} themeStyle={ts} />}
      </main>

      <MaidRei message={globalMessage} isProcessing={isProcessing} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}