import React, { useState, useEffect } from 'react';
import { getApiSettings, saveApiSettings, AVAILABLE_MODELS, DEFAULT_API_SETTINGS } from '../../utils/settings';
import { UIThemeStyle } from '../../types';
import { Settings as SettingsIcon, Key, Cpu, Link, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

interface SettingsProps {
  setGlobalMessage: (msg: string) => void;
  themeStyle: UIThemeStyle;
}

export function Settings({ setGlobalMessage, themeStyle: ts }: SettingsProps) {
  const [apiKey, setApiKey] = useState('');
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_SETTINGS.apiUrl);
  const [model, setModel] = useState(DEFAULT_API_SETTINGS.model);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getApiSettings();
    setApiKey(s.apiKey);
    setApiUrl(s.apiUrl || DEFAULT_API_SETTINGS.apiUrl);
    setModel(s.model || DEFAULT_API_SETTINGS.model);
  }, []);

  const handleSave = () => {
    saveApiSettings({ apiKey: apiKey.trim(), apiUrl: apiUrl.trim() || undefined, model });
    setGlobalMessage(apiKey.trim() ? 'API 配置已保存' : '已清除 API Key');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const hasKey = !!apiKey.trim();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className={`flex-none border-b px-6 py-4 ${ts.panelBorder}`}>
        <h2 className={`text-xl font-bold flex items-center gap-2 ${ts.textMain}`}>
          <SettingsIcon className="w-5 h-5" />
          设置 / Settings
        </h2>
        <p className={`text-sm mt-1 ${ts.textMuted}`}>
          配置 AI 模型的 API Key 与模型选择，仅保存在本地浏览器，不会上传。
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* API Key */}
        <div className={`rounded-lg border p-5 ${ts.panelBg} ${ts.panelBorder}`}>
          <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${ts.textMain}`}>
            <Key className="w-4 h-4" />
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-xxxxxxxxxxxxxxxx"
              className={`w-full px-4 py-3 rounded border ${ts.inputBg} ${ts.panelBorder} ${ts.textMain} placeholder:${ts.textMuted} focus:outline-none focus:ring-2 focus:ring-offset-1`}
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded ${ts.textMuted} hover:${ts.textMain}`}
              title={showKey ? '隐藏' : '显示'}
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className={`text-xs mt-2 ${ts.textMuted}`}>
            从 <a href="https://platform.deepseek.com" target="_blank" rel="noopener noreferrer" className="underline">DeepSeek 开放平台</a> 获取，支持 OpenAI 兼容格式的 Key。
          </p>
        </div>

        {/* Model Selection */}
        <div className={`rounded-lg border p-5 ${ts.panelBg} ${ts.panelBorder}`}>
          <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${ts.textMain}`}>
            <Cpu className="w-4 h-4" />
            模型选择
          </label>
          <div className="space-y-4">
            <div className="grid gap-2">
              {AVAILABLE_MODELS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`flex items-center gap-3 p-3 rounded border text-left cursor-pointer transition-colors ${
                    model === m.id ? `${ts.accentBg} ${ts.accentText} border-transparent` : `${ts.inputBg} ${ts.panelBorder}`
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{m.label}</span>
                    <span className={`text-xs opacity-80 ${model === m.id ? '' : ts.textMuted}`}>{m.desc}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-dashed opacity-80" />

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-sm font-semibold ${ts.textMain}`}>自定义模型</span>
                <span className={`text-xs ${ts.textMuted}`}>支持填写任意模型名称，优先使用此值</span>
              </div>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="例如：deepseek-chat, gpt-4.1, 自己网关里的模型名"
                className={`w-full px-4 py-2.5 rounded border text-sm ${ts.inputBg} ${ts.panelBorder} ${ts.textMain} placeholder:${ts.textMuted} focus:outline-none focus:ring-2 focus:ring-offset-1`}
              />
            </div>
          </div>
        </div>

        {/* API URL (Advanced) */}
        <div className={`rounded-lg border p-5 ${ts.panelBg} ${ts.panelBorder}`}>
          <label className={`flex items-center gap-2 text-sm font-semibold mb-3 ${ts.textMain}`}>
            <Link className="w-4 h-4" />
            API 端点 <span className="text-xs font-normal opacity-70">(可选)</span>
          </label>
          <input
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="https://api.deepseek.com/v1/chat/completions"
            className={`w-full px-4 py-3 rounded border text-sm ${ts.inputBg} ${ts.panelBorder} ${ts.textMain} placeholder:${ts.textMuted} focus:outline-none focus:ring-2 focus:ring-offset-1`}
          />
        </div>

        {/* Status & Save */}
        <div className="flex items-center justify-between pt-2">
          <div className={`flex items-center gap-2 text-sm ${hasKey ? 'text-green-600' : ts.textMuted}`}>
            {hasKey ? (
              <>
                <Check className="w-4 h-4" />
                API Key 已配置
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                未配置 API Key，AI 功能将不可用
              </>
            )}
          </div>
          <button
            onClick={handleSave}
            className={`px-6 py-2 rounded font-semibold transition-all ${ts.accentBg} ${ts.accentText} hover:opacity-90 ${saved ? 'ring-2 ring-green-400' : ''}`}
          >
            {saved ? '已保存 ✓' : '保存配置'}
          </button>
        </div>
      </div>
    </div>
  );
}
