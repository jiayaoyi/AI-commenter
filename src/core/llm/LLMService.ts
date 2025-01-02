import { BaseService } from '../services/BaseService';
import { LLMFactory } from './LLMFactory';
import { LLMConfig, LLMContext } from '../../types/LLMConfig';
import { CommentResult } from '../../types/Comment';

export class LLMService extends BaseService<LLMService> {
    private factory: LLMFactory;
    private config!: LLMConfig;

    public constructor() {
        super();
        this.factory = LLMFactory.getInstance<LLMFactory>();
    }

    public initialize(config: LLMConfig): void {
        this.config = config;
    }

    public async generateComment(code: string, context: LLMContext): Promise<string> {
        try {
            const provider = this.factory.createProvider('openai', this.config);
            return await provider.generateComment(code, context);
        } catch (error) {
            console.error('生成注释失败:', error);
            throw error;
        }
    }
} 