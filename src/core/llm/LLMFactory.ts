import { LLMProvider, LLMConfig } from '../../types/LLMConfig';
import { OpenAIProvider } from './providers';
import { BaseService } from '../services/BaseService';

export class LLMFactory extends BaseService<LLMFactory> {
    private providers: Map<string, new (config: LLMConfig) => LLMProvider>;

    public constructor() {
        super();
        this.providers = new Map([
            ['openai', OpenAIProvider]
        ]);
    }

    public registerProvider(type: string, provider: new (config: LLMConfig) => LLMProvider): void {
        this.providers.set(type, provider);
    }

    public createProvider(type: string, config: LLMConfig): LLMProvider {
        const Provider = this.providers.get(type);
        if (!Provider) {
            throw new Error(`不支持的 LLM 类型: ${type}`);
        }
        return new Provider(config);
    }
} 