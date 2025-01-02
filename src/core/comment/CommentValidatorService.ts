import { BaseService } from '../services/BaseService';
import { CodeBlock } from '../../types/CodeBlock';
import { ConfigManager } from '../config/ConfigManager';

export class CommentValidatorService extends BaseService<CommentValidatorService> {
    private configManager: ConfigManager;

    public constructor() {
        super();
        this.configManager = ConfigManager.getInstance();
    }

    public validateComment(comment: string, block: CodeBlock): string[] {
        const errors: string[] = [];
        const config = this.configManager.getConfig();
        
        // 解析注释类型和内容
        const [type, content] = comment.split(':', 2);
        
        if (!content) {
            return ['注释格式不正确'];
        }

        // 检查注释长度
        if (content.length > 1000) {
            errors.push(config.language === 'zh' ? '注释过长，建议精简' : 'Comment is too long');
        }

        // 检查注释格式
        if (type === 'block') {
            // 对于块注释，不进行格式验证
            if (block.type === 'method' && !this.hasMethodCommentElements(comment)) {
                // 只对方法的块注释检查参数和返回值
                if (!comment.includes('参数') && !comment.includes('param') &&
                    !comment.includes('返回') && !comment.includes('return')) {
                    errors.push(config.language === 'zh' 
                        ? '方法注释缺少必要元素（参数说明、返回值等）'
                        : 'Method comment missing required elements (params, return value)');
                }
            }
        }

        return errors;
    }

    private hasMethodCommentElements(comment: string): boolean {
        // 检查是否包含参数或返回值的说明
        return comment.includes('参数') || 
               comment.includes('param') ||
               comment.includes('返回') ||
               comment.includes('return');
    }
} 