<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Editor Maid Rei / 拼积木式 SEO 文章生产工作台

一个面向内容创作者和站长的 **拼积木式 SEO 文章批量生产工具**，由小龙开发。  
专注于把「标题库 + 模板库 + 图片库 + 结尾库 + AI 生成」拼成一条顺滑的内容生产流水线，一次性批量产出大量长尾 SEO 文章。

A **modular SEO article mass-production workspace** for content creators and webmasters, created by Xiaolong.  
It turns “titles + templates + images + endings + AI generation” into a smooth production pipeline for bulk long-tail SEO content.

---

## ✨ 功能特点 / Features

- **拼积木式内容组装 / Modular article assembly**  
  标题、模板、图片、结尾分别维护，按需要自由组合，像搭积木一样快速组装文章。  
  Manage titles, templates, images, and endings as separate building blocks, then mix and match them into full articles.

- **批量生成 SEO 文章 / Bulk SEO article generation**  
  面向站群、专题站和长尾关键词场景，一次性批量产出大量内容。  
  Generate a large volume of SEO articles in one go for PBNs, niche sites, and long-tail keyword coverage.

- **AI 辅助写作 / AI-assisted writing**  
  支持生成标题、开场白、技巧内容和趋势分析，减少人工重复写作。  
  Generate titles, openings, tips, and trend ideas with AI to reduce repetitive manual writing.

- **素材资源库 / Asset library**  
  内置标题库、模板库、图片库、结尾库，支持批量导入、导出、筛选与管理。  
  Includes title, template, image, and ending libraries with bulk import, export, filtering, and management.

- **工作流与策略模块 / Workflow and strategy modules**  
  除了素材管理，还提供策略室和工作流面板，帮助整理选题与生产流程。  
  Beyond asset management, the app includes a strategy room and workflow board for planning and execution.

- **本地优先 / Local-first**  
  API Key 和个性化配置保存在本地浏览器，不做额外云端托管。  
  API keys and personal settings stay in the local browser with no extra hosted backend required.

> 提示：项目会持续迭代，当前更偏向个人与小团队内容生产工具。  
> Note: The project will continue evolving and is currently optimized for personal and small-team content workflows.

---

## 🧩 技术栈 / Tech Stack

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS (via CDN), lucide-react  
- **AI**: OpenAI-compatible APIs, DeepSeek-compatible endpoints  
- **Others**: localStorage（本地配置持久化 / local persistence）, i18n（语言切换 / language switching）

---

## 🚀 快速开始 / Getting Started

### 1. 环境准备 / Prerequisites

