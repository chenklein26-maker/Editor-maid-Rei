import { getApiSettings } from '../utils/settings';

// Type declaration for environment variables (injected by Vite)
declare const process: {
  env: {
    DEEPSEEK_API_KEY?: string;
    DEEPSEEK_API_URL?: string;
    DEEPSEEK_MODEL?: string;
    API_KEY?: string;
  };
};

function getApiConfig() {
  const settings = getApiSettings();
  return {
    apiKey: settings.apiKey || process.env.DEEPSEEK_API_KEY || process.env.API_KEY,
    apiUrl: settings.apiUrl || process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/v1/chat/completions",
    model: settings.model || process.env.DEEPSEEK_MODEL || "deepseek-chat"
  };
}

// --- Helper: Robust Request Wrapper with Retry ---

async function runDeepSeekRequest(prompt: string, contextLabel: string): Promise<string[]> {
  const maxRetries = 3;
  let attempt = 0;
  const { apiKey, apiUrl, model } = getApiConfig();

  if (!apiKey) {
    throw new Error("API Key 未配置，请前往「设置」模块输入您的 DeepSeek API Key");
  }

  while (attempt < maxRetries) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "user",
              content: `${prompt}\n\n请严格按照JSON数组格式返回，只返回字符串数组，不要包含其他内容。`
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            return parsed as string[];
          } else if (typeof parsed === 'object' && Object.values(parsed).some(Array.isArray)) {
            const arrayValue = Object.values(parsed).find(Array.isArray);
            return arrayValue as string[];
          }
          if (typeof parsed === 'string') {
            return JSON.parse(parsed) as string[];
          }
        } catch (jsonError) {
          console.warn(`JSON parsing failed for ${contextLabel}, attempting raw cleanup.`);
          const cleanText = content.replace(/```json/g, '').replace(/```/g, '').trim();
          try {
            return JSON.parse(cleanText) as string[];
          } catch (e) {
            const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
              return JSON.parse(jsonMatch[0]) as string[];
            }
            throw new Error(`无法解析JSON响应: ${cleanText.substring(0, 100)}`);
          }
        }
      }
      return [];

    } catch (error: any) {
      const errorMessage = error.message || JSON.stringify(error);
      const isQuotaError = errorMessage.includes('429') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('rate limit') ||
        errorMessage.includes('RESOURCE_EXHAUSTED');

      if (isQuotaError) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error(`API 配额已耗尽 (429)。请检查您的 DeepSeek API 配额或稍后再试。`);
        }
        const delay = 2000 * Math.pow(2, attempt - 1);
        console.warn(`[${contextLabel}] Hit rate limit (429). Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      } else {
        console.error(`[${contextLabel}] Fatal Error:`, error);
        throw new Error(`${contextLabel}失败: ${error.message || '未知网络错误'}`);
      }
    }
  }
  return [];
}

export const generateTitles = async (keyword: string): Promise<string[]> => {
  const prompt = `Generate 10 SEO-friendly, long-tail blog post titles in Chinese for the keyword: "${keyword}". 
    Format example: "2025 New Version [Keyword] Which is better? Official Review and Recommendations".
    Focus on: Guides, Rankings, New Versions, High Reputation.
    Return strictly a JSON array of strings.`;
  return runDeepSeekRequest(prompt, "生成标题");
};

export const generateOpenings = async (title: string, promptTemplate?: string): Promise<string[]> => {
  const prompt = promptTemplate
    ? promptTemplate.replace('{{TITLE}}', title)
    : `请基于文章标题「${title}」，用中文生成 3 段不同风格的开场白（每段约 80-120 字）。
           要求：
           - **SEO强化**：标题核心词及主要长尾词在每段自然出现 1-2 次。
           - **前置原则**：首句必须包含核心关键词，直接切入 2026 内容主题。
           - 风格 1：数据驱动/专业分析。
           - 风格 2：玩家视角/情感共鸣。
           - 风格 3：直击利益/干货引导。
           - 若出现年份必须为 2026 年。
           Return strictly as an array of strings.`;
  return runDeepSeekRequest(prompt, "生成开场白");
};

export const generateTips = async (title: string, promptTemplate?: string): Promise<string[]> => {
  const prompt = promptTemplate
    ? promptTemplate.replace('{{TITLE}}', title)
    : `基于游戏文章标题「${title}」，生成 5 条更长、更可执行的技巧/攻略提示，每条需满足：
           - 字数不少于 100 字，理想 120-150 字，绝不能少于 80 字
           - 写清操作步骤或决策思路，包含 1-2 个具体数值/装备/技能名称
           - 结尾加一句简短 CTA（如"立刻去试试"、"赶紧卡点上分"）
           请严格只返回字符串数组（JSON array of strings），不要包含其他说明。`;
  return runDeepSeekRequest(prompt, "生成技巧库");
};

export const analyzeTrends = async (niche: string): Promise<string[]> => {
  const prompt = `You are a strategic content advisor. Analyze the niche topic "${niche}". 
    Generate 10 high-traffic, low-competition article titles in Chinese that would appeal to this audience.
    Return strictly a JSON array of strings.`;
  return runDeepSeekRequest(prompt, "战略分析");
};

export const organizeBulkTitles = async (rawText: string): Promise<string[]> => {
  const prompt = `Analyze the provided raw text to extract blog titles. 
    For each title, strictly enforce the following formatting rule:
    
    "Only allow ONE single space to separate the title into a Front Part and a Back Part. Remove ALL other extra spaces within the parts."
    
    Example:
    Input: "2025 魔域手游 sf 私发网在哪 稳定不跑路的魔域手游 sf 资源分享"
    Output: "2025魔域手游sf私发网在哪 稳定不跑路的魔域手游sf资源分享"
    
    (Note: The space after '2025' or '在哪' is consolidated so there is only one space in the entire title, effectively splitting it into two major segments).
    
    Just return the clean titles in a JSON array of strings.
    Raw Text: ${rawText}`;
  return runDeepSeekRequest(prompt, "标题整理");
};
