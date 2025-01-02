# AI Commenter

AI Commenter 是一个 VSCode 扩展，它使用 AI 技术帮助开发者快速生成高质量的代码注释。

## 功能特点

- 🚀 一键生成代码注释
- 🎯 智能识别代码结构
- 🌍 多语言支持（中文、English、日本語）
- ⚙️ 支持多种 AI 模型（OpenAI、Azure等）
- 🔒 安全的 API 密钥管理
- 📝 自定义注释模板
- 🎨 保持代码格式和缩进

## 快速开始

1. 在 VSCode 中安装 AI Commenter 扩展
2. 配置 AI 服务（OpenAI、Azure等）
3. 选择要注释的代码
4. 按快捷键 `Ctrl+Alt+/`（Mac: `Cmd+Alt+/`）或右键选择"添加代码注释"

## 配置说明

### AI 服务配置

在 VSCode 设置中配置（按 `Ctrl+,` 打开设置，搜索 "AI Commenter"）：

- API Key
- 模型选择（如 GPT-4、GPT-3.5等）
- 温度参数（控制生成结果的随机性）
- 最大 Token 数

### 注释风格配置

- 作者信息
- 注释语言
- 是否使用文档注释
- 缩进保持

## 使用方法

1. **选择代码**：选中需要添加注释的代码片段

2. **生成注释**：
   - 使用快捷键：`Ctrl+Alt+/`（Mac: `Cmd+Alt+/`）
   - 或右键菜单：选择"添加代码注释"
   - 或命令面板：`Ctrl+Shift+P` 后输入"添加代码注释"

3. **自定义注释**：
   - 支持自定义注释模板
   - 可调整 AI 参数以获得不同风格的注释

## 本地开发

1. 克隆仓库
bash
git clone https://github.com/jiayaoyi/AI-commenter.git

2. 安装依赖
bash
npm install

3. 运行
bash
npm run watch

4. 本地安装
bash
npm run install-local

## 问题反馈

如果你在使用过程中遇到任何问题，或有功能建议，欢迎：
- 提交 [Issue](https://github.com/jiayaoyi/AI-commenter/issues)
- 发起 [Pull Request](https://github.com/jiayaoyi/AI-commenter/pulls)

## 许可证

本项目采用 MIT 许可证，详见 [LICENSE](LICENSE) 文件。

## 作者

[Jia Yaoyi](https://github.com/jiayaoyi)