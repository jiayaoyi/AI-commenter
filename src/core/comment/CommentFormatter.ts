import { BaseService } from '../services/BaseService';
import { CodeBlock } from '../../types/CodeBlock';
import { LanguageManager } from '../language/LanguageManager';

export class CommentFormatter extends BaseService<CommentFormatter> {
    private languageManager: LanguageManager;

    protected constructor() {
        super();
        this.languageManager = LanguageManager.getInstance<LanguageManager>();
    }

    public formatComment(comment: string, block: CodeBlock, languageId: string): string {
        const commentStyle = this.languageManager.getCommentStyle(languageId);
        const indent = this.getIndentation(block);

        switch (block.type) {
            case 'class':
            case 'method':
                return this.formatDocComment(comment, commentStyle.docComment || commentStyle.blockComment!, indent);
            default:
                return this.formatLineComment(comment, commentStyle.lineComment, indent);
        }
    }

    private formatDocComment(comment: string, [start, end]: [string, string], indent: string): string {
        const lines = comment.split('\n');
        const formattedLines = lines.map((line, index) => {
            if (index === 0) {return `${indent}${start}`;}
            if (index === lines.length - 1) {return `${indent} ${end}`;}
            return `${indent} * ${line.trim()}`;
        });
        return formattedLines.join('\n');
    }

    private formatLineComment(comment: string, prefix: string, indent: string): string {
        return `${indent}${prefix} ${comment}`;
    }

    private getIndentation(block: CodeBlock): string {
        const line = block.symbol.range.start.line;
        const text = block.symbol.range.start.character;
        return ' '.repeat(text);
    }
} 