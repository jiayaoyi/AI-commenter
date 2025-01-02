import { LLMContext } from '../types/LLMConfig';
import * as vscode from 'vscode';

export function buildPrompt(code: string, context: LLMContext): string {
    const config = context.config || {};
    const currentDate = new Date().toISOString().split('T')[0];
    const author = vscode.workspace.getConfiguration('fastCommenter').get('author') || '未指定';
    const language = vscode.window.activeTextEditor?.document.languageId || '未知语言';
    const vscodeLang = vscode.env.language || 'en';  // 获取 VSCode 界面语言

    // 根据 VSCode 语言返回对应的提示语
    switch (vscodeLang.toLowerCase()) {
        case 'zh-cn':
            return `这是一段 ${language} 代码，请为其添加注释。

代码：
${code}

要求：
1. 注释应该简洁明了
2. 注释语言：使用${language}进行注释
3. 根据 ${language} 的通用编程规范选择注释类型：
   - 类、接口、方法等使用多行注释
   - 简单的代码说明使用单行注释
4. 对于类和方法的注释：
   - 严格遵循开发规范
   - 类注释需包含：类的功能描述、作者、创建日期
   - 方法注释需包含：方法用途、参数说明、返回值说明、异常说明（如果有）
5. 保持原有缩进
6. 返回纯文本，不要返回任何其他内容，包括但不限于代码块、列表、表格等
7. 如果没有明示的类名，不要补充关于类的注释

注释相关信息：
- 作者: ${author}
- 日期: ${currentDate}

请直接返回完整的代码，包含注释，无需其他解释。

绝对禁止对代码本身进行任何修改
绝对禁止追加注释之外的内容`;

        case 'ja':
            return `これは ${language} のコードです。コメントを追加してください。

コード：
${code}

要求：
1. コメントは簡潔で明確であること。
2. コメント言語：${language} を使用。
3. ${language} の標準的なコメント規約に従う：
   - クラス、インターフェース、メソッドなどにはブロックコメントを使用。
   - 簡単なコードの説明には行コメントを使用。
4. クラスとメソッドのコメントについて：
   - 開発標準を厳守。
   - クラスコメントには：クラスの機能説明、著者、作成日。
   - メソッドコメントには：メソッドの目的、パラメータの説明、戻り値の説明、例外の説明（ある場合）。
5. 元のインデントを維持。
6. プレーンテキストで返す。他のコンテンツ（コードブロック、リスト、テーブルなど）は含めない。
7. 明示的なクラス名がない場合、クラスコメントを追加しない。

コメント情報：
- 著者：${author}
- 日付：${currentDate}

コメント付きの完全なコードを返してください。追加の説明は不要です。

コード自体の変更は絶対に行わないでください。
コメント以外の内容を追加しないでください。`;

        default: // 英文（默认）
            return `This is a ${language} code snippet. Please add comments to it.

Code:
${code}

Requirements:
1. Comments should be concise and clear.
2. Use ${language} for comments.
3. Follow ${language}'s standard commenting conventions:
   - Use block comments for classes, interfaces, methods, etc.
   - Use line comments for simple code explanations.
4. For class and method comments:
   - Strictly adhere to development standards.
   - Class comments should include: class functionality description, author, creation date.
   - Method comments should include: method purpose, parameter description, return value description, exception description (if any).
5. Maintain original indentation.
6. Return plain text; do not include any other content, such as code blocks, lists, tables, etc.
7. If no explicit class name is provided, do not add class comments.

Comment Information:
- Author: ${author}
- Date: ${currentDate}

Please return the complete code with comments, without any additional explanations.

Absolutely no modifications to the code itself.
Absolutely no content other than comments.`;
}
}
