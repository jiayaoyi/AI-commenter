import * as vscode from 'vscode';
import { BaseService } from '../services/BaseService';
import { CodeAnalyzer } from '../analysis/CodeAnalyzer';
import { CommentFormatterService } from './CommentFormatterService';
import { CommentHistoryService } from './CommentHistoryService';
import { CommentValidatorService } from './CommentValidatorService';
import { CodeBlock } from '../../types/CodeBlock';
import { CommentResult, CommentContext } from '../../types/Comment';
import { LanguageManager, LanguageInfo } from '../language/LanguageManager';

export class CommentManager extends BaseService<CommentManager> {
    private codeAnalyzer: CodeAnalyzer;
    private formatterService: CommentFormatterService;
    private historyService: CommentHistoryService;
    private validatorService: CommentValidatorService;
    private languageManager: LanguageManager;

    public constructor() {
        super();
        this.codeAnalyzer = CodeAnalyzer.getInstance();
        this.formatterService = CommentFormatterService.getInstance();
        this.historyService = CommentHistoryService.getInstance();
        this.validatorService = CommentValidatorService.getInstance();
        this.languageManager = LanguageManager.getInstance();
    }

    public async addComments(
        editor: vscode.TextEditor,
        commentedCode: string,
        initialPosition: number,
        originalRange: vscode.Range
    ): Promise<void> {
        try {
            const document = editor.document;
            
            // 找到第一个非空行的缩进作为基准
            let baseIndent = '';
            for (let i = originalRange.start.line; i <= originalRange.end.line; i++) {
                const line = document.lineAt(i);
                if (line.text.trim().length > 0) {
                    baseIndent = line.text.match(/^\s*/)?.[0] || '';
                    console.log('基准缩进:', baseIndent.length, '个空格');
                    break;
                }
            }

            console.log('AI返回的代码:\n', commentedCode);
            
            // 在开头添加空行，并保持 AI 返回的缩进结构
            const finalCode = '\n' + baseIndent + commentedCode;
            
            console.log('最终处理的代码:\n', finalCode);

            await editor.edit(editBuilder => {
                editBuilder.replace(originalRange, finalCode);
            });
        } catch (error) {
            console.error('添加注释时出错:', error);
            throw error;
        }
    }

    private groupCommentsByLine(comments: CommentResult[]): Map<number, { type: string; content: string[] }[]> {
        const commentsByLine = new Map<number, { type: string; content: string[] }[]>();
        
        for (const comment of comments.sort((a, b) => a.lineNumber - b.lineNumber)) {
            const existing = commentsByLine.get(comment.lineNumber) || [];
            
            // 查找是否已存在相同类型的注释组
            const existingGroup = existing.find(group => group.type === comment.type);
            if (existingGroup) {
                existingGroup.content.push(comment.content);
            } else {
                existing.push({ type: comment.type, content: [comment.content] });
            }
            
            commentsByLine.set(comment.lineNumber, existing);
        }
        
        return commentsByLine;
    }

    private async createEdits(
        editor: vscode.TextEditor,
        comments: CommentResult[],
        initialPosition: number
    ): Promise<vscode.TextEdit[]> {
        const edits: vscode.TextEdit[] = [];
        const document = editor.document;
        const languageInfo = this.languageManager.getLanguageInfo(document.fileName);
        const maxLine = document.lineCount - 1;

        // 按行号排序，确保注释按顺序插入
        comments.sort((a, b) => a.lineNumber - b.lineNumber);

        let blockComments: CommentResult[] = [];
        let currentLine = initialPosition;

        for (const comment of comments) {
            // 使用相对于初始位置的行号
            const actualLineNumber = currentLine + comment.lineNumber;
            console.log(`处理注释 - 相对行号: ${comment.lineNumber}, 当前行: ${currentLine}, 实际行号: ${actualLineNumber}`);

            if (actualLineNumber < 0 || actualLineNumber > maxLine) {
                console.warn(`跳过无效行号: ${actualLineNumber}`);
                continue;
            }

            if (comment.type === 'block') {
                blockComments.push(comment);
                continue;
            }

            // 处理之前累积的块注释
            if (blockComments.length > 0) {
                this.addBlockComment(edits, blockComments, document, languageInfo, currentLine);
                currentLine += 1;  // 块注释后移动一行
                blockComments = [];
            }

            // 处理单行注释
            const line = document.lineAt(actualLineNumber);
            const indent = line.text.match(/^\s*/)?.[0] || '';
            const cleanContent = comment.content.replace(/^\/\/\s*/, '');
            
            edits.push(
                vscode.TextEdit.insert(
                    new vscode.Position(actualLineNumber, 0),
                    `${indent}${languageInfo.commentStyle.lineComment} ${cleanContent}\n`
                )
            );
            currentLine += 1;  // 每添加一个注释后移动一行
        }

        // 处理最后的块注释
        if (blockComments.length > 0) {
            this.addBlockComment(edits, blockComments, document, languageInfo, currentLine);
        }

        return edits;
    }

    private addBlockComment(
        edits: vscode.TextEdit[],
        blockComments: CommentResult[],
        document: vscode.TextDocument,
        languageInfo: LanguageInfo,
        firstNonEmptyLine: number
    ): void {
        const actualLineNumber = firstNonEmptyLine + blockComments[0].lineNumber;
        console.log(`添加块注释 - 起始行: ${actualLineNumber}`);
        
        const line = document.lineAt(actualLineNumber);
        const indent = line.text.match(/^\s*/)?.[0] || '';
        
        const commentContent = blockComments
            .map(comment => comment.content)
            .join('\n' + indent);
        
        console.log('生成的块注释内容:', commentContent);
        
        edits.push(
            vscode.TextEdit.insert(
                new vscode.Position(actualLineNumber, 0),
                `${indent}${commentContent}\n`
            )
        );
    }

    private createCommentContext(
        document: vscode.TextDocument,
        block: CodeBlock,
        lineNumber: number
    ): CommentContext {
        const line = document.lineAt(lineNumber);
        const indent = line.text.match(/^\s*/)?.[0] || '';
        const style = this.languageManager.getCommentStyle(document.languageId);

        return {
            block,
            languageId: document.languageId,
            indent,
            style
        };
    }

    private findBlockForLine(blocks: CodeBlock[], lineNumber: number): CodeBlock | undefined {
        for (const block of blocks) {
            if (this.containsLine(block.symbol.range, lineNumber)) {
                // 递归检查子块以找到最精确的匹配
                const childBlock = this.findBlockForLine(block.children, lineNumber);
                return childBlock || block;
            }
        }
        return undefined;
    }

    private containsLine(range: vscode.Range, lineNumber: number): boolean {
        return range.start.line <= lineNumber && range.end.line >= lineNumber;
    }

    private recordHistory(document: vscode.TextDocument, comments: CommentResult[]): void {
        for (const comment of comments) {
            this.historyService.addEntry({
                timestamp: Date.now(),
                filePath: document.fileName,
                lineNumber: comment.lineNumber,
                originalCode: document.lineAt(comment.lineNumber).text,
                comment: comment.content,
                author: vscode.workspace.getConfiguration('fastCommenter').get('author') || undefined
            });
        }
    }
} 