import React, { useState } from 'react';
import { AppState, JobData, WorkflowStep, UIThemeStyle } from '../../types';
import { generateOpenings, generateTips } from '../../services/aiService';
import { ArrowRight, Play, RotateCw, Copy, Trash2, LayoutTemplate, CheckCircle2, Loader2, Cpu, Zap, Layers, AlertCircle, Undo, MoreHorizontal, Layout, FileCode, Sparkles, Image as ImageIcon, ToggleLeft, ToggleRight, Plus, Minus, ListOrdered } from 'lucide-react';

interface WorkflowBoardProps {
  appState: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  setGlobalMessage: (msg: string) => void;
  themeStyle: UIThemeStyle;
}

export const WorkflowBoard: React.FC<WorkflowBoardProps> = ({ appState, setState, setGlobalMessage, themeStyle: ts }) => {
  const jobs = appState.jobs;
  const [deletedJobsBackup, setDeletedJobsBackup] = useState<JobData[] | null>(null);
  const [createCount, setCreateCount] = useState(5);

  const handleCreateJobs = () => {
    const count = Math.max(1, Math.min(20, createCount)); // Safety cap at 20
    const defaultTemplate = appState.templates.find(t => t.id.includes('moyu')) || appState.templates[0];
    
    const newJobs: JobData[] = Array.from({ length: count }).map(() => ({
        id: Math.random().toString(36).substr(2, 9),
        targetTitle: '',
        selectedTemplateId: defaultTemplate?.id || null,
        autoImage: true, // Default to true
        selectedOpening: null,
        selectedTip: null,
        selectedImage: null,
        contentBody: '',
        step: WorkflowStep.IDLE,
        error: null,
        log: ['作业初始化完成 / Job Initialized'],
        copied: false
    }));

    setState(prev => ({ ...prev, jobs: [...newJobs, ...prev.jobs] }));
    setGlobalMessage(count > 1 ? `批量创建指令完成：新增 ${count} 个任务。` : "新任务档案已建立。");
  };

  const updateJob = (id: string, updates: Partial<JobData>) => {
    setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => j.id === id ? { ...j, ...updates } : j)
    }));
  };

  const removeJob = (id: string) => {
    setState(prev => ({
        ...prev,
        jobs: prev.jobs.filter(j => j.id !== id)
    }));
  };

  const clearAllJobs = () => {
    if (jobs.length === 0) return;
    setDeletedJobsBackup(jobs);
    setState(prev => ({ ...prev, jobs: [] }));
    setGlobalMessage("工作流已清空。");
  };

  const undoClearJobs = () => {
    if (deletedJobsBackup) {
        setState(prev => ({ ...prev, jobs: deletedJobsBackup }));
        setDeletedJobsBackup(null);
        setGlobalMessage("数据恢复成功。");
    }
  };

  const fillTitlesSequential = () => {
    if (jobs.length === 0) {
        setGlobalMessage("无任务可填充。");
        return;
    }
    if (appState.titles.length === 0) {
        setGlobalMessage("标题库为空，无法填充。");
        return;
    }

    let assignedCount = 0;
    setState(prev => {
        const titles = prev.titles;
        if (titles.length === 0) return prev;
        let idx = 0;
        const updatedJobs = prev.jobs.map(j => {
            if (j.step !== WorkflowStep.IDLE) return j; // 仅填充待机任务
            if (idx >= titles.length) return j;
            const filled = { ...j, targetTitle: titles[idx].content };
            idx += 1;
            assignedCount += 1;
            return filled;
        });
        return { ...prev, jobs: updatedJobs };
    });

    if (assignedCount > 0) {
        setGlobalMessage(`已顺序填充 ${assignedCount} 个任务标题。`);
    } else {
        setGlobalMessage("没有可填充的任务（可能都在处理中或已完成）。");
    }
  };

  const runAllIdleJobs = () => {
    const runnable = jobs.filter(j => j.step === WorkflowStep.IDLE && j.targetTitle);
    if (runnable.length === 0) {
        setGlobalMessage("没有可执行的待机任务（或缺少标题）。");
        return;
    }
    setGlobalMessage(`批量执行 ${runnable.length} 个任务...`);
    runnable.forEach(job => runAutomation(job));
  };

  const batchSetTemplate = (templateId: string) => {
    if (!templateId) return;
    if (jobs.length === 0) {
        setGlobalMessage("无活动任务。");
        return;
    }
    const tmplName = appState.templates.find(t => t.id === templateId)?.category || templateId;
    setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => ({ ...j, selectedTemplateId: templateId }))
    }));
    setGlobalMessage(`批量指令执行: 模板设置为 [${tmplName}]`);
  };

  const runAutomation = async (job: JobData) => {
    if (!job.targetTitle) {
        setGlobalMessage("错误: 缺少目标标题。");
        return;
    }
    const template = appState.templates.find(t => t.id === job.selectedTemplateId);
    if (!template) {
        setGlobalMessage("错误: 模板配置无效。");
        return;
    }
    
    updateJob(job.id, { step: WorkflowStep.PROCESSING, log: [...job.log, `锁定标题: ${job.targetTitle}`, '执行 AI 生成序列...'], copied: false });
    setGlobalMessage("AI 核心介入中...");

    try {
        const openingPromptToUse = (template.customOpeningPrompt && template.customOpeningPrompt.trim() !== '') 
            ? template.customOpeningPrompt 
            : appState.prompts.openingPrompt;

        const tipPromptToUse = (template.customTipPrompt && template.customTipPrompt.trim() !== '')
            ? template.customTipPrompt
            : appState.prompts.tipPrompt;

        // Execute AI tasks in parallel (will retry automatically on 429)
        const [openings, tips] = await Promise.all([
            generateOpenings(job.targetTitle, openingPromptToUse),
            generateTips(job.targetTitle, tipPromptToUse)
        ]);

        if (openings.length === 0 || tips.length === 0) throw new Error("AI 生成的内容为空，可能是过滤机制导致。");

        const selectedOpening = openings[Math.floor(Math.random() * openings.length)];
        const selectedTip = tips[Math.floor(Math.random() * tips.length)];

        let finalContent = template.content;
        finalContent = finalContent.replace('{{OPENING}}', selectedOpening);
        finalContent = finalContent.replace('{{TIP}}', selectedTip);
        finalContent = finalContent.replace(/{{TITLE}}/g, job.targetTitle);

        // --- Image Selection Logic ---
        if (job.autoImage) {
            // Collect images used by other jobs with同模板，尽量避免重复
            const usedImages = new Set(
                appState.jobs
                    .filter(j => j.id !== job.id && j.selectedTemplateId === job.selectedTemplateId && j.selectedImage)
                    .map(j => j.selectedImage as string)
            );

            let availableImages = appState.images.filter(img => img.category === job.selectedTemplateId);
            
            // Fallback: Global images
            if (availableImages.length === 0) {
                availableImages = appState.images.filter(img => 
                    !img.category || img.category.toLowerCase() === 'global' || img.category === '通用'
                );
            }

            // Prefer images not yet used by sibling jobs
            const unusedImages = availableImages.filter(img => !usedImages.has(img.content));
            const pool = unusedImages.length > 0 ? unusedImages : availableImages;

            const selectedImage = pool.length > 0
                ? pool[Math.floor(Math.random() * pool.length)].content
                : 'https://img.18183.com/uploads/allimg/251210/516-251210141128.jpg@!18183'; // Ultimate hardcoded fallback
            
            finalContent = finalContent.replace(/{{IMAGE}}/g, selectedImage);
            updateJob(job.id, {
                 selectedImage,
                 log: [...job.log, '组件生成完毕', unusedImages.length > 0 ? '图片匹配完成 (去重优先)' : '图片匹配完成 (无可用去重) ', 'HTML 封装完成']
            });
        } else {
             updateJob(job.id, {
                 selectedImage: null,
                 log: [...job.log, '组件生成完毕', '图片匹配跳过 (Original)', 'HTML 封装完成']
            });
        }

        updateJob(job.id, {
            selectedOpening,
            selectedTip,
            contentBody: finalContent,
            step: WorkflowStep.COMPLETED
        });
        setGlobalMessage("生成序列执行完毕。");

    } catch (e: any) {
        console.error(e);
        const errorMsg = e.message || "AI 响应中断";
        const isQuota = errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('配额');
        
        updateJob(job.id, { 
            step: WorkflowStep.IDLE, 
            error: errorMsg, 
            log: [...job.log, `异常中断: ${errorMsg}`] 
        });
        setGlobalMessage(isQuota ? "⚠️ 配额耗尽，请稍候再试。" : "任务执行失败，请检查连接。");
    }
  };

  const copyResult = async (job: JobData) => {
     try {
        await navigator.clipboard.writeText(job.contentBody);
        updateJob(job.id, { copied: true, log: [...job.log, '已复制到剪贴板'] });
        setGlobalMessage("HTML 代码已写入剪贴板。");
     } catch (e) {
        console.error(e);
        setGlobalMessage("复制失败，请检查浏览器权限。");
     }
  };

  // Collect titles already selected by any job (for visual cues in dropdown)
  const selectedTitles = new Set(appState.jobs.filter(j => j.targetTitle).map(j => j.targetTitle));

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-hidden">
      
      {/* Control Bar - HUD Style */}
      <div className={`flex-none p-5 rounded-sm border-l-4 border-y border-r shadow-sm flex items-center justify-between relative overflow-hidden group ${ts.panelBg} ${ts.panelBorder} ${ts.id === 'BATTLE' ? 'border-l-red-600' : 'border-l-current'}`}>
         {/* Decorative BG Element */}
         <div className={`absolute right-0 top-0 w-24 h-24 rotate-45 transform translate-x-12 -translate-y-12 z-0 opacity-10 bg-current`}></div>
         
         <div className="flex items-center space-x-6 z-10">
             <div>
                <h2 className={`text-xl font-black ${ts.textMain} tracking-tight flex items-center`}>
                    <Layers className="w-5 h-5 mr-2" />
                    操作面板 <span className={`text-[10px] font-mono font-normal ml-2 opacity-50 ${ts.textMuted}`}>OPERATION PANEL</span>
                </h2>
                <p className={`text-[10px] font-mono tracking-widest ${ts.textMuted} uppercase`}>管理您的生成任务 / TASK MANAGEMENT</p>
             </div>

             <div className="h-10 w-px bg-current opacity-20 rotate-12 mx-2"></div>

             {/* Batch Actions */}
             <div className="flex items-center space-x-3">
                <div className="relative group/select">
                    <select 
                        onChange={(e) => { batchSetTemplate(e.target.value); e.target.value = ""; }}
                        disabled={jobs.length === 0}
                        className={`border text-xs font-bold rounded-none py-2 px-4 pr-8 focus:ring-1 outline-none transition-all ${ts.inputBg} ${ts.panelBorder} ${ts.textMain} hover:opacity-80`}
                    >
                        <option value="" className="text-black">批量设置模板...</option>
                        {appState.templates.map(t => <option key={t.id} value={t.id} className="text-black">{t.category || t.id}</option>)}
                    </select>
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-current opacity-0 group-hover/select:opacity-100 transition-opacity"></div>
                </div>

                <button 
                  onClick={fillTitlesSequential}
                  disabled={jobs.length === 0 || appState.titles.length === 0}
                  className={`flex items-center px-4 py-2 text-xs font-bold rounded-none border ${ts.panelBorder} ${ts.textMain} hover:opacity-80 transition-colors uppercase tracking-wider disabled:opacity-40`}
                >
                  <ListOrdered className="w-4 h-4 mr-2" /> 顺序填充标题
                </button>

                <button 
                  onClick={runAllIdleJobs}
                  disabled={jobs.length === 0}
                  className={`flex items-center px-4 py-2 text-xs font-bold rounded-none border ${ts.panelBorder} ${ts.accentBg} ${ts.accentText} hover:brightness-110 transition-colors uppercase tracking-wider disabled:opacity-40`}
                >
                  <Play className="w-4 h-4 mr-2" /> 一键执行全部
                </button>

                {deletedJobsBackup && jobs.length === 0 ? (
                    <button onClick={undoClearJobs} className={`flex items-center px-4 py-2 text-xs font-bold ${ts.textMuted} ${ts.inputBg} hover:opacity-80 transition-colors uppercase tracking-wider`}>
                        <Undo className="w-3.5 h-3.5 mr-2" /> 撤销 (Undo)
                    </button>
                ) : (
                    <button onClick={clearAllJobs} disabled={jobs.length === 0} className="flex items-center px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50 uppercase tracking-wider">
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> 清空全部
                    </button>
                )}
             </div>
         </div>
         
         {/* Right Action Group */}
         <div className="flex items-center space-x-4 z-10">
            {/* Counter */}
            <div className={`hidden sm:flex items-center h-12 rounded-lg border bg-white/5 backdrop-blur-sm ${ts.panelBorder}`}>
                <button onClick={() => setCreateCount(Math.max(1, createCount - 1))} className={`h-full px-3 hover:bg-black/10 transition-colors ${ts.textMuted}`}>
                    <Minus className="w-3 h-3" />
                </button>
                <div className={`w-8 text-center text-sm font-black ${ts.textMain}`}>{createCount}</div>
                <button onClick={() => setCreateCount(Math.min(20, createCount + 1))} className={`h-full px-3 hover:bg-black/10 transition-colors ${ts.textMuted}`}>
                    <Plus className="w-3 h-3" />
                </button>
            </div>

            {/* Create Button (fixed width to prevent layout shift when count changes) */}
            <button 
              onClick={handleCreateJobs} 
              className={`text-white pl-6 pr-8 py-3 clip-path-polygon shadow-xl shadow-current/20 transition-all flex items-center space-x-3 group/btn ${ts.accentBg} hover:brightness-110 min-w-[180px]`}
            >
                <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center group-hover/btn:rotate-90 transition-transform duration-500">
                    <Play className="w-3 h-3 fill-current" />
                </div>
                <div className="text-left w-[120px]">
                    <div className="text-[10px] uppercase tracking-widest opacity-70 leading-none mb-0.5 truncate">
                        {createCount > 1 ? `Batch Add (${createCount})` : 'New Task'}
                    </div>
                    <div className="text-sm font-black tracking-wide leading-none truncate">
                        {createCount > 1 ? '批量创建' : '创建作业'}
                    </div>
                </div>
            </button>
         </div>
      </div>

      {/* Kanban Grid */}
      <div className="flex-1 overflow-y-auto pr-2 pb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {jobs.length === 0 && (
                <div className={`col-span-full h-[60vh] flex flex-col items-center justify-center border backdrop-blur-sm relative overflow-hidden ${ts.textMuted} ${ts.panelBorder} ${ts.panelBg}`}>
                    <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className={`w-24 h-24 border-2 rounded-full flex items-center justify-center mb-6 animate-pulse-slow ${ts.panelBorder}`}>
                            <Layers className="w-10 h-10 opacity-50" />
                        </div>
                        <h3 className="text-2xl font-thin tracking-[0.2em] opacity-80 mb-2">SYSTEM IDLE</h3>
                        <p className={`text-xs font-mono tracking-widest border-t pt-2 opacity-50 ${ts.panelBorder}`}>系统待机中...</p>
                    </div>
                </div>
            )}

            {jobs.map((job, index) => (
                <div key={job.id} className={`border shadow-sm hover:shadow-xl hover:border-current transition-all duration-300 flex flex-col h-[580px] relative group overflow-hidden ${ts.panelBg} ${ts.panelBorder}`}>
                    
                    {/* Decorative Corner Cut */}
                    <div className={`absolute top-0 right-0 w-8 h-8 border-b border-l ${ts.panelBorder} ${ts.inputBg}`}></div>

                    {/* Header */}
                    <div className={`px-5 py-4 border-b flex justify-between items-start relative ${ts.panelBorder} bg-black/5`}>
                        <div className={`absolute left-0 top-4 w-1 h-8 ${ts.textMain.includes('white') ? 'bg-white' : 'bg-slate-800'}`}></div>
                        <div className="pl-2">
                            <div className={`text-[10px] font-mono ${ts.textMuted} tracking-widest uppercase mb-1`}>任务编号 (No.{String(index + 1).padStart(3, '0')})</div>
                            <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-sm transform rotate-45 ${job.step === WorkflowStep.PROCESSING ? 'bg-amber-400 animate-pulse' : job.step === WorkflowStep.COMPLETED ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                <span className={`text-xs font-black uppercase tracking-wider ${job.step === WorkflowStep.COMPLETED ? 'text-green-500' : ts.textMuted}`}>
                                    {job.step === WorkflowStep.IDLE ? '待机' : job.step === WorkflowStep.PROCESSING ? '生成中' : '完成'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2 z-10">
                            {job.copied && (
                                <span className="flex items-center text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/50 bg-emerald-500/10 text-emerald-600">
                                    <CheckCircle2 className="w-3 h-3 mr-1" /> 已复制
                                </span>
                            )}
                            <button onClick={() => removeJob(job.id)} className={`${ts.textMuted} hover:text-red-500 transition-colors`}><Trash2 className="w-4 h-4"/></button>
                        </div>
                    </div>

                    <div className="p-5 flex flex-col space-y-6 flex-1 overflow-hidden relative">
                        
                        {/* IDLE STATE */}
                        {job.step === WorkflowStep.IDLE && (
                            <div className="flex flex-col gap-6 h-full animate-in fade-in">
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold ${ts.textMuted} uppercase tracking-widest flex items-center border-b ${ts.panelBorder} pb-1`}>
                                        <Layout className="w-3 h-3 mr-2"/> 目标选择
                                    </label>
                                    <select 
                                        value={job.targetTitle} 
                                        onChange={(e) => updateJob(job.id, { targetTitle: e.target.value })}
                                        className={`w-full p-3 border text-sm font-medium focus:ring-1 focus:ring-current outline-none transition-all rounded-none ${ts.inputBg} ${ts.panelBorder} ${ts.textMain}`}
                                    >
                                        <option value="" className="text-black">-- 选择目标标题 --</option>
                                        {appState.titles.map(t => {
                                            const isPicked = selectedTitles.has(t.content);
                                            return (
                                              <option 
                                                key={t.id} 
                                                value={t.content} 
                                                className="text-black"
                                              >
                                                {t.content}{isPicked ? ' ✓已选' : ''}
                                              </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-bold ${ts.textMuted} uppercase tracking-widest flex items-center border-b ${ts.panelBorder} pb-1`}>
                                        <LayoutTemplate className="w-3 h-3 mr-2"/> 模板协议
                                    </label>
                                    <select 
                                        value={job.selectedTemplateId || ''} 
                                        onChange={(e) => updateJob(job.id, { selectedTemplateId: e.target.value })}
                                        className={`w-full p-3 border text-sm font-medium focus:ring-1 focus:ring-current outline-none transition-all rounded-none ${ts.inputBg} ${ts.panelBorder} ${ts.textMain}`}
                                    >
                                        {appState.templates.map(t => (
                                            <option key={t.id} value={t.id} className="text-black">{t.category} - {t.id}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* New Auto Image Toggle */}
                                <div className="space-y-2">
                                     <label className={`text-[10px] font-bold ${ts.textMuted} uppercase tracking-widest flex items-center border-b ${ts.panelBorder} pb-1 justify-between`}>
                                        <div className="flex items-center"><ImageIcon className="w-3 h-3 mr-2"/> 图片策略</div>
                                     </label>
                                     <div 
                                        className={`flex items-center justify-between p-3 border cursor-pointer transition-all ${job.autoImage ? `bg-emerald-500/10 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]` : `bg-transparent opacity-60 ${ts.panelBorder}`}`}
                                        onClick={() => updateJob(job.id, { autoImage: !job.autoImage })}
                                     >
                                         <span className={`text-xs font-bold ${job.autoImage ? 'text-emerald-500' : ts.textMain}`}>
                                             {job.autoImage ? '自动匹配模板关联图片' : '保持原模板设置'}
                                         </span>
                                         {job.autoImage ? <ToggleRight className="w-6 h-6 text-emerald-500" /> : <ToggleLeft className={`w-6 h-6 ${ts.textMuted}`} />}
                                     </div>
                                </div>
                                
                                {job.error && (
                                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-md animate-in fade-in">
                                        <div className="flex items-start space-x-2 text-red-500">
                                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                            <span className="text-[10px] font-bold leading-tight">{job.error}</span>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="mt-auto">
                                    <button 
                                        onClick={() => runAutomation(job)}
                                        disabled={!job.targetTitle}
                                        className={`w-full py-4 flex justify-center items-center space-x-2 font-black text-sm uppercase tracking-widest transition-all border ${!job.targetTitle ? 'bg-transparent cursor-not-allowed opacity-30 border-current' : `${ts.textMain} border-current hover:bg-current hover:text-black hover:-translate-y-1 shadow-sm`}`}
                                        style={{ backgroundColor: !job.targetTitle ? 'transparent' : (ts.id === 'SYSTEM' ? '#0F172A' : undefined), color: (!job.targetTitle ? undefined : (ts.id === 'SYSTEM' ? 'white' : undefined)) }}
                                    >
                                        {job.targetTitle ? (
                                            <>
                                                <Sparkles className="w-4 h-4" />
                                                <span>执行初始化</span>
                                            </>
                                        ) : (
                                            <span>等待输入</span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* PROCESSING STATE */}
                        {job.step === WorkflowStep.PROCESSING && (
                            <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in backdrop-blur-sm ${ts.panelBg}`}>
                                <div className="w-20 h-20 relative mb-6">
                                    <div className={`absolute inset-0 border-2 rounded-full animate-[spin_3s_linear_infinite] opacity-30 ${ts.panelBorder}`}></div>
                                    <div className="absolute inset-2 border-2 rounded-full animate-[spin_2s_linear_infinite_reverse] opacity-50 border-current"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Cpu className={`w-8 h-8 animate-pulse ${ts.textMain}`} />
                                    </div>
                                </div>
                                <h3 className={`text-xl font-black ${ts.textMain} tracking-tight mb-2`}>处理中</h3>
                                <div className={`w-32 h-1 rounded-full overflow-hidden mx-auto mb-2 bg-current opacity-20`}>
                                    <div className={`h-full animate-[translateX_1s_ease-in-out_infinite] w-1/2 bg-current`}></div>
                                </div>
                                <p className={`text-[10px] ${ts.textMuted} font-mono uppercase tracking-widest`}>
                                    Constructing Narrative...
                                </p>
                            </div>
                        )}

                        {/* COMPLETED STATE */}
                        {job.step === WorkflowStep.COMPLETED && (
                            <div className="flex flex-col h-full animate-in zoom-in-95 duration-300">
                                <div className="space-y-4 mb-3">
                                    <div className="group/item">
                                        <div className={`text-[9px] font-bold ${ts.textMuted} uppercase tracking-widest mb-1 flex items-center`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${ts.accentBg}`}></span> 目标
                                        </div>
                                        <p className={`text-xs leading-relaxed ${ts.textMain} font-bold line-clamp-2 border-l-2 pl-2 group-hover/item:border-current transition-colors border-transparent`}>{job.targetTitle}</p>
                                    </div>
                                    <div className="group/item">
                                        <div className={`text-[9px] font-bold ${ts.textMuted} uppercase tracking-widest mb-1 flex items-center`}>
                                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${ts.accentBg}`}></span> 摘要/开场
                                        </div>
                                        <p className={`text-[10px] leading-relaxed ${ts.textMuted} line-clamp-3 border-l-2 pl-2 group-hover/item:border-current transition-colors font-serif italic border-transparent`}>{job.selectedOpening}</p>
                                    </div>
                                </div>

                                <div className={`flex-1 border p-3 overflow-hidden relative group/code mt-2 ${ts.inputBg} ${ts.panelBorder}`}>
                                    <div className={`absolute top-0 right-0 ${ts.panelBg} ${ts.textMuted} text-[9px] px-2 py-0.5 font-bold uppercase`}>Source Code</div>
                                    <pre className={`text-[10px] font-mono ${ts.textMuted} whitespace-pre-wrap break-all h-full overflow-y-auto custom-scrollbar pt-4`}>
                                        {job.contentBody}
                                    </pre>
                                </div>

                                <button onClick={() => copyResult(job)} className={`mt-4 w-full ${ts.accentBg} ${ts.accentText} hover:brightness-125 py-3 font-bold flex items-center justify-center space-x-2 transition-all hover:-translate-y-1 shadow-md`}>
                                    <Copy className="w-4 h-4"/> <span className="text-xs uppercase tracking-widest">复制源码</span>
                                </button>
                            </div>
                        )}

                    </div>
                    
                    {/* Log Footer */}
                    {job.log.length > 0 && (
                        <div className={`px-4 py-2 border-t shrink-0 font-mono text-[9px] ${ts.textMuted} flex justify-between items-center ${ts.panelBorder} bg-black/5`}>
                            <span className="truncate max-w-[80%]">
                                <span className="mr-2 opacity-50">{'>'}</span>
                                {job.log[job.log.length - 1]}
                            </span>
                            <span className="opacity-50">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};