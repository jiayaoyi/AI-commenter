import { CodeBlock } from './CodeBlock';
import { CommentStyle } from './Comment';
import { CommentResult } from './Comment';

export interface LLMConfig {
    type: string;
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature?: number;
}

export interface LLMRequestConfig {
    model: string;
    temperature?: number;
    maxTokens?: number;
}

export interface LLMContext {
    language: string;
    blocks: CodeBlock[];
    commentStyle: CommentStyle;
    config?: {
        author?: string;
        [key: string]: any;
    };
    options: {
        preferDocComment: boolean;
        keepIndentation: boolean;
        insertNewline: boolean;
    };
}

export interface LLMProvider {
    generateComment(code: string, context: LLMContext): Promise<string>;
}