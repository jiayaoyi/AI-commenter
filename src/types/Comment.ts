import { CodeBlock } from './CodeBlock';

export interface CommentResult {
    lineNumber: number;
    type: 'block' | 'line';
    content: string;
}

export interface CommentStyle {
    lineComment: string;
    blockComment: [string, string];
    docComment: [string, string];
}

export interface CommentContext {
    block: CodeBlock;
    languageId: string;
    indent: string;
    style: CommentStyle;
}

export interface CommentOptions {
    preferDocComment?: boolean;
    keepIndentation?: boolean;
    insertNewline?: boolean;
}

export interface CommentHistoryEntry {
    timestamp: number;
    filePath: string;
    lineNumber: number;
    originalCode: string;
    comment: string;
    author?: string;
} 