- 安装 [Node.js 18+](https://nodejs.org/)（推荐 LTS 版本）  
  Install [Node.js 18+](https://nodejs.org/) (LTS version recommended).
- 克隆本项目 / Clone this repository：

```bash
git clone https://github.com/chenklein26-maker/Editor-maid-Rei.git
cd Editor-maid-Rei
```

### 2. 安装依赖 / Install dependencies

```bash
npm install
```

> 仅首次需要执行，之后一般不需要重复安装。  
> You only need to run this once for dependencies.

### 3. 启动开发环境 / Run in development

```bash
npm run dev
```

- 默认访问地址：`http://localhost:3001`  
- 浏览器会自动打开本地页面

Default local URL: `http://localhost:3001`  
Your browser should open automatically.

或者在 Windows 下直接双击 `start.bat`：  

- 首次运行会自动检测依赖并执行 `npm install`；  
- 之后双击即可直接启动开发服务器。

---

## 🧑‍🤝‍🧑 团队快速上手 / For Team Members

> 适合发给非技术同事看的版本。

1. 安装 Node.js 18+。  
2. 把项目文件夹发给同事，同事解压到任意路径。  
3. 让同事 **双击 `start.bat`**：  
   - 第一次会自动安装依赖；  
   - 之后每次双击即可直接启动。  
4. 打开应用，进入「设置 / Settings」：  
   - 配置自己的 API Key；  
   - 选择推荐模型，或输入自定义模型名称；  
   - 按需修改 API 地址。

---

## ⚙️ 模型与 API 配置（简要）  
## Models & API (brief)

> 大部分细节可以在应用的「设置」里调整，这里只说明核心概念。

- 内置推荐模型卡片（例如 **DeepSeek Chat、DeepSeek R1、DeepSeek Coder**），  
  可一键快速填入模型名称。
- 也支持 **自定义模型**，适合团队成员使用不同服务商或不同模型。  
- 你只需要在界面中：  
  - 填入 API Key；  
  - 选择推荐模型或手动输入模型名称；  
  - 按需修改 API 端点（endpoint）。

如果希望通过环境变量配置：

1. 复制 `.env.example` 为 `.env.local`；  
2. 填入 `DEEPSEEK_API_KEY`；  
3. 按需修改 `DEEPSEEK_API_URL` 和 `DEEPSEEK_MODEL`。

---

## 📂 目录结构（简要） / Project Structure (simplified)

> 实际结构以仓库为准，下面是主要文件的示意。

```text
Editor-maid-Rei/
  ├─ components/               # 界面组件 / UI components
  │  ├─ modules/
  │  │  ├─ AssetLibrary.tsx    # 素材资源库 / Asset library
  │  │  ├─ Settings.tsx        # 设置页 / Settings page
  │  │  ├─ StrategyRoom.tsx    # 策略室 / Strategy room
  │  │  └─ WorkflowBoard.tsx   # 工作流面板 / Workflow board
  │  ├─ ArticleCard.tsx
  │  ├─ MaidRei.tsx
  │  └─ WelcomeOverlay.tsx
  ├─ services/
  │  └─ aiService.ts           # AI 调用逻辑 / AI request logic
  ├─ utils/
  │  └─ settings.ts            # 本地设置存储 / Local settings storage
  ├─ i18n/                     # 多语言支持 / i18n
  ├─ App.tsx                   # 主应用 / Main app
  ├─ index.html                # HTML 入口 / HTML entry
  ├─ index.tsx                 # 前端入口 / Frontend entry
  ├─ vite.config.ts            # Vite 配置 / Vite config
  ├─ .env.example              # 环境变量示例 / Env example
  ├─ start .bat                # Windows 一键启动 / Windows quick start
  └─ README.md
```

---

## 🧪 典型使用场景 / Typical Use Cases

- **站群内容填充 / PBN content filling**  
  - 准备多组标题、模板、图片和结尾；  
  - 通过不同排列组合批量产出文章。

- **专题站运营 / Niche site operations**  
  - 围绕一组长尾关键词批量生成标题和正文结构；  
  - 快速铺设专题内容矩阵。

- **内容团队协作 / Team collaboration**  
  - 团队共用素材库结构；  
  - 每个成员保留自己的 API Key 与模型配置。

---

## 🔧 配置与扩展 / Configuration & Extensibility

- `.env.example` 展示了基础环境变量写法，例如：  
  - `DEEPSEEK_API_KEY`：默认 API Key  
  - `DEEPSEEK_API_URL`：自定义接口地址  
  - `DEEPSEEK_MODEL`：默认模型名
- 复制为 `.env.local` 并按需修改，即可自定义本地运行参数。  
- 应用内的「设置」页可进一步调节：  
  - API Key  
  - 自定义模型名称  
  - OpenAI 兼容 API 端点

---

## 📦 构建与部署 / Build & Deploy

```bash
npm run build    # 生产构建，输出到 dist/ / Production build, output to dist/
npm run preview  # 预览构建结果 / Preview the build locally
```

构建产物位于 `dist/` 目录，可部署到任意静态托管环境。  
Build output is generated in `dist/` and can be deployed to any static hosting service.

---

## ❓ 常见问题 / FAQ

- **Q: 会不会把内容上传到第三方服务器？**  
  **A:** 素材和配置保存在本地浏览器，AI 请求只会发送到你自己配置的接口服务。

- **Q: 团队成员需要自己装 Node.js 吗？**  
  **A:** 需要。首次使用前安装 Node.js，之后双击 `start.bat` 即可。

- **Q: 如何修改端口？**  
  **A:** 在 `vite.config.ts` 中修改 `server.port`，当前默认是 `3001`。

- **Q: 支持哪些模型？**  
  **A:** 支持 OpenAI 兼容接口的模型，既可以用推荐卡片，也可以手动填写自定义模型名。

---

## 📜 许可证 / License

本项目由 **小龙 (Xiaolong)** 开发，采用 **CC BY-NC-SA 4.0** 许可协议：

- **禁止商用 / Non-Commercial** – 不得用于商业用途；  
- **相同方式共享 / ShareAlike** – 衍生作品需以相同协议共享；  
- **保留署名 / Attribution** – 使用或改造时需保留“小龙 (Xiaolong)”的署名与许可说明。

查看仓库中的 [LICENSE](./LICENSE) 文件以了解完整条款。  
See the [LICENSE](./LICENSE) file for full license text.

---

## ✉️ 联系方式 / Contact

- 作者 / Author: **小龙 (Xiaolong)**  
- 仓库 / Repo: `https://github.com/chenklein26-maker/Editor-maid-Rei`  
- 如有问题、建议或使用反馈，欢迎通过 GitHub Issues 提交。  
  Feel free to open a GitHub Issue for questions, suggestions, or feedback.
