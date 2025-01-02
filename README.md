# Fast Commenter

Fast Commenter 是一个 VSCode 扩展，它使用 AI 技术帮助开发者快速生成高质量的代码注释。

## 功能特点

- 🚀 一键生成代码注释
- 🌍 支持多语言（中文、English、日本語）
- 🎯 智能识别代码结构
- ⚙️ 高度可配置的注释模板
- 🔒 安全的 API 密钥管理

## 安装

### 从 VSIX 文件安装

1. 下载 `.vsix` 文件
2. 在 VSCode 中运行命令：
   ```bash
   code --install-extension fast-commenter-0.0.1.vsix
   ```

### 从源码安装

1. 克隆仓库
   ```bash
   git clone https://github.com/your-username/fast-commenter.git
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 打包
   ```bash
   npm run package
   ```

4. 安装到 VSCode
   ```bash
   npm run install-local
   ```

## 配置

### 1. API 设置

在 VSCode 的 `settings.json` 中配置：
