import * as vscode from 'vscode';
import { BaseAnalyzer } from './BaseAnalyzer';
import { CodeBlock } from '../../../types/CodeBlock';

export class SymbolAnalyzer extends BaseAnalyzer {
    async analyze(document: vscode.TextDocument, range: vscode.Range): Promise<CodeBlock[]> {
        const symbols = await this.getDocumentSymbols(document);
        if (!symbols) {return [];}
        
        return this.buildCodeBlockTree(symbols, range);
    }

    private async getDocumentSymbols(document: vscode.TextDocument): Promise<vscode.DocumentSymbol[] | undefined> {
        try {
            return await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                'vscode.executeDocumentSymbolProvider',
                document.uri
            );
        } catch (error) {
            console.error('获取文档符号失败:', error);
            return undefined;
        }
    }

    private buildCodeBlockTree(
        symbols: vscode.DocumentSymbol[],
        range: vscode.Range,
        parent?: CodeBlock
    ): CodeBlock[] {
        const blocks: CodeBlock[] = [];

        for (const symbol of symbols) {
            if (this.isInRange(symbol.range, range)) {
                const block: CodeBlock = {
                    symbol,
                    type: this.getSymbolType(symbol),
                    parent,
                    children: []
                };

                if (symbol.children && symbol.children.length > 0) {
                    block.children = this.buildCodeBlockTree(symbol.children, range, block);
                }

                blocks.push(block);
            }
        }

        return blocks;
    }

    private getSymbolType(symbol: vscode.DocumentSymbol): CodeBlock['type'] {
        switch (symbol.kind) {
            case vscode.SymbolKind.Class:
                return 'class';
            case vscode.SymbolKind.Method:
            case vscode.SymbolKind.Function:
                return 'method';
            case vscode.SymbolKind.Property:
            case vscode.SymbolKind.Variable:
                return 'property';
            default:
                return 'other';
        }
    }
} 