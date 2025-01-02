declare module 'comment-patterns' {
    interface CommentPattern {
        line?: string;
        block?: [string, string];
        doc?: [string, string];
    }
    
    function patterns(languageId: string): CommentPattern;
    export = patterns;
} 