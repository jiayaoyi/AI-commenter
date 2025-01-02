import * as vscode from 'vscode';
import { BaseService } from '../services/BaseService';

export interface FastCommenterConfig {
    author?: string;
    language: 'zh' | 'en';
    defaultLanguage: string;
    maxHistorySize: number;
    commentOptions: {
        preferDocComment: boolean;
        keepIndentation: boolean;
        insertNewline: boolean;
    };
}

export class ConfigManager extends BaseService<ConfigManager> {
    private config: vscode.WorkspaceConfiguration;
    
    public constructor() {
        super();
        this.config = vscode.workspace.getConfiguration('fastCommenter');
    }

    public getConfig(): FastCommenterConfig {
        return {
            author: this.config.get('author'),
            language: this.config.get('language', 'en'),
            defaultLanguage: this.config.get('defaultLanguage', 'en'),
            maxHistorySize: this.config.get('maxHistorySize', 100),
            commentOptions: {
                preferDocComment: this.config.get('commentOptions.preferDocComment', true),
                keepIndentation: this.config.get('commentOptions.keepIndentation', true),
                insertNewline: this.config.get('commentOptions.insertNewline', true)
            }
        };
    }

    public async updateConfig(settings: Partial<FastCommenterConfig>): Promise<void> {
        for (const [key, value] of Object.entries(settings)) {
            await this.config.update(key, value, vscode.ConfigurationTarget.Global);
        }
    }
} 