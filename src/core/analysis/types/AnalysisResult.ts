import { CodeBlock } from '../../../types/CodeBlock';

export interface AnalysisResult {
    blocks: CodeBlock[];
    context: {
        imports: string[];
        namespace?: string;
        className?: string;
        methodName?: string;
    };
    metrics: {
        complexity: number;
        lines: number;
        commentLines: number;
    };
} 