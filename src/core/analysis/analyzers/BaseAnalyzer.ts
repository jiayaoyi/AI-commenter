import * as vscode from 'vscode';
import { CodeBlock } from '../../../types/CodeBlock';

export abstract class BaseAnalyzer {
    abstract analyze(document: vscode.TextDocument, range: vscode.Range): Promise<CodeBlock[]>;
    
    protected isInRange(symbolRange: vscode.Range, targetRange: vscode.Range): boolean {
        return symbolRange.start.line <= targetRange.end.line && 
               symbolRange.end.line >= targetRange.start.line;
    }
} 