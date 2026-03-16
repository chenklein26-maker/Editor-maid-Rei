import React, { useState, useEffect } from 'react';
import { AppState, LibraryItem, UIThemeStyle } from '../../types';
import { organizeBulkTitles } from '../../services/aiService';
import { Plus, Trash2, Image as ImageIcon, FileText, Type, LayoutTemplate, Sparkles, Loader2, Eraser, Undo, Database, FolderOpen, Pencil, X, Save, Zap, Filter, Check, ChevronDown, CheckSquare, Square, ArrowRightLeft, AlertCircle } from 'lucide-react';

interface AssetLibraryProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setGlobalMessage: (msg: string) => void;
  themeStyle: UIThemeStyle;
}

// --- Helper: Check if URL is company intranet ---
const isIntranetUrl = (url: string): boolean => {
  if (!url) return false;
  // Check for company intranet domains/patterns
  const intranetPatterns = [
    '18183.com',
    '18183',
    // Add more intranet patterns here if needed
  ];
  return intranetPatterns.some(pattern => url.includes(pattern));
};

// --- Helper: Normalize Image URL ---
const normalizeImageUrl = (url: string): string => {
  if (!url || !url.trim()) return url;
  
  const trimmedUrl = url.trim();
  
  // If it's already a full URL (http/https/data), return as is
  if (trimmedUrl.startsWith('http://') || 
      trimmedUrl.startsWith('https://') || 
      trimmedUrl.startsWith('data:') ||
      trimmedUrl.startsWith('blob:')) {
    return trimmedUrl;
  }
  
  // If it's a relative path starting with /, make it absolute using current origin
  if (trimmedUrl.startsWith('/')) {
    return `${window.location.origin}${trimmedUrl}`;
  }
  
  // If it's a relative path without /, try to resolve it
  // For company intranet images, try to use current origin
  if (!trimmedUrl.includes('://')) {
    // Check if it looks like an IP address or localhost
    if (/^\d+\.\d+\.\d+\.\d+/.test(trimmedUrl) || trimmedUrl.startsWith('localhost')) {
      // If it's missing protocol, add http://
      if (!trimmedUrl.startsWith('http')) {
        return `http://${trimmedUrl}`;
      }
      return trimmedUrl;
    }
    // Otherwise, treat as relative to current origin
    return `${window.location.origin}/${trimmedUrl}`;
  }
  
  return trimmedUrl;
};

