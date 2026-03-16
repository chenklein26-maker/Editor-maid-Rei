

export enum WorkflowStep {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED'
}

export interface LibraryItem {
  id: string;
  content: string;
  category?: string;
  // New: Optional custom prompts for templates
  customOpeningPrompt?: string;
  customTipPrompt?: string;
}

export interface PromptSettings {
  openingPrompt: string;
  tipPrompt: string;
}

export interface AppState {
  titles: LibraryItem[];
  images: LibraryItem[];
  endings: LibraryItem[];
  templates: LibraryItem[];
  prompts: PromptSettings;
  jobs: JobData[];
  // New: Theme preference for the welcome screen
  welcomeTheme?: string;
  // New: Theme preference for the main UI (AUTO = sync with welcome, or specific ID)
  uiTheme?: string;
}

export interface JobData {
  id: string;
  targetTitle: string;
  selectedTemplateId: string | null;

  // Configuration
  autoImage: boolean; // New: Toggle for image automation

  // AI Generated & Selected Assets
  selectedOpening: string | null;
  selectedTip: string | null;
  selectedImage?: string | null;

  contentBody: string;
  step: WorkflowStep;
  error: string | null;
  log: string[];
  // UI state: whether the latest生成结果已复制
  copied?: boolean;
}

// New: Comprehensive Theme Style Interface
export interface UIThemeStyle {
  id: string;
  appBg: string;      // Global Background
  headerBg: string;   // Top Navigation Bar

  // Module Containers (Cards/Sidebars)
  panelBg: string;
  panelBorder: string;

  // Typography
  textMain: string;   // Primary text color (e.g., Titles)
  textMuted: string;  // Secondary text color (e.g., Subtitles)

  // Interactive Elements
  accentBg: string;   // Active buttons/tabs background
  accentText: string; // Active buttons/tabs text
  inputBg: string;    // Input fields background

  font: string;       // Font family class
}

// Default Prompts (with {{TITLE}} placeholder)
export const DEFAULT_PROMPTS: PromptSettings = {
  openingPrompt: `请基于文章标题「{{TITLE}}」，用中文生成 3 段不同风格的開場白，每段约 80-120 字，要求：
- **SEO强化**：标题中的【核心词】及【主要长尾词】必须在每段中自然出现 1-2 次。
- **前置原则**：确保核心关键词或文章核心价值在第一句话中就出现，让用户和百度蜘蛛能第一时间通过开头锁定主题。
- 三段的语气/视角/结构明显不同（例如：偏数据分析、偏玩家体验、偏干货指引等），不要直接写出风格名称。
- 可以引用 2026 年的数据、版本、环境等信息，若出现年份必须为 2026。
- 不要出现具体品牌名字，用泛化表述。
请严格只返回字符串数组（JSON array of strings），不要添加任何说明文字。`,
  tipPrompt: `基于游戏文章标题「{{TITLE}}」，生成 5 条更长、更可执行的技巧/攻略提示，每条需满足：
- 字数不少于 100 字，理想 120-150 字，绝不能低于 80 字
- 写清操作步骤或决策思路，包含 1-2 个具体数值/装备/技能名称
- 如需引用数据或时间信息，年份必须为 2026
- 结尾加一句简短 CTA（如"立刻去试试"、"赶紧卡点上分"）
- 不要出现具体网站或平台的品牌名字，如需提到平台，用「某开箱平台」「某对战平台」「某手游发布网」等泛化表述
请严格只返回字符串数组（JSON array of strings），不要包含其他说明。`
};

// Default Data
export const DEFAULT_ENDINGS: LibraryItem[] = [
  { id: 'end-1', category: '备用', content: '暂无预设技巧，请使用AI生成。' }
];

