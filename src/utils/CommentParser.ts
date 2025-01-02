import { CommentResult } from '../types/Comment';

export class CommentParser {
    public static parseCommentResponse(response: string): CommentResult[] {
        const comments: CommentResult[] = [];
        const lines = response.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            const match = line.match(/^(\d+):(block|line):(.+)$/);
            if (match) {
                const [, lineNumber, type, content] = match;
                comments.push({
                    lineNumber: parseInt(lineNumber, 10),
                    type: type as 'block' | 'line',
                    content: content.trim()
                });
            }
        }
        
        return comments;
    }
} 