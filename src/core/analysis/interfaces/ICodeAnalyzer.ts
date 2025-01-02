import * as vscode from 'vscode';
import { CodeBlock } from '../../../types/CodeBlock';

export interface ICodeAnalyzer {
    analyze(document: vscode.TextDocument, range: vscode.Range): Promise<CodeBlock[]>;
} 