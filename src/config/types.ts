export type Language = 'zh' | 'en';

export interface LLMConfig {
    type: string;
    apiKey: string;
    model: string;
    maxTokens: number;
}

export interface ExtensionConfig {
    defaultLLM: string;
    language: Language;
    llms: {
        [key: string]: LLMConfig;
    };
}

// 默认配置
export const DEFAULT_CONFIG: ExtensionConfig = {
    defaultLLM: 'openai',
    language: 'zh',
    llms: {
        openai: {
            type: 'openai',
            apiKey: '',
            model: 'gpt-4',
            maxTokens: 150
        },
        claude: {
            type: 'claude',
            apiKey: '',
            model: 'claude-2',
            maxTokens: 150
        }
    }
}; 