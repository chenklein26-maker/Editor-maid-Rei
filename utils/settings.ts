const SETTINGS_KEY = 'maid_rei_api_settings';

export interface ApiSettings {
  apiKey: string;
  apiUrl: string;
  model: string;
}

const DEFAULT_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-chat';

export const DEFAULT_API_SETTINGS: ApiSettings = {
  apiKey: '',
  apiUrl: DEFAULT_API_URL,
  model: DEFAULT_MODEL
};

export function getApiSettings(): ApiSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        apiKey: parsed.apiKey ?? '',
        apiUrl: parsed.apiUrl || DEFAULT_API_URL,
        model: parsed.model || DEFAULT_MODEL
      };
    }
  } catch (e) {
    console.warn('Failed to parse API settings:', e);
  }
  return { ...DEFAULT_API_SETTINGS };
}

export function saveApiSettings(settings: Partial<ApiSettings>): void {
  const current = getApiSettings();
  const merged = { ...current, ...settings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
}

export const AVAILABLE_MODELS = [
  { id: 'deepseek-chat', label: 'DeepSeek Chat', desc: '通用对话模型' },
  { id: 'deepseek-reasoner', label: 'DeepSeek R1', desc: '推理增强模型' },
  { id: 'deepseek-coder', label: 'DeepSeek Coder', desc: '代码优化模型' }
] as const;
