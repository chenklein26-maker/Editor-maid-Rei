import React, { createContext, useContext, useState, ReactNode } from 'react';

// 定义翻译类型
interface Translations {
  [key: string]: string | Translations;
}

// 定义所有支持的语言翻译
const translations: Record<string, Translations> = {
  en: {
    app: {
      welcomeBack: "Welcome back, Master.",
      automatedWorkflowSystem: "Automated Workflow System",
      systemStatus: "System Status",
      online: "Online",
      restart: "System Restart",
      restarting: "System restarting, please wait...",
      nav: {
        assets: "Assets",
        workflow: "Workflow",
        strategy: "Strategy",
        settings: "Settings"
      }
    },
    strategyRoom: {
      promptEngineering: "Prompt Engineering",
      promptEngineeringConsole: "Prompt Engineering Console",
      globalDefault: "Global Default Prompts",
      templateSpecific: "Template-Specific Overrides",
      opening: "Opening Remark Logic",
      placeholder: {
        opening: "Enter prompt for opening remarks...",
        tips: "Enter prompt for tips/advice..."
      },
      tips: "Strategy Tips Logic",
      saveConfig: "Save Configuration",
      visualStyle: "Visual Theme Settings",
      startupPage: "Startup Theme",
      uiLock: "UI Style Lock",
      randomDisplay: "Random Rotation",
      randomDisplayDesc: "Each startup will use a random theme from the system library.",
      autoSync: "Unlock & Auto Sync",
      autoSyncDesc: "Release UI lock. The main interface will synchronize with the cold-start theme.",
      language: "System Language",
      lightThemes: "Light Mode (Day)",
      darkThemes: "Dark Mode (Night)",
      trends: "Trend Mining",
      miningAnalysis: "Strategic Keyword Analysis",
      inputKeyword: "Enter niche keyword...",
      analyzing: "Analyzing...",
      startMining: "Start Mining",
      results: "Analysis Results",
      clear: "Clear All",
      noData: "No data. Initiate mining to see results.",
      addToLibrary: "Add to Titles"
    }
  },
  zh: {
    app: {
      welcomeBack: "欢迎回来，主人。",
      automatedWorkflowSystem: "自动化工作流系统",
      systemStatus: "系统状态",
      online: "在线",
      restart: "重启系统",
      restarting: "正在重启系统，请稍候...",
      nav: {
        assets: "资产",
        workflow: "工作流",
        strategy: "策略",
        settings: "设置"
      }
    },
    strategyRoom: {
      promptEngineering: "提示词工程",
      promptEngineeringConsole: "提示词配置中枢",
      globalDefault: "全局默认提示词",
      templateSpecific: "指定模板专项覆盖",
      opening: "开场白逻辑 (Opening)",
      placeholder: {
        opening: "请输入开场白的生成指令...",
        tips: "请输入技巧部分的生成指令..."
      },
      tips: "技巧逻辑 (Tips)",
      saveConfig: "保存全局/模板配置",
      visualStyle: "视觉风格设置",
      startupPage: "启动页主题",
      uiLock: "界面锁定",
      randomDisplay: "随机轮播",
      randomDisplayDesc: "每次启动时从系统库中随机抽取一个风格。",
      autoSync: "解除锁定 & 自动同步主题",
      autoSyncDesc: "释放界面锁定，主界面将实时跟随启动页的冷启动风格。",
      language: "语言设置",
      lightThemes: "明亮系主题 (白天)",
      darkThemes: "暗黑色主题 (夜晚)",
      trends: "热点挖掘",
      miningAnalysis: "战略关键词挖掘",
      inputKeyword: "输入目标领域关键词...",
      analyzing: "分析中...",
      startMining: "开始挖掘",
      results: "挖掘结果",
      clear: "清空",
      noData: "暂无数据。请开启挖掘以获取灵感。",
      addToLibrary: "加入标题库"
    }
  },
  ja: {
    app: {
      welcomeBack: "おかえりなさい、ご主人様。",
      automatedWorkflowSystem: "自動ワークフローシステム",
      systemStatus: "システムステータス",
      online: "オンライン",
      restart: "システム再起動",
      restarting: "システムを再起動しています、お待ちください...",
      nav: {
        assets: "アセット",
        workflow: "ワークフロー",
        strategy: "戦略",
        settings: "設定"
      }
    },
    strategyRoom: {
      promptEngineering: "プロンプト生成",
      promptEngineeringConsole: "プロンプト設定センター",
      globalDefault: "全局デフォルトプロンプト",
      templateSpecific: "テンプレート固有の上書き",
      opening: "オープニングロジック",
      placeholder: {
        opening: "導入文の生成指示を入力...",
        tips: "テクニックの生成指示を入力..."
      },
      tips: "テクニックロジック",
      saveConfig: "構成を保存",
      visualStyle: "ビジュアルテーマ設定",
      startupPage: "起動テーマ",
      uiLock: "UIロックスタイル",
      randomDisplay: "ランダム表示",
      randomDisplayDesc: "起動するたびにシステムライブラリからテーマをランダムに選択します。",
      autoSync: "ロック解除 & 自動同期",
      autoSyncDesc: "UIロックを解除。メインインターフェースは起動テーマと同期します。",
      language: "システム言語",
      lightThemes: "ライトモード (昼)",
      darkThemes: "ダークモード (夜)",
      trends: "トレンド分析",
      miningAnalysis: "戦略的キーワード分析",
      inputKeyword: "ニッチなキーワードを入力...",
      analyzing: "分析中...",
      startMining: "分析を開始",
      results: "分析結果",
      clear: "すべてクリア",
      noData: "データなし。分析を開始して結果を表示。",
      addToLibrary: "タイトルに追加"
    }
  }
};

// 定义上下文类型
interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

// 创建上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译函数
const translate = (key: string, language: string): string => {
  const keys = key.split('.');
  let result: any = translations[language] || translations.en;

  for (const k of keys) {
    if (result[k]) {
      result = result[k];
    } else {
      // 如果找不到翻译，返回原始键
      return key;
    }
  }

  return typeof result === 'string' ? result : key;
};

// 提供者组件
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // 从localStorage获取语言设置，如果没有则使用浏览器语言
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('maid_rei_language');
    if (savedLanguage && translations[savedLanguage]) {
      return savedLanguage;
    }

    // 尝试使用浏览器语言
    const browserLanguage = navigator.language.split('-')[0];
    if (translations[browserLanguage]) {
      return browserLanguage;
    }

    // 默认使用英文
    return 'en';
  });

  // 更新语言设置并保存到localStorage
  const handleSetLanguage = (newLanguage: string) => {
    if (translations[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem('maid_rei_language', newLanguage);
    }
  };

  // 创建翻译函数
  const t = (key: string) => translate(key, language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义钩子
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
