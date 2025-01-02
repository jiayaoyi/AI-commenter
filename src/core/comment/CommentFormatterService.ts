import { BaseService } from '../services/BaseService';
import { CommentContext, CommentOptions, CommentStyle } from '../../types/Comment';
import { CodeBlock } from '../../types/CodeBlock';

export class CommentFormatterService extends BaseService<CommentFormatterService> {
    public formatComment(
        comment: string,
        context: CommentContext,
        options: CommentOptions = {}
    ): string {
        const { block, style, indent } = context;
        const { preferDocComment = true, keepIndentation = true } = options;

        if (this.shouldUseDocComment(block, preferDocComment) && style.docComment) {
            return this.formatDocComment(comment, style.docComment, indent, keepIndentation);
        } else if (style.blockComment && this.isMultilineComment(comment)) {
            return this.formatBlockComment(comment, style.blockComment, indent, keepIndentation);
        } else {
            return this.formatLineComment(comment, style.lineComment, indent, keepIndentation);
        }
    }

    private shouldUseDocComment(block: CodeBlock, preferDocComment: boolean): boolean {
        if (!preferDocComment) {return false;}
        return ['class', 'method', 'property'].includes(block.type);
    }

    private isMultilineComment(comment: string): boolean {
        return comment.includes('\n');
    }

    private formatDocComment(
        comment: string,
        [start, end]: [string, string],
        indent: string,
        keepIndentation: boolean
    ): string {
        const lines = comment.split('\n');
        const formattedLines = lines.map((line, index) => {
            const lineIndent = keepIndentation ? indent : '';
            if (index === 0) {return `${lineIndent}${start}`;}
            if (index === lines.length - 1) {return `${lineIndent} ${end}`;}
            return `${lineIndent} * ${line.trim()}`;
        });
        return formattedLines.join('\n');
    }

    private formatBlockComment(
        comment: string,
        [start, end]: [string, string],
        indent: string,
        keepIndentation: boolean
    ): string {
        const lines = comment.split('\n');
        const formattedLines = lines.map((line, index) => {
            const lineIndent = keepIndentation ? indent : '';
            if (index === 0) {return `${lineIndent}${start} ${line.trim()}`;}
            if (index === lines.length - 1) {return `${lineIndent} ${line.trim()} ${end}`;}
            return `${lineIndent} * ${line.trim()}`;
        });
        return formattedLines.join('\n');
    }

    private formatLineComment(
        comment: string,
        prefix: string,
        indent: string,
        keepIndentation: boolean
    ): string {
        const lineIndent = keepIndentation ? indent : '';
        return comment.split('\n')
            .map(line => `${lineIndent}${prefix} ${line.trim()}`)
            .join('\n');
    }
} 