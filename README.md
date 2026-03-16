<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Editor Maid Rei

AI 辅助内容编辑与工作流系统，支持标题、开场白、技巧生成等。

## 环境要求

- Node.js >= 18.0.0

## 快速开始

1. **安装依赖**
   ```bash
   npm install
   ```

2. **配置 API Key**（二选一）
   
   - **方式一：应用内设置（推荐）**  
     启动应用后，点击顶部导航「设置」，输入 DeepSeek API Key 并选择模型，点击「保存配置」。配置仅保存在浏览器本地，不会上传。
   
   - **方式二：环境变量**  
     复制 `.env.example` 为 `.env.local`，填入你的 DeepSeek API Key：
     ```bash
     cp .env.example .env.local
     ```
     编辑 `.env.local`，将 `your_deepseek_api_key_here` 替换为实际 Key。

3. **启动开发服务器**
   ```bash
   npm run dev
   ```
   应用将在 `http://localhost:3000` 启动。

## 构建与部署

```bash
npm run build    # 生产构建，输出到 dist/
npm run preview  # 预览构建结果
```

## API 配置

- 默认使用 **DeepSeek API**，端点：`https://api.deepseek.com/v1/chat/completions`
- 在「设置」中可配置 API Key、模型（如 deepseek-chat、deepseek-reasoner）及自定义 API 端点
- 使用 `.env.local` 时，可配置 `DEEPSEEK_API_URL`、`DEEPSEEK_MODEL` 以切换端点或模型
- 如需使用 Gemini，请修改 `services/aiService.ts` 中的逻辑
