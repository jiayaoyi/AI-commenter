import * as vscode from 'vscode';
import { BaseService } from '../services/BaseService';
import { SymbolAnalyzer } from './analyzers/SymbolAnalyzer';
import { SemanticAnalyzer } from './analyzers/SemanticAnalyzer';
import { ContextAnalyzer } from './analyzers/ContextAnalyzer';
import { CodeBlock } from '../../types/CodeBlock';
import { ICodeAnalyzer } from './interfaces/ICodeAnalyzer';

export class CodeAnalyzer extends BaseService<CodeAnalyzer> implements ICodeAnalyzer {
    private symbolAnalyzer: SymbolAnalyzer;
    private semanticAnalyzer: SemanticAnalyzer;
    private contextAnalyzer: ContextAnalyzer;

    public constructor() {
        super();
        this.symbolAnalyzer = new SymbolAnalyzer();
        this.semanticAnalyzer = new SemanticAnalyzer();
        this.contextAnalyzer = new ContextAnalyzer();
    }

    public async analyze(document: vscode.TextDocument, range: vscode.Range): Promise<CodeBlock[]> {
        try {
            const [symbolBlocks, semanticBlocks, contextBlocks] = await Promise.all([
                this.symbolAnalyzer.analyze(document, range),
                this.semanticAnalyzer.analyze(document, range),
                this.contextAnalyzer.analyze(document, range)
            ]);

            const mergedBlocks = this.mergeAnalysisResults(
                symbolBlocks,
                semanticBlocks,
                contextBlocks
            );

            return this.processAnalysisResults(mergedBlocks);
        } catch (error) {
            console.error('代码分析失败:', error);
            return [];
        }
    }

    private mergeAnalysisResults(...blockArrays: CodeBlock[][]): CodeBlock[] {
        const allBlocks = blockArrays.flat();
        return this.organizeBlocks(allBlocks);
    }

    private organizeBlocks(blocks: CodeBlock[]): CodeBlock[] {
        // 按范围排序
        const sortedBlocks = this.sortBlocksByRange(blocks);
        
        // 构建层级结构
        return this.buildHierarchy(sortedBlocks);
    }

    private buildHierarchy(blocks: CodeBlock[]): CodeBlock[] {
        const rootBlocks: CodeBlock[] = [];
        const blockStack: CodeBlock[] = [];

        for (const block of blocks) {
            while (blockStack.length > 0 && 
                   !this.isContainedIn(block.symbol.range, blockStack[blockStack.length - 1].symbol.range)) {
                blockStack.pop();
            }

            if (blockStack.length === 0) {
                rootBlocks.push(block);
            } else {
                blockStack[blockStack.length - 1].children.push(block);
            }

            blockStack.push(block);
        }

        return rootBlocks;
    }

    private isContainedIn(inner: vscode.Range, outer: vscode.Range): boolean {
        return outer.contains(inner.start) && outer.contains(inner.end);
    }

    private sortBlocksByRange(blocks: CodeBlock[]): CodeBlock[] {
        return [...blocks].sort((a, b) => {
            if (a.symbol.range.start.line !== b.symbol.range.start.line) {
                return a.symbol.range.start.line - b.symbol.range.start.line;
            }
            return a.symbol.range.start.character - b.symbol.range.start.character;
        });
    }

    private processAnalysisResults(blocks: CodeBlock[]): CodeBlock[] {
        // 移除重复的块
        const uniqueBlocks = this.removeDuplicateBlocks(blocks);
        
        // 合并相邻的注释
        return this.mergeAdjacentComments(uniqueBlocks);
    }

    private removeDuplicateBlocks(blocks: CodeBlock[]): CodeBlock[] {
        const seen = new Set<string>();
        return blocks.filter(block => {
            const key = `${block.symbol.range.start.line}:${block.symbol.range.start.character}`;
            if (seen.has(key)) {return false;}
            seen.add(key);
            return true;
        });
    }

    private mergeAdjacentComments(blocks: CodeBlock[]): CodeBlock[] {
        const result: CodeBlock[] = [];
        let currentComment: CodeBlock | null = null;

        for (const block of blocks) {
            if (block.type === 'comment') {
                if (currentComment && this.areCommentsAdjacent(currentComment, block)) {
                    currentComment = this.mergeCommentBlocks(currentComment, block);
                } else {
                    if (currentComment) {result.push(currentComment);}
                    currentComment = block;
                }
            } else {
                if (currentComment) {result.push(currentComment);}
                result.push(block);
                currentComment = null;
            }
        }

        if (currentComment) {result.push(currentComment);}
        return result;
    }

    private areCommentsAdjacent(block1: CodeBlock, block2: CodeBlock): boolean {
        return block1.symbol.range.end.line + 1 >= block2.symbol.range.start.line;
    }

    private mergeCommentBlocks(block1: CodeBlock, block2: CodeBlock): CodeBlock {
        const range = new vscode.Range(
            block1.symbol.range.start,
            block2.symbol.range.end
        );

        return {
            symbol: new vscode.DocumentSymbol(
                block1.symbol.name + '\n' + block2.symbol.name,
                '',
                vscode.SymbolKind.String,
                range,
                range
            ),
            type: 'comment',
            children: []
        };
    }
} 