// --- Helper Component for Robust Images ---
const ImageThumbnail = ({ src, themeStyle: ts }: { src: string, themeStyle: UIThemeStyle }) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageSrc, setImageSrc] = useState<string>('');

  // Normalize and set image source
  useEffect(() => { 
    if (src) {
      const normalizedUrl = normalizeImageUrl(src);
      setImageSrc(normalizedUrl);
      setHasError(false); 
      setIsLoading(true);
    } else {
      setImageSrc('');
      setHasError(true);
      setIsLoading(false);
    }
  }, [src]);

  if (hasError || !imageSrc) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity ${ts.inputBg}`}>
        <div className="relative">
           <ImageIcon className={`w-5 h-5 ${ts.textMuted} opacity-40`} />
           <div className="absolute -bottom-1 -right-1 text-red-400 bg-white rounded-full">
              <AlertCircle className="w-3 h-3" />
           </div>
        </div>
      </div>
    );
  }

  const isIntranet = isIntranetUrl(src);

  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center ${ts.inputBg} animate-pulse`}>
          <Loader2 className={`w-4 h-4 ${ts.textMuted} animate-spin`} />
        </div>
      )}
    <img 
        src={imageSrc} 
      alt="preview" 
        className={`h-full w-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={(e) => {
          console.warn('图片加载失败:', {
            original: src,
            normalized: imageSrc,
            isIntranet: isIntranet,
            error: e
          });
          setHasError(true);
          setIsLoading(false);
        }}
        onLoad={() => {
          setIsLoading(false);
        }}
      loading="lazy"
        // For intranet images, use more permissive referrer policy
        referrerPolicy={isIntranet ? "no-referrer" : "no-referrer-when-downgrade"}
        // Try to load intranet images without CORS restrictions
        crossOrigin={isIntranet ? undefined : "anonymous"}
    />
    </div>
  );
};

export const AssetLibrary: React.FC<AssetLibraryProps> = ({ state, setState, setGlobalMessage, themeStyle: ts }) => {
  const [activeTab, setActiveTab] = useState<'titles' | 'templates' | 'images' | 'endings'>('titles');
  const [newItem, setNewItem] = useState('');
  const [newCategory, setNewCategory] = useState(''); // For endings/templates/images
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Image Library Specific State
  const [imageFilterMode, setImageFilterMode] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchTargetCategory, setBatchTargetCategory] = useState('');

  // Backup state for Undo
  const [deletedTitlesBackup, setDeletedTitlesBackup] = useState<LibraryItem[] | null>(null);

  // Edit Mode State
  const [editingItem, setEditingItem] = useState<LibraryItem | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Clear selection on tab change
  useEffect(() => {
      setSelectedIds(new Set());
      setBatchTargetCategory('');
  }, [activeTab]);

  const getTabLabel = (tab: string) => {
      switch(tab) {
          case 'titles': return '标题库';
          case 'templates': return '模板库';
          case 'images': return '图片库';
          case 'endings': return '结尾库';
          default: return '';
      }
  };

  const addItem = () => {
    if (!newItem.trim()) return;
    
    // Determine Category
    let finalCategory = undefined;
    if (activeTab === 'endings' || activeTab === 'templates') {
        finalCategory = newCategory || '自定义';
    } else if (activeTab === 'images') {
        // Use the current select value, default to Global if empty/unselected
        finalCategory = newCategory || 'Global';
    }

    const item: LibraryItem = {
        id: Math.random().toString(36).substr(2, 9),
        content: newItem,
        category: finalCategory
    };

    setState(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], item]
    }));
    setNewItem('');
    setGlobalMessage(`已添加至 ${getTabLabel(activeTab)}`);
  };

  const handleFastImport = () => {
    if (!newItem.trim()) return;
    
    // 按标签区分分隔规则：图片支持空格/逗号/换行；标题保持按行分割，避免被拆成词
    const rawLines = activeTab === 'images'
      ? newItem.split(/[\n,，\s]+/)
      : newItem.split('\n');

    const processedLines = rawLines
        .map(line => line.trim())
        .filter(line => line.length > 0);

    if (processedLines.length === 0) return;

    if (activeTab === 'titles') {
        const newItems: LibraryItem[] = processedLines.map(t => ({
            id: Math.random().toString(36).substr(2, 9),
            content: t
        }));
        
        setState(prev => ({
            ...prev,
            titles: [...prev.titles, ...newItems]
        }));
        setGlobalMessage(`⚡ 极速导入完成: 新增 ${newItems.length} 条标题`);

    } else if (activeTab === 'images') {
        const category = newCategory || 'Global';
        const newItems: LibraryItem[] = processedLines.map(url => ({
            id: Math.random().toString(36).substr(2, 9),
            content: url,
            category: category
        }));

        setState(prev => ({
            ...prev,
            images: [...prev.images, ...newItems]
        }));
        setGlobalMessage(`⚡ 批量图片导入完成: 新增 ${newItems.length} 张图片 (分类: ${category})`);
    }

    setNewItem('');
  };

  const handleBulkOrganize = async () => {
    if (!newItem.trim()) return;
    setIsProcessing(true);
    setGlobalMessage("AI 智能整理程序启动...");
    
    try {
        const organizedTitles = await organizeBulkTitles(newItem);
        const newItems: LibraryItem[] = organizedTitles.map(t => ({
            id: Math.random().toString(36).substr(2, 9),
            content: t
        }));
        
        setState(prev => ({
            ...prev,
            titles: [...prev.titles, ...newItems]
        }));
        setNewItem('');
        setGlobalMessage(`AI 导入完成: 新增 ${newItems.length} 条数据`);
    } catch (e: any) {
        setGlobalMessage(`整理中断: ${e.message || '处理失败'}`);
    } finally {
        setIsProcessing(false);
    }
  };

  const deleteItem = (key: 'titles' | 'templates' | 'images' | 'endings', id: string) => {
    setState(prev => ({
        ...prev,
        [key]: prev[key].filter(i => i.id !== id)
    }));
  };

  // --- Batch Selection Logic ---
  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const executeBatchMove = () => {
      if (!batchTargetCategory || selectedIds.size === 0) return;
      
      setState(prev => ({
          ...prev,
          images: prev.images.map(img => 
              selectedIds.has(img.id) ? { ...img, category: batchTargetCategory } : img
          )
      }));
      setGlobalMessage(`已将 ${selectedIds.size} 张图片关联至: ${state.templates.find(t=>t.id===batchTargetCategory)?.category || '通用'}`);
      setSelectedIds(new Set());
      setBatchTargetCategory('');
  };

  const executeBatchDelete = () => {
      if (selectedIds.size === 0) return;
      setState(prev => ({
          ...prev,
          images: prev.images.filter(img => !selectedIds.has(img.id))
      }));
      setGlobalMessage(`已批量删除 ${selectedIds.size} 张图片`);
      setSelectedIds(new Set());
  };

  // --- Export All Images ---
  const exportAllImages = () => {
      if (state.images.length === 0) {
          setGlobalMessage("图片库当前为空，无法导出。");
          return;
      }
      // 导出格式：URL<TAB>CATEGORY（如果没有分类则留空），一行一条，便于后续批量处理
      const allUrls = state.images
        .map(img => `${img.content}\t${img.category || ''}`)
        .join('\n');
      try {
          navigator.clipboard.writeText(allUrls);
          setGlobalMessage(`已复制 ${state.images.length} 条图片 URL + 关联模板信息到剪贴板。`);
      } catch {
          // 兼容不支持 Clipboard 的环境：回填到输入框，方便手动复制
          setNewItem(allUrls);
          setGlobalMessage("浏览器不支持一键复制，已将所有图片 URL + 关联模板信息写入输入框，请手动复制。");
      }
  };

  // --- Export Selected Images ---
  const exportSelectedImages = (includeCategory: boolean) => {
      if (selectedIds.size === 0) {
          setGlobalMessage("请先勾选需要导出的图片。");
          return;
      }
      const selectedImages = state.images.filter(img => selectedIds.has(img.id));
      if (selectedImages.length === 0) {
          setGlobalMessage("当前选择为空或被过滤掉，无法导出。");
          return;
      }
      const text = selectedImages
        .map(img => includeCategory ? `${img.content}\t${img.category || ''}` : img.content)
        .join('\n');
      try {
          navigator.clipboard.writeText(text);
          setGlobalMessage(`已复制 ${selectedImages.length} 条选中图片的 URL${includeCategory ? '（含关联模板信息）' : ''}到剪贴板。`);
      } catch {
          setNewItem(text);
          setGlobalMessage("浏览器不支持一键复制，已将选中图片的导出结果写入输入框，请手动复制。");
      }
  };

  // --- Edit Logic ---
  const openEditModal = (item: LibraryItem) => {
      setEditingItem(item);
      setEditContent(item.content);
      setEditCategory(item.category || '');
  };

  const saveEdit = () => {
      if (!editingItem) return;
      if (!editContent.trim()) {
          setGlobalMessage("内容不能为空");
          return;
      }

      setState(prev => ({
          ...prev,
          [activeTab]: prev[activeTab].map(item => 
              item.id === editingItem.id 
                  ? { ...item, content: editContent, category: editCategory || item.category } 
                  : item
          )
      }));
      
      setEditingItem(null);
      setGlobalMessage("项目更新成功");
  };

  const clearAllTitles = () => {
      setDeletedTitlesBackup(state.titles);
      setState(prev => ({ ...prev, titles: [] }));
      setGlobalMessage("数据库已清空");
  };

  const undoClearTitles = () => {
      if (deletedTitlesBackup) {
          setState(prev => ({ ...prev, titles: deletedTitlesBackup }));
          setDeletedTitlesBackup(null);
          setGlobalMessage("数据恢复完毕");
      }
  };

  const handleImageFilterChange = (val: string) => {
      setImageFilterMode(val);
      if (val !== 'ALL') {
          setNewCategory(val);
      } else {
          setNewCategory('');
      }
  };

  const handleTabChange = (tab: typeof activeTab) => {
      setActiveTab(tab);
      setNewCategory('');
  };

  const getVisibleItems = () => {
      if (activeTab === 'images' && imageFilterMode !== 'ALL') {
          return state.images.filter(i => i.category === imageFilterMode);
      }
      return state[activeTab];
  };

  const visibleItems = getVisibleItems();

  const TabButton = ({ id, label, icon: Icon, count }: { id: typeof activeTab, label: string, icon: any, count: number }) => (
      <button 
        onClick={() => handleTabChange(id)}
        className={`w-full text-left px-5 py-4 flex items-center justify-between group transition-all duration-200 relative overflow-hidden ${activeTab === id ? `${ts.accentBg} ${ts.accentText} shadow-md` : `${ts.textMuted} hover:bg-black/5`}`}
      >
          <div className="flex items-center space-x-3 z-10">
              <Icon className={`w-4 h-4 ${activeTab === id ? 'text-current' : 'opacity-50 group-hover:opacity-100'}`} />
              <span className={`text-sm font-bold tracking-widest ${activeTab === id ? 'text-current' : ''}`}>{label}</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded z-10 ${activeTab === id ? 'bg-white/20 text-current' : 'bg-black/10 opacity-50'}`}>{count}</span>
          {activeTab === id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-white"></div>}
      </button>
  );

  const getPlaceholder = () => {
      switch(activeTab) {
          case 'titles': return "在此粘贴标题 (支持批量粘贴，自动换行)...";
          case 'images': return "输入图片 URL 地址 (支持批量粘贴，每行一个)...";
          case 'templates': return "粘贴 HTML 模板代码...";
          default: return "在此输入文本内容...";
      }
  };

  return (
    <div className="flex h-full gap-8 animate-in fade-in zoom-in-95 duration-300 relative">
      
      {/* Sidebar Navigation */}
      <div className={`w-72 flex-none border flex flex-col h-full shadow-sm relative z-10 transition-colors duration-500 ${ts.panelBg} ${ts.panelBorder}`}>
        <div className={`p-6 border-b ${ts.panelBorder} bg-black/5`}>
            <div className={`flex items-center space-x-2 ${ts.textMuted} mb-1`}>
                <Database className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Data Management</span>
            </div>
            <h2 className={`text-2xl font-black ${ts.textMain} tracking-tight`}>素材资源库</h2>
        </div>

        <div className="flex-1 py-4 space-y-1">
            <TabButton id="titles" label="标题库" icon={Type} count={state.titles.length} />
            <TabButton id="templates" label="模板库" icon={LayoutTemplate} count={state.templates.length} />
            <TabButton id="images" label="图片库" icon={ImageIcon} count={state.images.length} />
            <TabButton id="endings" label="结尾库" icon={FileText} count={state.endings.length} />
        </div>
        
        <div className={`mt-auto p-6 border-t ${ts.panelBorder} bg-black/5`}>
            <div className="flex items-center justify-between mb-2">
                 <span className={`text-[10px] font-bold ${ts.textMuted} uppercase`}>存储占用</span>
                 <span className={`text-[10px] font-mono ${ts.textMuted}`}>
                     {state.titles.length + state.templates.length + state.images.length + state.endings.length} ITEMS
                 </span>
            </div>
            <div className="w-full bg-black/10 h-1">
                <div className={`h-full w-[10%] ${ts.accentBg}`}></div>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 border shadow-sm flex flex-col overflow-hidden h-full relative z-0 transition-colors duration-500 ${ts.panelBg} ${ts.panelBorder}`}>
        
        {/* Decorative Top Bar */}
        <div className={`h-1 w-full ${ts.accentBg}`}></div>

        {/* Header Area */}
        <div className={`p-8 border-b ${ts.panelBorder} flex-none`}>
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className={`text-3xl font-black ${ts.textMain} flex items-center tracking-tighter uppercase`}>
                        {getTabLabel(activeTab)} <span className={`${ts.textMuted} opacity-50 ml-2`}>.DB</span>
                    </h2>
                    <p className={`text-xs ${ts.textMuted} font-mono tracking-widest uppercase mt-1`}>管理并配置您的生成素材</p>
                </div>
                
                {/* Image Specific: View Filter + Export */}
                {activeTab === 'images' && (
                    <div className="flex items-center space-x-3">
                    <div className={`flex items-center space-x-2 border rounded-lg px-3 py-1 ${ts.inputBg} ${ts.panelBorder}`}>
                        <Filter className={`w-3.5 h-3.5 ${ts.textMuted}`} />
                        <span className={`text-[10px] font-bold ${ts.textMuted} uppercase`}>视图过滤:</span>
                        <select 
                            value={imageFilterMode}
                            onChange={(e) => handleImageFilterChange(e.target.value)}
                            className={`bg-transparent text-xs font-bold ${ts.textMain} outline-none cursor-pointer py-1`}
                        >
                            <option value="ALL">显示全部图片 (All)</option>
                            <optgroup label="关联模板 (Linked Templates)">
                                {state.templates.map(t => (
                                    <option key={t.id} value={t.id}>{t.category} ({t.id})</option>
                                ))}
                            </optgroup>
                            <option value="Global">通用 (Global)</option>
                        </select>
                        </div>
                        <button
                            onClick={exportAllImages}
                            className={`px-3 py-1.5 text-[10px] font-bold rounded-lg border ${ts.panelBorder} ${ts.textMain} hover:bg-black/5 transition-colors`}
                        >
                            一键导出全部图片 URL
                        </button>
                    </div>
                )}

                {/* Global Actions for Tab */}
                {activeTab === 'titles' && (
                    <div className="flex space-x-2">
                        {state.titles.length > 0 ? (
                            <button onClick={clearAllTitles} className="px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors flex items-center uppercase tracking-wider">
                                <Eraser className="w-3.5 h-3.5 mr-2" /> 清空库
                            </button>
                        ) : deletedTitlesBackup && (
                            <button onClick={undoClearTitles} className={`px-4 py-2 text-xs font-bold ${ts.textMuted} ${ts.inputBg} border ${ts.panelBorder} transition-colors flex items-center shadow-sm uppercase tracking-wider hover:opacity-80`}>
                                <Undo className="w-3.5 h-3.5 mr-2" /> 撤销清空
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Input Section */}
            <div className={`flex gap-0 items-stretch border shadow-sm transition-all focus-within:ring-2 focus-within:ring-current ${ts.panelBorder} ${ts.inputBg}`}>
                
                {/* Category Input for Templates, Endings AND Images */}
                {(activeTab === 'endings' || activeTab === 'templates' || activeTab === 'images') && (
                    <div className={`border-r ${ts.panelBorder} px-3 py-3 w-48 flex items-center relative group/cat`}>
                        {activeTab === 'images' ? (
                            <select
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                className={`w-full bg-transparent text-xs font-bold ${ts.textMain} outline-none cursor-pointer appearance-none`}
                            >
                                <option value="" disabled className="text-slate-400">选择默认关联...</option>
                                <option value="Global" className="text-slate-900">通用 (Global)</option>
                                <optgroup label="模板列表" className="text-slate-900">
                                    {state.templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.category} ({t.id})</option>
                                    ))}
                                </optgroup>
                            </select>
                        ) : (
                            <input 
                                type="text" 
                                placeholder="分类标签"
                                className={`w-full bg-transparent text-xs font-bold uppercase tracking-wider focus:outline-none ${ts.textMain} placeholder-slate-400/50`}
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                            />
                        )}
                        {/* Add Chevron for select if image tab */}
                        {activeTab === 'images' && <ChevronDown className={`w-3 h-3 ${ts.textMuted} absolute right-2 pointer-events-none`}/>}
                    </div>
                )}
                
                <textarea 
                    placeholder={getPlaceholder()} 
                    className={`flex-1 p-4 text-sm focus:outline-none resize-none bg-transparent font-mono ${ts.textMain} placeholder-slate-400/50 ${(activeTab === 'titles' || activeTab === 'images') ? 'min-h-[120px]' : 'min-h-[70px]'}`}
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                    rows={1}
                />
                
                <div className={`flex flex-col border-l ${ts.panelBorder} w-16`}>
                    <button onClick={addItem} title="添加单条" className={`flex-1 hover:${ts.accentBg} hover:text-white ${ts.textMuted} transition-all flex items-center justify-center group border-b ${ts.panelBorder}`}>
                        <Plus className="w-5 h-5 group-active:scale-90 transition-transform" />
                    </button>
                    {(activeTab === 'titles' || activeTab === 'images') && (
                        <button 
                            onClick={handleFastImport} 
                            title={activeTab === 'images' ? "批量图片导入 (按行分割)" : "极速导入 (按行分割)"}
                            className={`flex-1 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-white transition-all flex items-center justify-center group border-b ${ts.panelBorder}`}
                        >
                            <Zap className="w-5 h-5 group-active:scale-90 transition-transform" />
                        </button>
                    )}
                    {activeTab === 'titles' && (
                        <button 
                            onClick={handleBulkOrganize} 
                            disabled={isProcessing}
                            className={`flex-1 bg-purple-500/10 hover:bg-purple-500 text-purple-500 hover:text-white transition-all flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed`}
                            title="AI 智能整理 (自动修复格式)"
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5 group-active:scale-90 transition-transform" />}
                        </button>
                    )}
                </div>
            </div>
             {activeTab === 'templates' && <p className={`text-[10px] ${ts.textMuted} mt-2 font-mono ml-1`}>必需占位符: <code>{`{{OPENING}}`}</code>, <code>{`{{TIP}}`}</code>, <code>{`{{IMAGE}}`}</code></p>}
        </div>

        {/* Scrollable List Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-black/5 relative">
            
            {/* Batch Action Bar (Floating at Bottom) */}
            {activeTab === 'images' && selectedIds.size > 0 && (
                <div className={`fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center space-x-4 border animate-in slide-in-from-bottom-4 fade-in duration-300 backdrop-blur-md ${ts.panelBg} ${ts.panelBorder}`}>
                    <div className={`font-bold text-sm whitespace-nowrap ${ts.textMain}`}>已选 {selectedIds.size} 项</div>
                    <div className="h-6 w-px bg-slate-300/30 mx-2"></div>
                    
                    {/* Batch Move */}
                    <div className="flex items-center space-x-2">
                        <ArrowRightLeft className={`w-4 h-4 ${ts.textMuted}`} />
                        <select 
                            className={`text-xs border rounded p-1.5 font-bold outline-none w-32 cursor-pointer ${ts.inputBg} ${ts.textMain} ${ts.panelBorder}`}
                            value={batchTargetCategory}
                            onChange={(e) => setBatchTargetCategory(e.target.value)}
                        >
                            <option value="">批量关联至...</option>
                            <option value="Global">通用 (Global)</option>
                            {state.templates.map(t => <option key={t.id} value={t.id}>{t.category}</option>)}
                        </select>
                        <button 
                            onClick={executeBatchMove}
                            disabled={!batchTargetCategory}
                            className={`px-3 py-1.5 text-xs font-bold text-white rounded shadow-sm disabled:opacity-50 transition-colors ${ts.accentBg} hover:opacity-90`}
                        >
                            应用
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-300/30 mx-2"></div>

                    {/* Export Selected */}
                    <div className="flex items-center space-x-2">
                        <button 
                            onClick={() => exportSelectedImages(false)}
                            className="px-3 py-1.5 text-xs font-bold rounded border border-slate-300/60 text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                            导出选中 URL
                        </button>
                        <button 
                            onClick={() => exportSelectedImages(true)}
                            className="px-3 py-1.5 text-xs font-bold rounded border border-emerald-500/70 text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                            导出选中 URL+模板
                        </button>
                    </div>

                    <div className="h-6 w-px bg-slate-300/30 mx-2"></div>

                    {/* Batch Delete */}
                    <button 
                        onClick={executeBatchDelete}
                        className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors flex items-center"
                    >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> 删除
                    </button>

                    {/* Clear */}
                    <button onClick={() => setSelectedIds(new Set())} className={`ml-2 ${ts.textMuted} hover:text-red-500 transition-colors rounded-full p-1`}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {visibleItems.length === 0 && (
                <div className={`h-full flex flex-col items-center justify-center ${ts.textMuted} space-y-6 opacity-50`}>
                    <FolderOpen className="w-16 h-16" />
                    <p className="text-sm font-bold tracking-widest uppercase">暂无数据记录</p>
                    {activeTab === 'images' && imageFilterMode !== 'ALL' && <p className="text-xs">当前过滤器下无图片</p>}
                </div>
            )}
            
            {/* Grid Layout - Optimized for Images */}
            <div className={`grid gap-4 pb-20 ${activeTab === 'images' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 xl:grid-cols-2'}`}>
                {visibleItems.map((item) => {
                    const isSelected = selectedIds.has(item.id);
                    return (
                        <div 
                            key={item.id} 
                            onClick={() => activeTab === 'images' ? toggleSelection(item.id) : null}
                            className={`flex items-start p-4 border transition-all duration-200 relative overflow-hidden ${activeTab === 'images' ? 'cursor-pointer' : ''} ${isSelected ? `${ts.inputBg} border-blue-400 ring-1 ring-blue-400` : `${ts.panelBg} ${ts.panelBorder} hover:border-current hover:shadow-md group`}`}
                        >
                            {/* Checkbox for Images */}
                            {activeTab === 'images' && (
                                <div className={`mr-3 mt-1 flex-none transition-colors ${isSelected ? 'text-blue-500' : 'text-slate-300 hover:text-blue-400'}`}>
                                    {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </div>
                            )}

                            {/* ID Badge */}
                            <div className={`absolute top-0 right-0 ${ts.inputBg} text-[9px] font-mono ${ts.textMuted} px-2 py-0.5 border-b border-l ${ts.panelBorder}`}>
                                {item.id}
                            </div>

                            <div className="flex-none mt-1 mr-4">
                                {activeTab === 'titles' && <Type className={`w-5 h-5 ${ts.textMuted}`} />}
                                {activeTab === 'templates' && <LayoutTemplate className={`w-5 h-5 ${ts.textMuted}`} />}
                                {activeTab === 'images' && <ImageIcon className={`w-5 h-5 ${ts.textMuted}`} />}
                                {activeTab === 'endings' && <FileText className={`w-5 h-5 ${ts.textMuted}`} />}
                            </div>
                            
                            <div className="flex-1 min-w-0 pr-16">
                                {item.category && (
                                    <span className={`inline-block px-2 py-0.5 mb-2 text-[9px] font-bold uppercase tracking-wider text-white ${activeTab === 'images' && item.category === 'Global' ? 'bg-slate-500' : ts.accentBg}`}>
                                        {item.category}
                                    </span>
                                )}
                                
                                {activeTab === 'images' ? (
                                    <div className="flex items-center space-x-3">
                                        <div className={`h-16 w-16 border p-0.5 flex-none ${ts.inputBg} ${ts.panelBorder}`}>
                                            <ImageThumbnail src={item.content} themeStyle={ts} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={`text-[10px] ${ts.textMuted} font-mono truncate block mb-1`} title={item.content}>{item.content}</span>
                                            {/* Helper to verify matching */}
                                            <div className="flex items-center space-x-1">
                                                 {state.templates.find(t => t.id === item.category) && <span className="text-[9px] text-green-500 flex items-center"><Check className="w-3 h-3 mr-0.5"/> 匹配模板</span>}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`text-sm ${ts.textMain} font-medium leading-relaxed break-all font-sans line-clamp-4`} title={item.content}>
                                        {item.content}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons (Hidden when selecting to prevent conflict) */}
                            {!selectedIds.size && (
                                <div className="absolute bottom-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); openEditModal(item); }} 
                                        className={`p-1.5 ${ts.textMuted} hover:text-white hover:${ts.accentBg} rounded-sm transition-all`}
                                        title="编辑项目"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); deleteItem(activeTab, item.id); }} 
                                        className="p-1.5 text-slate-400 hover:text-white hover:bg-red-500 rounded-sm transition-all"
                                        title="删除项目"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* Subtle Watermark */}
      <div
        className="pointer-events-none select-none absolute bottom-6 left-1/2 -translate-x-1/2 opacity-30 text-[10px] tracking-[0.35em] uppercase"
      >
        <span className={`inline-flex items-center px-3 py-1 rounded-full border border-dashed ${ts.panelBorder} ${ts.textMuted} bg-white/40 backdrop-blur-sm`}>
          <span className="w-1 h-1 rounded-full mr-2 bg-current opacity-60" />
          by&nbsp;Xiaolong
        </span>
      </div>

      {/* Edit Modal Overlay */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingItem(null)}></div>
            <div className={`rounded-xl shadow-2xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 border ${ts.panelBg} ${ts.panelBorder}`}>
                <div className={`p-6 border-b flex justify-between items-center bg-black/5 ${ts.panelBorder}`}>
                    <div>
                        <h3 className={`text-lg font-black uppercase flex items-center ${ts.textMain}`}>
                            <Pencil className="w-4 h-4 mr-2 opacity-70" /> 编辑项目
                        </h3>
                        <p className={`text-[10px] ${ts.textMuted} font-mono mt-1`}>ID: {editingItem.id}</p>
                    </div>
                    <button onClick={() => setEditingItem(null)} className={`${ts.textMuted} hover:opacity-100`}>
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                    {/* Category Input (Conditional) */}
                    {(activeTab === 'templates' || activeTab === 'endings' || activeTab === 'images') && (
                        <div className="space-y-1">
                            <label className={`text-[10px] font-bold ${ts.textMuted} uppercase tracking-widest`}>
                                {activeTab === 'images' ? '关联模板 (严选)' : '分类标签'}
                            </label>
                            
                            {activeTab === 'images' ? (
                                <div className="relative">
                                    <select 
                                        value={editCategory}
                                        onChange={(e) => setEditCategory(e.target.value)}
                                        className={`w-full p-3 border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-current appearance-none cursor-pointer ${ts.inputBg} ${ts.panelBorder} ${ts.textMain}`}
                                    >
                                        <option value="Global" className="text-black">通用 (Global)</option>
                                        {state.templates.map(t => <option key={t.id} value={t.id} className="text-black">{t.category} ({t.id})</option>)}
                                    </select>
                                    <ChevronDown className={`w-4 h-4 ${ts.textMuted} absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none`}/>
                                </div>
                            ) : (
                                <input 
                                    type="text" 
                                    value={editCategory}
                                    onChange={(e) => setEditCategory(e.target.value)}
                                    className={`w-full p-3 border rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-current ${ts.inputBg} ${ts.panelBorder} ${ts.textMain}`}
                                />
                            )}
                        </div>
                    )}

                    <div className="space-y-1 h-full flex flex-col">
                        <label className={`text-[10px] font-bold ${ts.textMuted} uppercase tracking-widest`}>内容详情</label>
                        <textarea 
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className={`w-full flex-1 min-h-[200px] p-4 border rounded-lg text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-current resize-none ${ts.inputBg} ${ts.panelBorder} ${ts.textMain}`}
                        />
                    </div>
                </div>

                <div className={`p-6 border-t ${ts.panelBorder} bg-black/5 flex justify-end space-x-3`}>
                    <button 
                        onClick={() => setEditingItem(null)}
                        className={`px-5 py-2.5 text-xs font-bold rounded-lg transition-colors uppercase ${ts.textMuted} hover:bg-black/10`}
                    >
                        取消
                    </button>
                    <button 
                        onClick={saveEdit}
                        className={`px-5 py-2.5 text-white text-xs font-bold rounded-lg shadow-lg transition-all flex items-center uppercase ${ts.accentBg} hover:opacity-90`}
                    >
                        <Save className="w-3.5 h-3.5 mr-2" /> 保存更改
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};