export const DEFAULT_IMAGES: LibraryItem[] = [
  // Based on user's 97-image mapping (URL + category)
  { id: 'img-1', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251210/516-251210141128.jpg@!18183' },
  { id: 'img-2', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251210/516-2512101KU9.jpg@!18183' },
  { id: 'img-3', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251213/516-251213015924-50.jpg' },
  { id: 'img-4', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251213/516-251213015923.jpg' },
  { id: 'img-5', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251213/516-251213015925.jpg' },
  { id: 'img-6', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251213/516-251213024I1-50.jpg' },
  { id: 'img-7', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251213/516-251213024I2.jpg' },
  { id: 'img-8', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251213/516-251213024I1.jpg' },
  { id: 'img-9', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251213/516-251213024I2-50.jpg' },
  { id: 'img-10', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251213/516-251213024I0.jpg' },
  { id: 'img-11', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133K1-50.jpg' },
  { id: 'img-12', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133K7.jpg' },
  { id: 'img-13', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133K4.jpg' },
  { id: 'img-14', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133P0.jpg' },
  { id: 'img-15', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133K9-50.jpg' },
  { id: 'img-16', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133P0-50.jpg' },
  { id: 'img-17', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133K7-50.jpg' },
  { id: 'img-18', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133K5-50.jpg' },
  { id: 'img-19', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133K3.jpg' },
  { id: 'img-20', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133K2.jpg' },
  { id: 'img-21', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133K8-50.jpg' },
  { id: 'img-22', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133K9.jpg' },
  { id: 'img-23', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133K6-50.jpg' },
  { id: 'img-24', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133P1.jpg' },
  { id: 'img-25', category: 'tmp-moyu-1', content: 'https://img.18183.com/uploads/allimg/251215/516-251215133K9-51.jpg' },
  { id: 'img-26', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251213/516-2512131QF1.jpg' },
  { id: 'img-27', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251213/516-2512131QF2.jpg' },
  { id: 'img-28', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251213/516-2512131QF4.jpg' },
  { id: 'img-29', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251213/516-2512131QF3-50.jpg' },
  { id: 'img-30', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251213/516-2512131QF0.jpg' },
  { id: 'img-31', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251213/516-2512131QF1-50.jpg' },
  { id: 'img-32', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251213/516-2512131QF2-50.jpg' },
  { id: 'img-33', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251213/516-2512131QF3.jpg' },
  { id: 'img-34', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251213/516-2512131QF3-51.jpg' },
  { id: 'img-35', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251209/516-251209144Q0.jpg@!18183' },
  { id: 'img-36', category: 'Global', content: 'https://img.18183.com/uploads/allimg/251120/516-251120145F8.jpg@!18183' },
  { id: 'img-37', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A105.jpg' },
  { id: 'img-38', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A106.jpg' },
  { id: 'img-39', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A107.jpg' },
  { id: 'img-40', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A106-50.jpg' },
  { id: 'img-41', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A108.jpg' },
  { id: 'img-42', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A121.jpg' },
  { id: 'img-43', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A114-51.jpg' },
  { id: 'img-44', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A122-50.jpg' },
  { id: 'img-45', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A114-50.jpg' },
  { id: 'img-46', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A120.jpg' },
  { id: 'img-47', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A121-50.jpg' },
  { id: 'img-48', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A109-50.jpg' },
  { id: 'img-49', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A113.jpg' },
  { id: 'img-50', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A123-50.jpg' },
  { id: 'img-51', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A119-51.jpg' },
  { id: 'img-52', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A119-50.jpg' },
  { id: 'img-53', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A124.jpg' },
  { id: 'img-54', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A108-50.jpg' },
  { id: 'img-55', category: 'tmp-war3', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A112-50.jpg' },
  { id: 'img-56', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A946.jpg' },
  { id: 'img-57', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A947.jpg' },
  { id: 'img-58', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A946-50.jpg' },
  { id: 'img-59', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A951.jpg' },
  { id: 'img-60', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A948.jpg' },
  { id: 'img-61', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A949-50.jpg' },
  { id: 'img-62', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A952-50.jpg' },
  { id: 'img-63', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A951-50.jpg' },
  { id: 'img-64', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A952.jpg' },
  { id: 'img-65', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F016-50.jpg' },
  { id: 'img-66', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F015.jpg' },
  { id: 'img-67', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F015-50.jpg' },
  { id: 'img-68', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F015-51.jpg' },
  { id: 'img-69', category: 'tmp-cs16', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F016.jpg' },
  { id: 'img-70', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A946.jpg' },
  { id: 'img-71', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A947.jpg' },
  { id: 'img-72', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A946-50.jpg' },
  { id: 'img-73', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A951.jpg' },
  { id: 'img-74', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A948.jpg' },
  { id: 'img-75', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A949-50.jpg' },
  { id: 'img-76', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A952-50.jpg' },
  { id: 'img-77', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A951-50.jpg' },
  { id: 'img-78', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A952.jpg' },
  { id: 'img-79', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F016-50.jpg' },
  { id: 'img-80', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F015.jpg' },
  { id: 'img-81', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F015-50.jpg' },
  { id: 'img-82', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F015-51.jpg' },
  { id: 'img-83', category: 'tmp-csgo-24k', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F016.jpg' },
  { id: 'img-84', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A946.jpg' },
  { id: 'img-85', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A947.jpg' },
  { id: 'img-86', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A946-50.jpg' },
  { id: 'img-87', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A951.jpg' },
  { id: 'img-88', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A948.jpg' },
  { id: 'img-89', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A949-50.jpg' },
  { id: 'img-90', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A952-50.jpg' },
  { id: 'img-91', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A951-50.jpg' },
  { id: 'img-92', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151A952.jpg' },
  { id: 'img-93', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F016-50.jpg' },
  { id: 'img-94', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F015.jpg' },
  { id: 'img-95', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F015-50.jpg' },
  { id: 'img-96', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F015-51.jpg' },
  { id: 'img-97', category: 'tmp-csgo-rank', content: 'https://img.18183.com/uploads/allimg/251215/516-2512151F016.jpg' }
];

export const DEFAULT_TITLES: LibraryItem[] = [
  { id: 't-1', content: '2026新版魔域手游哪家强 官方正规发布网及高口碑版本推荐' },
  { id: 't-2', content: '魔域口袋版新区冲级攻略 平民玩家如何快速提升战力' }
];

export const DEFAULT_TEMPLATES: LibraryItem[] = [
  {
    id: 'tmp-moyu-1',
    category: '魔域资讯模板',
    customOpeningPrompt: `请基于标题「{{TITLE}}」，以资深魔域玩家的口吻，生成 3 段自然且有温度的开场白（每段约 100 字）。
要求：
- **SEO强化**：标题中的【魔域】及核心动作词/长尾词在每段自然出现 1-2 次。
- **前置原则**：第一句话必须包含核心关键词，直切主题。
- 语气：老玩家之间的经验交流，带一点怀旧或对 2026 新版本的期待感，拒绝生硬广告。
- 风格 1：情怀回归流。聊聊 2026 年重回魔域的感受。
- 风格 2：新区福利流。针对 2026 年新区冲级，分享实测经验。
- 风格 3：平民逆袭流。站在散人角度聊聊 2026 环境下的生存之道。
- 年份必须为 2026。严禁具体品牌名。只返回 JSON 字符串数组。`,
    content: `<p>
	{{TITLE}}</p>
<p>
	{{OPENING}}</p>
<p style="text-align: center;">
	<img alt="{{TITLE}}" class="scrollLoading" src="{{IMAGE}}" /></p>
<span data-replace-gameid="15229" style="display: none;">,</span> <SCRIPT>document.write('<span data-replaceid="1505">,</span>')</SCRIPT>
<p>
	{{TIP}}</p>`
  },
  {
    id: 'tmp-war3',
    category: '魔兽对战模板',
    customOpeningPrompt: `请基于标题「{{TITLE}}」，用中文生成 3 段开场白（每段约 80-120 字），旨在推广 KK对战平台。
要求：
- **SEO强化**：标题中的关键词在每段自然出现 1-2 次。
- **前置原则**：首句包含关键词，直切 2026 年魔兽对战主题。
- 风格 1：数据驱动型。
- 风格 2：玩家情感型。
- 风格 3：利益引导型。
- 年份 2026。只返回 JSON 字符串数组。`,
    content: `<p>
	{{TITLE}}</p>
<p>
	{{OPENING}}</p>
<p style="text-align: center;">
	<img alt="{{TITLE}}" class="scrollLoading" src="{{IMAGE}}" /></p>
<span data-replace-gameid="2008354" style="display: none;">,</span> <SCRIPT>document.write('<span data-replaceid="1497">,</span>')</SCRIPT>
<p>
	{{TIP}}</p>`
  },
  {
    id: 'tmp-cs16',
    category: 'CS1.6对战模板',
    customOpeningPrompt: `请基于标题「{{TITLE}}」，用中文生成 3 段 CS1.6 的开场白（每段约 100 字），旨在推广 KK对战平台。
要求：
- **SEO强化**：核心关键词在每段自然出现 2-3 次。
- **前置原则**：第一句话必须锁定 CS1.6 关键词及核心内容亮点。
- 风格 1：专业技术派。
- 风格 2：怀旧情怀派。
- 风格 3：直击福利派。
- 只返回 JSON 字符串数组。`,
    content: `<p>
	{{TITLE}}</p>
<p>
	{{OPENING}}</p>
<p style="text-align: center;">
	<img alt="{{TITLE}}" class="scrollLoading" src="{{IMAGE}}" /></p>
<span data-replace-gameid="2008354" style="display: none;">,</span> <SCRIPT>document.write('<span data-replaceid="1506">,</span>')</SCRIPT>
<p>
	{{TIP}}</p>`
  },
  {
    id: 'tmp-csgo-24k',
    category: 'CSGO开箱24k模板',
    customOpeningPrompt: `请基于标题「{{TITLE}}」，生成 3 段自然且有亲和力的 CSGO 开箱分享开场白（每段约 100 字）。
要求：
- **SEO强化**：标题关键词及主要长尾词在每段自然出现 1-2 次。
- **前置原则**：首句务必包含核心关键词，直接切入 2026 年开箱主题。
- 语气：像朋友在群里聊天，真诚分享，严禁生硬广告。
- 风格 1：实测分享。
- 风格 2：审美饰品搭配。
- 风格 3：新手避坑引导。
- 年份 2026。只返回 JSON 字符串数组。`,
    content: `<p>
	{{TITLE}}</p>
<p>
	{{OPENING}}</p>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space" style="text-align: center;">
	<img alt="{{TITLE}}" class="scrollLoading" src="{{IMAGE}}" /></div>
<span data-replace-gameid="2371338" style="display: none;">,</span><SCRIPT>document.write('<span data-replaceid="1509">,</span>')</SCRIPT>
<p>
	{{TIP}}</p>`
  },
  {
    id: 'tmp-csgo-rank',
    category: 'CSGO开箱排行榜模板',
    customOpeningPrompt: `请基于标题「{{TITLE}}」，从资深玩家建议角度生成 3 段 CSGO 开箱榜单分析（每段约 100 字）。
要求：
- **SEO强化**：核心词及其主要长尾词（开箱/榜单/2026等）在每段自然出现 1-2 次。
- **前置原则**：第一句话必须包含核心关键词，直接定位 2026 精选榜单的核心价值。
- 语气：客观靠谱，避免生硬推销。
- 风格 1：排雷经验总结。
- 风格 2：2026数据与趋势。
- 风格 3：精选选站建议。
- 年份 2026。只返回 JSON 字符串数组。`,
    customTipPrompt: `基于标题「{{TITLE}}」，围绕 CSGO 开箱排行榜主题，生成 5 条结尾技巧/攻略提示，每条需满足：
- 围绕开箱策略、返利活动、概率认知、防止盲目氪金等维度展开，可结合榜单或数据趋势做总结
- 字数不少于 100 字，理想 120-150 字，绝不能低于 80 字
- 如果引用年份或数据，请统一使用 2026 年的数据描述（例如「2026 年活跃玩家趋势」「2026 年爆率统计」）
- 严禁出现任何具体的网站、平台或品牌名称，不要写出域名、站名；如需提到平台，用「某开箱平台」「综合开箱站点」「主流社区推荐的开箱平台」等模糊说法代替
- 每条结尾都加一句明确的行动号召（例如「最后理性上头，记得先看返利说明再开箱」、「收藏榜单数据，2026 赛季开箱更有谱」）
请严格只返回字符串数组（JSON array of strings），不要包含标题本身，也不要添加额外说明。`,
    content: `<p>
	{{TITLE}}</p>
<p>
	{{OPENING}}</p>
<div class="auto-hide-last-sibling-br paragraph-JOTKXA paragraph-element br-paragraph-space" style="text-align: center;">
	<img alt="{{TITLE}}" class="scrollLoading" src="{{IMAGE}}" /></div>
<span data-replace-gameid="2371338" style="display: none;">,</span><SCRIPT>document.write('<span data-replaceid="1493">,</span>')</SCRIPT>
<p>
	{{TIP}}</p>`
  },
  {
    id: 'tmp-simple',
    category: '通用纯净版',
    content: `<h2>{{TITLE}}</h2>
<p>{{OPENING}}</p>
<hr/>
<img src="{{IMAGE}}" style="width:100%;" />
<h3>实用技巧</h3>
<p>{{TIP}}</p>`
  }
];