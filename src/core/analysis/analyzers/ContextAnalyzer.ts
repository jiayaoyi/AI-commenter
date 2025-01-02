import * as vscode from 'vscode';
import { BaseAnalyzer } from './BaseAnalyzer';
import { CodeBlock } from '../../../types/CodeBlock';

export class ContextAnalyzer extends BaseAnalyzer {
    async analyze(document: vscode.TextDocument, range: vscode.Range): Promise<CodeBlock[]> {
        const blocks: CodeBlock[] = [];
        
        try {
            // 分析导入语句
            const imports = await this.analyzeImports(document, range);
            if (imports.length > 0) {
                blocks.push(this.createImportBlock(imports));
            }

            // 分析命名空间/类/方法上下文
            const context = await this.analyzeContext(document, range);
            if (context) {
                blocks.push(context);
            }

        } catch (error) {
            console.error('上下文分析失败:', error);
        }

        return blocks;
    }

    private async analyzeImports(document: vscode.TextDocument, range: vscode.Range): Promise<string[]> {
        const text = document.getText(range);
        const importRegex = /import\s+.*?from\s+['"].*?['"]/g;
        return text.match(importRegex) || [];
    }

    private async analyzeContext(document: vscode.TextDocument, range: vscode.Range): Promise<CodeBlock | null> {
        try {
            const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
                'vscode.executeDocumentSymbolProvider',
                document.uri
            );

            if (!symbols) {return null;}

            // 查找包含当前范围的最近上下文
            const contextSymbol = this.findContextSymbol(symbols, range);
            if (!contextSymbol) {return null;}

            return {
                symbol: contextSymbol,
                type: this.getSymbolType(contextSymbol),
                children: [],
                context: {
                    name: contextSymbol.name,
                    kind: contextSymbol.kind
                }
            };

        } catch (error) {
            console.error('获取上下文失败:', error);
            return null;
        }
    }

    private findContextSymbol(symbols: vscode.DocumentSymbol[], range: vscode.Range): vscode.DocumentSymbol | null {
        for (const symbol of symbols) {
            if (this.isInRange(symbol.range, range)) {
                // 递归查找最近的上下文
                const childContext = symbol.children ? 
                    this.findContextSymbol(symbol.children, range) : null;
                return childContext || symbol;
            }
        }
        return null;
    }

    private getSymbolType(symbol: vscode.DocumentSymbol): CodeBlock['type'] {
        switch (symbol.kind) {
            case vscode.SymbolKind.Namespace:
            case vscode.SymbolKind.Module:
                return 'namespace';
            case vscode.SymbolKind.Class:
                return 'class';
            case vscode.SymbolKind.Method:
            case vscode.SymbolKind.Function:
                return 'method';
            default:
                return 'other';
        }
    }

    private createImportBlock(imports: string[]): CodeBlock {
        const range = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(imports.length - 1, imports[imports.length - 1].length)
        );

        return {
            symbol: new vscode.DocumentSymbol(
                'Imports',
                '',
                vscode.SymbolKind.Module,
                range,
                range
            ),
            type: 'other',
            children: [],
            context: {
                name: 'Imports',
                kind: vscode.SymbolKind.Module,
                imports
            }
        };
    }
} 