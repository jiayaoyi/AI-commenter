import * as vscode from 'vscode';

export interface FileContext {
    imports: string[];
    namespace?: string;
    className?: string;
    methodName?: string;
}

export interface TokenInfo {
    type: 'code' | 'comment';
    range: vscode.Range;
    text: string;
    encoding: string;
}

export interface CodeBlock {
    symbol: vscode.DocumentSymbol;
    type: 'class' | 'method' | 'property' | 'comment' | 'namespace' | 'other';
    children: CodeBlock[];
    parent?: CodeBlock;
    context?: {
        name: string;
        kind: vscode.SymbolKind;
        imports?: string[];
    };
} 