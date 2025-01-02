import * as vscode from 'vscode';
import { CommentManager } from './core/comment/CommentManager';
import { ConfigManager } from './core/config/ConfigManager';
import { LanguageInfo, LanguageManager } from './core/language/LanguageManager';
import { LLMService } from './core/llm';
import { CodeAnalyzer } from './core/analysis/CodeAnalyzer';
import { CodeBlock } from './types/CodeBlock';
import { CommentResult } from './types/Comment';

export async function activate(context: vscode.ExtensionContext) {
    // 初始化服务
    const commentManager = CommentManager.getInstance<CommentManager>();
    const languageManager = LanguageManager.getInstance<LanguageManager>();
    const codeAnalyzer = CodeAnalyzer.getInstance<CodeAnalyzer>();
    const llmService = LLMService.getInstance<LLMService>();
    const configManager = ConfigManager.getInstance<ConfigManager>();

    // 初始化 LLM 服务
    const config = configManager.getConfig();
    const llmConfig = vscode.workspace.getConfiguration('fastCommenter').get('llms.openai');
    if (llmConfig) {
        llmService.initialize(llmConfig as any);
    } else {
        throw new Error('未找到 LLM 配置');
    }

    // 注册命令
    let disposable = vscode.commands.registerCommand('fastCommenter.addComment', async () => {
        try {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                throw new Error('没有打开的编辑器');
            }

            const selection = editor.selection;
            if (selection.isEmpty) {
                throw new Error('请先选择要注释的代码');
            }

            // 获取选中的代码
            const code = editor.document.getText(selection);
            const languageId = editor.document.languageId;

            // 获取语言信息
            const languageInfo = languageManager.getLanguageInfo(languageId);
            if (!languageInfo) {
                throw new Error(`不支持的语言: ${languageId}`);
            }

            // 分析代码结构
            const codeBlocks = await codeAnalyzer.analyze(editor.document, selection);

            // 生成注释
            const comments = await generateComments(code, languageId, codeBlocks, languageInfo, selection, editor.document);

            // 在命令处理函数中
            const originalRange = new vscode.Range(
                selection.start.line,
                0,
                selection.end.line,
                editor.document.lineAt(selection.end.line).text.length
            );

            // 添加注释
            await commentManager.addComments(
                editor, 
                comments, 
                selection.start.line,
                originalRange
            );

            vscode.window.showInformationMessage('添加注释成功！');
        } catch (error: any) {
            vscode.window.showErrorMessage('添加注释失败: ' + error.message);
            console.error('添加注释时出错:', error);
        }
    });

    context.subscriptions.push(disposable);
}

async function generateComments(
    code: string,
    languageId: string,
    codeBlocks: CodeBlock[],
    languageInfo: LanguageInfo,
    selection: vscode.Selection,
    document: vscode.TextDocument
): Promise<string> {
    const initialPosition = selection.start.line + 1;
    console.log('记录初始位置:', initialPosition);

    const llmService = LLMService.getInstance<LLMService>();
    const configManager = ConfigManager.getInstance<ConfigManager>();
    const config = configManager.getConfig();

    const context = {
        language: languageId,
        blocks: codeBlocks,
        commentStyle: languageInfo.commentStyle,
        options: config.commentOptions,
        initialPosition
    };

    return await llmService.generateComment(code, context);
}

export function deactivate() {
    // 清理资源
    const commentManager = CommentManager.getInstance<CommentManager>();
    const historyService = commentManager['historyService'];
    if (historyService) {
        historyService.clearHistory();
    }
}
