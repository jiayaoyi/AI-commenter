import * as vscode from 'vscode';

export class ConfigLoader {
    public static getAIConfig() {
        const config = vscode.workspace.getConfiguration('fastCommenter');
        
        return {
            type: 'openai',
            apiKey: config.get<string>('apiKey', ''),
            model: config.get<string>('model', 'gpt-3.5-turbo'),
            maxTokens: config.get<number>('maxTokens', 150),
            temperature: config.get<number>('temperature', 0.7)
        };
    }
} 