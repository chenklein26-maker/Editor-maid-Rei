import React, { useState, useEffect } from 'react';
import { analyzeTrends } from '../../services/aiService';
import { AppState, LibraryItem, UIThemeStyle } from '../../types';
import { Lightbulb, ArrowDown, PlusCircle, Settings, Save, ChevronDown, Search, BarChart3, Monitor, Lock, Unlock, Play, Sun, Moon, Terminal, FileCode, MessageSquare, Wand2, Globe } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface StrategyRoomProps {
    state: AppState;
    setState: React.Dispatch<React.SetStateAction<AppState>>;
    setGlobalMessage: (msg: string) => void;
    themeStyle: UIThemeStyle;
}

export const StrategyRoom: React.FC<StrategyRoomProps> = ({ state, setState, setGlobalMessage, themeStyle: ts }) => {
    const { language, setLanguage, t } = useLanguage();
    const [topic, setTopic] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<string[]>([]);

    // Prompt Configuration State
    const [selectedConfigTarget, setSelectedConfigTarget] = useState<string>('GLOBAL'); // 'GLOBAL' or Template ID
    const [currentPrompts, setCurrentPrompts] = useState({
        openingPrompt: '',
        tipPrompt: ''
    });
    const [newConfigName, setNewConfigName] = useState('');

    // Theme Config Mode: 'STARTUP' (Default) or 'UI_LOCK'
    const [themeConfigMode, setThemeConfigMode] = useState<'STARTUP' | 'UI_LOCK'>('STARTUP');

    // Load prompts when selection changes
    useEffect(() => {
        if (selectedConfigTarget === 'GLOBAL') {
            setCurrentPrompts(state.prompts);
        } else {
            const template = state.templates.find(t => t.id === selectedConfigTarget);
            if (template) {
                setCurrentPrompts({
                    openingPrompt: template.customOpeningPrompt || '', // Default to empty if using global fallback
                    tipPrompt: template.customTipPrompt || ''
                });
            }
        }
    }, [selectedConfigTarget, state.prompts, state.templates]);

    const handleAnalyze = async () => {
        if (!topic.trim()) return;
        setIsAnalyzing(true);
        setGlobalMessage(language === 'zh' ? `正在分析 "${topic}" 领域的趋势...` : language === 'en' ? `Analyzing trends in "${topic}"...` : `"${topic}"のトレンドを分析中...`);

        try {
            const titles = await analyzeTrends(topic);
            setResults(titles);
            setGlobalMessage(language === 'zh' ? "分析完成。发现潜在高价值标题。" : language === 'en' ? "Analysis complete. Potential high-value titles found." : "分析完了。潜在的な高価値タイトルを発見しました。");
        } catch (e: any) {
            setGlobalMessage(language === 'zh' ? `分析中断: ${e.message || '请重试'}` : language === 'en' ? `Analysis interrupted: ${e.message || 'Please try again'}` : `分析中断: ${e.message || '再試行してください'}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const addToLibrary = (title: string) => {
        const newItem: LibraryItem = {
            id: Math.random().toString(36).substr(2, 9),
            content: title
        };
        setState(prev => ({ ...prev, titles: [...prev.titles, newItem] }));
        setGlobalMessage(language === 'zh' ? `已将 "${title.substring(0, 10)}..." 加入标题库。` : language === 'en' ? `Added "${title.substring(0, 10)}..." to title library.` : `"${title.substring(0, 10)}..."をタイトルライブラリに追加しました。`);
        setResults(prev => prev.filter(t => t !== title));
    };

    const savePrompts = () => {
        if (selectedConfigTarget === 'GLOBAL') {
            setState(prev => ({
                ...prev,
                prompts: {
                    openingPrompt: currentPrompts.openingPrompt,
                    tipPrompt: currentPrompts.tipPrompt
                }
            }));
            setGlobalMessage(language === 'zh' ? "全局提示词已更新。" : language === 'en' ? "Global prompts updated." : "グローバルプロンプトを更新しました。");
        } else {
            // Update specific template
            setState(prev => ({
                ...prev,
                templates: prev.templates.map(t => {
                    if (t.id === selectedConfigTarget) {
                        return {
                            ...t,
                            customOpeningPrompt: currentPrompts.openingPrompt || undefined, // If empty, remove it (revert to global)
                            customTipPrompt: currentPrompts.tipPrompt || undefined
                        };
                    }
                    return t;
                })
            }));
            setGlobalMessage(language === 'zh' ? "该模板的专属提示词已保存。" : language === 'en' ? "Template-specific prompts saved." : "テンプレート固有のプロンプトを保存しました。");
        }
    };

    const createNewConfig = () => {
        const name = newConfigName.trim();
        if (!name) return;
        const id = `CFG_${Date.now().toString(36)}`;
        setState(prev => ({
            ...prev,
            templates: [
                ...prev.templates,
                {
                    id,
                    content: name,
                    category: name,
                    customOpeningPrompt: '',
                    customTipPrompt: ''
                }
            ]
        }));
        setSelectedConfigTarget(id);
        setCurrentPrompts({
            openingPrompt: '',
            tipPrompt: ''
        });
        setNewConfigName('');
        setGlobalMessage(
            language === 'zh'
                ? `已创建新的提示词配置：「${name}」`
                : language === 'en'
                ? `Created new prompt profile: "${name}"`
                : `新しいプロンプト構成を作成しました: 「${name}」`
        );
    };

    const updateWelcomeTheme = (theme: string) => {
        setState(prev => ({ ...prev, welcomeTheme: theme }));
        setGlobalMessage(language === 'zh' ? `启动页已设为: ${theme}` : language === 'en' ? `Startup page set to: ${theme}` : `スタートアップページを設定: ${theme}`);
    };

    const updateUITheme = (theme: string) => {
        setState(prev => ({ ...prev, uiTheme: theme }));
        if (theme === 'AUTO') {
            setGlobalMessage(language === 'zh' ? "界面锁定已解除：主界面将跟随启动页风格。" : language === 'en' ? "UI lock released: Main interface will follow startup page style." : "UIロック解除：メインインターフェースはスタートアップページのスタイルに従います。");
        } else {
            setGlobalMessage(language === 'zh' ? `界面已锁定为: ${theme}` : language === 'en' ? `UI locked to: ${theme}` : `UIをロック: ${theme}`);
        }
    };

    // Theme Definitions for Grouping
    const LIGHT_THEMES = [
        { id: 'SYSTEM', label: '💠 系统 System', color: 'text-slate-600' },
        { id: 'FANTASY', label: '📜 幻想 Fantasy', color: 'text-amber-600' },
        { id: 'ROMANCE', label: '💗 恋爱 Romance', color: 'text-pink-500' },
        { id: 'SCHOOL', label: '🏫 校园 School', color: 'text-sky-500' },
        { id: 'ISEKAI_GUILD', label: '🛡️ 公会 Guild', color: 'text-amber-700' },
        { id: 'URBAN_SLICE', label: '🏙️ 都市 Urban', color: 'text-cyan-600' },
        { id: 'SPIRIT_FOREST', label: '🌿 森灵 Nature', color: 'text-emerald-600' },
        { id: 'SWORD_LEGEND', label: '⚔️ 圣剑 Sword', color: 'text-indigo-600' },
        { id: 'NUMEROLOGY_TECH', label: '🔢 术式 Index', color: 'text-cyan-600' },
        { id: 'SAKURA_WIND', label: '🌸 大正 Sakura', color: 'text-pink-600' },
        { id: 'SHRINE_MAIDEN', label: '⛩️ 神社 Shrine', color: 'text-orange-600' },
    ];

    const DARK_THEMES = [
        { id: 'BATTLE', label: '⚔️ 战斗 Battle', color: 'text-red-500' },
        { id: 'MAGIC_ACADEMY', label: '🔮 魔法 Magic', color: 'text-purple-400' },
        { id: 'AUTUMN_MAPLE', label: '🍁 红叶 Maple', color: 'text-orange-400' },
        { id: 'HANABI_FEST', label: '🎆 花火 Hanabi', color: 'text-pink-400' },
    ];

    const renderThemeButton = (theme: { id: string, label: string, color: string }) => {
        const isActive = themeConfigMode === 'STARTUP' ? state.welcomeTheme === theme.id : state.uiTheme === theme.id;
        return (
            <button
                key={theme.id}
                onClick={() => themeConfigMode === 'STARTUP' ? updateWelcomeTheme(theme.id) : updateUITheme(theme.id)}
                className={`px-3 py-2 text-[10px] font-bold rounded border transition-all truncate text-left ${isActive ? `bg-transparent ring-2 ring-current ${theme.color}` : `${ts.inputBg} ${ts.textMuted} hover:opacity-100 ${ts.panelBorder}`}`}
            >
                {theme.label}
            </button>
        );
    };

    return (
        <div className="h-full flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">

            {/* === MAIN AREA: Prompt Engineering & Configuration === */}
            <div className="flex-1 min-w-0 flex flex-col gap-6 h-full overflow-hidden">

                {/* 1. Prompt Settings Card - OPTIMIZED */}
                <div className={`rounded-2xl shadow-lg border flex flex-col flex-1 overflow-hidden transition-all duration-500 relative group ${ts.panelBg} ${ts.panelBorder}`}>

                    {/* Header with improved depth */}
                    <div className={`p-5 border-b flex items-center justify-between relative z-10 ${ts.panelBorder} bg-gradient-to-r from-black/5 to-transparent`}>
                        <div className={`flex items-center space-x-3 ${ts.textMain}`}>
                            <div className={`p-2 rounded-lg border shadow-sm ${ts.panelBg} ${ts.panelBorder} ${ts.accentText.replace('text-', 'text-opacity-80 text-')}`}>
                                <Terminal className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-base tracking-tight uppercase">{t('strategyRoom.promptEngineering')}</h3>
                                <p className={`text-[10px] ${ts.textMuted} font-mono tracking-widest opacity-70`}>{t('strategyRoom.promptEngineeringConsole')}</p>
                            </div>
                        </div>

                        {/* Target Selector + New Config */}
                        <div className="flex flex-col gap-2 w-80">
                            <div className="flex gap-2">
                                <input
                                    value={newConfigName}
                                    onChange={(e) => setNewConfigName(e.target.value)}
                                    placeholder="新建提示词配置名称，如：PVP 专用"
                                    className={`flex-1 px-3 py-2 text-xs rounded border ${ts.inputBg} ${ts.panelBorder} ${ts.textMain} placeholder:${ts.textMuted} focus:outline-none focus:ring-2 focus:ring-offset-1`}
                                />
                                <button
                                    type="button"
                                    onClick={createNewConfig}
                                    disabled={!newConfigName.trim()}
                                    className={`px-3 py-2 text-xs font-bold rounded border flex items-center gap-1 transition-colors ${
                                        newConfigName.trim()
                                            ? `${ts.accentBg} ${ts.accentText} hover:opacity-90`
                                            : `${ts.inputBg} ${ts.textMuted} ${ts.panelBorder} cursor-not-allowed opacity-60`
                                    }`}
                                >
                                    <PlusCircle className="w-3 h-3" />
                                    新建
                                </button>
                            </div>
                            <div className="relative group/select">
                                <div className={`absolute inset-0 bg-current opacity-5 rounded-lg pointer-events-none transition-opacity group-hover/select:opacity-10 ${ts.textMain}`}></div>
                                <select
                                    value={selectedConfigTarget}
                                    onChange={(e) => setSelectedConfigTarget(e.target.value)}
                                    className={`w-full appearance-none bg-transparent border-2 text-xs font-bold py-2.5 pl-4 pr-10 rounded-lg focus:outline-none focus:border-current cursor-pointer transition-colors ${ts.panelBorder} ${ts.textMain}`}
                                >
                                    <option value="GLOBAL" className="text-black">{t('strategyRoom.globalDefault')}</option>
                                    <optgroup label={t('strategyRoom.templateSpecific')} className="text-black">
                                        {state.templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.category} [{t.id}]</option>
                                        ))}
                                    </optgroup>
                                </select>
                                <Settings className={`w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none ${ts.textMuted}`} />
                            </div>
                        </div>
                    </div>

                    {/* Main Editor Area - Changed to lg:flex-row (Side-by-Side on Laptops+) */}
                    <div className="flex-1 overflow-hidden p-0 flex flex-col lg:flex-row relative">

                        {/* Left Pane: Opening Prompt */}
                        <div className="flex-1 flex flex-col h-full border-b lg:border-b-0 lg:border-r transition-colors relative" style={{ borderColor: 'inherit' }}>
                            {/* Toolbar */}
                            <div className={`flex items-center justify-between px-5 py-3 border-b bg-black/[0.02] ${ts.panelBorder}`}>
                                <label className={`text-[10px] font-black ${ts.textMuted} uppercase tracking-widest flex items-center`}>
                                    <FileCode className="w-3 h-3 mr-2 opacity-50" /> {t('strategyRoom.opening')}
                                </label>
                                <div className={`text-[9px] font-mono ${ts.textMuted} opacity-60`}>MAX_TOKENS: AUTO</div>
                            </div>

                            {/* Textarea Container */}
                            <div className="flex-1 relative bg-black/[0.02]">
                                <textarea
                                    value={currentPrompts.openingPrompt}
                                    onChange={(e) => setCurrentPrompts({ ...currentPrompts, openingPrompt: e.target.value })}
                                    placeholder={t('strategyRoom.placeholder.opening')}
                                    className={`absolute inset-0 w-full h-full p-5 text-xs font-mono resize-none focus:outline-none bg-transparent ${ts.textMain} placeholder-slate-400/30 leading-relaxed custom-scrollbar`}
                                    spellCheck={false}
                                />
                                {/* Decorative Corner */}
                                <div className={`absolute bottom-0 right-0 p-4 opacity-10 pointer-events-none ${ts.textMuted}`}>
                                    <Wand2 className="w-16 h-16" />
                                </div>
                            </div>
                        </div>

                        {/* Right Pane: Tips Prompt */}
                        <div className="flex-1 flex flex-col h-full relative">
                            {/* Toolbar */}
                            <div className={`flex items-center justify-between px-5 py-3 border-b bg-black/[0.02] ${ts.panelBorder}`}>
                                <label className={`text-[10px] font-black ${ts.textMuted} uppercase tracking-widest flex items-center`}>
                                    <MessageSquare className="w-3 h-3 mr-2 opacity-50" /> {t('strategyRoom.tips')}
                                </label>
                                <div className={`text-[9px] font-mono ${ts.textMuted} opacity-60`}>FORMAT: ARRAY</div>
                            </div>

                            {/* Textarea Container */}
                            <div className="flex-1 relative bg-black/[0.02]">
                                <textarea
                                    value={currentPrompts.tipPrompt}
                                    onChange={(e) => setCurrentPrompts({ ...currentPrompts, tipPrompt: e.target.value })}
                                    placeholder={t('strategyRoom.placeholder.tips')}
                                    className={`absolute inset-0 w-full h-full p-5 text-xs font-mono resize-none focus:outline-none bg-transparent ${ts.textMain} placeholder-slate-400/30 leading-relaxed custom-scrollbar`}
                                    spellCheck={false}
                                />
                                {/* Decorative Corner */}
                                <div className={`absolute bottom-0 right-0 p-4 opacity-10 pointer-events-none ${ts.textMuted}`}>
                                    <Lightbulb className="w-16 h-16" />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Footer Action Bar */}
                    <div className={`p-4 border-t flex justify-between items-center bg-black/5 ${ts.panelBorder}`}>
                        <div className="flex items-center space-x-2">
                            <div className={`px-2 py-1 rounded text-[9px] font-bold border ${ts.panelBorder} ${ts.textMuted}`}>
                                {selectedConfigTarget === 'GLOBAL' ? 'SYSTEM_DEFAULT' : `OVERRIDE: ${selectedConfigTarget}`}
                            </div>
                            {selectedConfigTarget !== 'GLOBAL' && (!currentPrompts.openingPrompt && !currentPrompts.tipPrompt) && (
                                <span className="text-[9px] text-amber-500 font-bold flex items-center animate-pulse">
                                    <ArrowDown className="w-3 h-3 mr-1" /> 继承全局配置
                                </span>
                            )}
                        </div>
                        <button
                            onClick={savePrompts}
                            className={`px-8 py-3 rounded-lg text-xs font-bold transition-all flex items-center text-white shadow-lg transform active:scale-95 ${ts.accentBg} hover:brightness-110`}
                        >
                            <Save className="w-4 h-4 mr-2" /> {t('strategyRoom.saveConfig')}
                        </button>
                    </div>
                </div>

                {/* 2. Theme Selector Card - Compacted to 200px */}
                <div className={`rounded-2xl shadow-sm border flex-none flex flex-col h-[200px] transition-colors duration-500 ${ts.panelBg} ${ts.panelBorder}`}>

                    {/* Header & Tabs */}
                    <div className={`p-4 pb-2 border-b ${ts.panelBorder} bg-black/5 flex items-center justify-between`}>
                        <div className={`flex items-center space-x-2 ${ts.textMain}`}>
                            <div className={`p-1.5 rounded-md border shadow-sm ${ts.panelBg} ${ts.panelBorder}`}>
                                <Monitor className="w-4 h-4 text-purple-500" />
                            </div>
                            <h3 className="font-bold text-sm">{t('strategyRoom.visualStyle')}</h3>
                        </div>

                        {/* Mode Toggle Tabs */}
                        <div className={`flex rounded-lg p-1 space-x-1 ${ts.inputBg} border ${ts.panelBorder} w-64`}>
                            <button
                                onClick={() => setThemeConfigMode('STARTUP')}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md flex items-center justify-center space-x-1 transition-all ${themeConfigMode === 'STARTUP' ? `${ts.panelBg} ${ts.textMain} shadow-sm ring-1 ring-black/5` : `${ts.textMuted} hover:opacity-80`}`}
                            >
                                <Play className="w-3 h-3" /> <span>{t('strategyRoom.startupPage')}</span>
                            </button>
                            <button
                                onClick={() => setThemeConfigMode('UI_LOCK')}
                                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded-md flex items-center justify-center space-x-1 transition-all ${themeConfigMode === 'UI_LOCK' ? `${ts.panelBg} ${ts.textMain} shadow-sm ring-1 ring-black/5` : `${ts.textMuted} hover:opacity-80`}`}
                            >
                                <Lock className="w-3 h-3" /> <span>{t('strategyRoom.uiLock')}</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1 p-4 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Controls Column */}
                            <div className="space-y-4">
                                {/* Control Mode: STARTUP */}
                                {themeConfigMode === 'STARTUP' && (
                                    <div className="space-y-2 animate-in fade-in duration-300">
                                        <button
                                            onClick={() => updateWelcomeTheme('RANDOM')}
                                            className={`w-full px-3 py-3 text-[10px] font-bold rounded-lg border transition-all text-center uppercase tracking-widest ${state.welcomeTheme === 'RANDOM' ? `${ts.accentBg} text-white` : `${ts.inputBg} ${ts.textMuted} hover:opacity-80`}`}
                                        >
                                            {t('strategyRoom.randomDisplay')}
                                        </button>
                                        <p className={`text-[10px] ${ts.textMuted} opacity-60 leading-tight`}>
                                            {t('strategyRoom.randomDisplayDesc')}
                                        </p>
                                    </div>
                                )}

                                {/* Control Mode: UI LOCK */}
                                {themeConfigMode === 'UI_LOCK' && (
                                    <div className="space-y-2 animate-in fade-in duration-300">
                                        <button
                                            onClick={() => updateUITheme('AUTO')}
                                            className={`w-full px-3 py-3 text-[10px] font-bold rounded-lg border transition-all text-center uppercase tracking-widest ${(!state.uiTheme || state.uiTheme === 'AUTO') ? `${ts.accentBg} text-white` : `${ts.inputBg} ${ts.textMuted} hover:opacity-80`}`}
                                        >
                                            <Unlock className="w-3 h-3 inline mr-2" />
                                            {t('strategyRoom.autoSync')}
                                        </button>
                                        <p className={`text-[10px] ${ts.textMuted} opacity-60 leading-tight`}>
                                            {t('strategyRoom.autoSyncDesc')}
                                        </p>
                                    </div>
                                )}

                                {/* Language Switcher */}
                                <div className="space-y-2 animate-in fade-in duration-300 mt-4 pt-4 border-t border-current/10">
                                    <div className={`text-[9px] font-bold ${ts.textMuted} uppercase tracking-widest mb-2 flex items-center`}>
                                        <Globe className="w-3 h-3 mr-1" /> {t('strategyRoom.language')}
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setLanguage('zh')}
                                            className={`flex-1 px-2 py-1.5 text-[10px] font-bold rounded border transition-all ${language === 'zh' ? `${ts.accentBg} text-white` : `${ts.inputBg} ${ts.textMuted} hover:opacity-80`}`}
                                        >
                                            中文
                                        </button>
                                        <button
                                            onClick={() => setLanguage('en')}
                                            className={`flex-1 px-2 py-1.5 text-[10px] font-bold rounded border transition-all ${language === 'en' ? `${ts.accentBg} text-white` : `${ts.inputBg} ${ts.textMuted} hover:opacity-80`}`}
                                        >
                                            English
                                        </button>
                                        <button
                                            onClick={() => setLanguage('ja')}
                                            className={`flex-1 px-2 py-1.5 text-[10px] font-bold rounded border transition-all ${language === 'ja' ? `${ts.accentBg} text-white` : `${ts.inputBg} ${ts.textMuted} hover:opacity-80`}`}
                                        >
                                            日本語
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Theme Grids Column */}
                            <div className="space-y-4">
                                {/* Light Themes */}
                                <div>
                                    <div className={`text-[9px] font-bold ${ts.textMuted} uppercase tracking-widest mb-2 flex items-center`}>
                                        <Sun className="w-3 h-3 mr-1" /> {t('strategyRoom.lightThemes')}
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 gap-2">
                                        {LIGHT_THEMES.map(renderThemeButton)}
                                    </div>
                                </div>

                                {/* Dark Themes */}
                                <div>
                                    <div className={`text-[9px] font-bold ${ts.textMuted} uppercase tracking-widest mb-2 flex items-center`}>
                                        <Moon className="w-3 h-3 mr-1" /> {t('strategyRoom.darkThemes')}
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 xl:grid-cols-3 gap-2">
                                        {DARK_THEMES.map(renderThemeButton)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* === SIDEBAR AREA: Analysis (Shrunk) === */}
            <div className="w-[320px] flex-none flex flex-col gap-6 h-full overflow-hidden">

                {/* Analysis Input - Compact */}
                <div className={`p-5 rounded-2xl shadow-lg relative overflow-hidden flex-none ${ts.id === 'SYSTEM' ? 'bg-gradient-to-br from-slate-900 to-slate-800' : `${ts.panelBg} border ${ts.panelBorder}`}`}>
                    <div className="relative z-10">
                        <div className={`flex items-center space-x-2 mb-2 opacity-80 ${ts.id === 'SYSTEM' ? 'text-white' : ts.textMuted}`}>
                            <BarChart3 className="w-4 h-4" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{t('strategyRoom.trends')}</span>
                        </div>
                        <h2 className={`text-xl font-light mb-4 ${ts.id === 'SYSTEM' ? 'text-white' : ts.textMain}`}>{t('strategyRoom.miningAnalysis')}</h2>

                        <div className="flex flex-col space-y-3">
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                    value={topic}
                                    onChange={e => setTopic(e.target.value)}
                                    placeholder={t('strategyRoom.inputKeyword')}
                                    className={`w-full pl-9 pr-3 py-2 text-sm rounded-lg border placeholder-slate-400 focus:outline-none transition-all ${ts.id === 'SYSTEM' ? 'bg-white/10 border-white/10 text-white focus:bg-white/20' : `${ts.inputBg} ${ts.panelBorder} ${ts.textMain}`}`}
                                    onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                                />
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className={`w-full py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 shadow-md ${ts.id === 'SYSTEM' ? 'bg-red-500 hover:bg-red-400 text-white' : `${ts.accentBg} text-white hover:brightness-110`}`}
                            >
                                {isAnalyzing ? t('strategyRoom.analyzing') : t('strategyRoom.startMining')}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results List - Compact */}
                <div className={`flex-1 rounded-2xl shadow-sm border flex flex-col overflow-hidden transition-colors duration-500 ${ts.panelBg} ${ts.panelBorder}`}>
                    <div className={`p-3 border-b flex items-center justify-between bg-black/5 ${ts.panelBorder}`}>
                        <div className={`flex items-center space-x-2 ${ts.textMuted} text-[10px] font-bold uppercase tracking-wider`}>
                            <Lightbulb className="w-3 h-3 text-amber-500" />
                            <span>{t('strategyRoom.results')} ({results.length})</span>
                        </div>
                        {results.length > 0 && <button onClick={() => setResults([])} className={`text-[10px] ${ts.textMuted} hover:text-red-500`}>{t('strategyRoom.clear')}</button>}
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {results.length === 0 ? (
                            <div className={`h-full flex flex-col items-center justify-center ${ts.textMuted} opacity-50`}>
                                <Search className="w-8 h-8 mb-2" />
                                <p className="text-xs">{t('strategyRoom.noData')}</p>
                            </div>
                        ) : (
                            results.map((title, idx) => (
                                <div key={idx} className={`group p-3 border rounded-lg hover:shadow-sm transition-all flex flex-col gap-2 ${ts.inputBg} ${ts.panelBorder} hover:border-current`}>
                                    <span className={`${ts.textMain} font-medium text-xs leading-snug`}>{title}</span>
                                    <button
                                        onClick={() => addToLibrary(title)}
                                        className={`w-full ${ts.accentBg} text-white py-1.5 rounded text-[10px] font-bold transition-all flex items-center justify-center opacity-0 group-hover:opacity-100`}
                                    >
                                        <PlusCircle className="w-3 h-3 mr-1" /> {t('strategyRoom.addToLibrary')}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};