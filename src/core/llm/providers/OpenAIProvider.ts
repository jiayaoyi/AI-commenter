import { Configuration, OpenAIApi } from 'openai';
import { LLMProvider, LLMConfig, LLMContext } from '../../../types/LLMConfig';
import { CommentResult } from '../../../types/Comment';
import { buildPrompt } from '../../../config/prompts';
import { CommentParser } from '../../../utils/CommentParser';

export class OpenAIProvider implements LLMProvider {
    private openai: OpenAIApi;
    private config: LLMConfig;

    constructor(config: LLMConfig) {
        this.config = config;
        const configuration = new Configuration({
            apiKey: config.apiKey
        });
        this.openai = new OpenAIApi(configuration);
    }

    public async generateComment(code: string, context: LLMContext): Promise<string> {
        try {
            console.log('发送给 OpenAI 的代码:\n', code);
            
            const response = await this.openai.createChatCompletion({
                model: this.config.model,
                messages: [
                    {
                        role: "user",
                        content: buildPrompt(code, context)
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            });

            let content = response.data.choices[0]?.message?.content || '';
            
            // 清理代码块标记
            content = content.replace(/^```\w*\n?/, '');  // 移除开头的 ```
            content = content.replace(/```$/, '');        // 移除结尾的 ```
            content = content.trim();                     // 移除多余的空行

            console.log('清理后的代码:\n', content);
            return content;
        } catch (error) {
            console.error('生成注释失败:', error);
            throw error;
        }
    }

    private parseResponse(response: string): CommentResult[] {
        return CommentParser.parseCommentResponse(response);
    }
} 