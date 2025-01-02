import * as vscode from 'vscode';
import { BaseService } from '../services/BaseService';
import { CommentStyle } from '../../types/Comment';

export interface LanguageInfo {
    id: string;
    name: string;
    extensions: string[];
    commentStyle: CommentStyle;
}

export class LanguageManager extends BaseService<LanguageManager> {
    private languageMap: Map<string, LanguageInfo>;

    public constructor() {
        super();
        this.languageMap = new Map();
        this.initializeLanguages();
    }

    private async initializeLanguages() {
        // 获取 VSCode 支持的所有语言
        const languages = await vscode.languages.getLanguages();
        
        for (const langId of languages) {
            try {
                // 获取语言配置
                const config = await this.getLanguageConfiguration(langId);
                if (config) {
                    this.addLanguage({
                        id: langId,
                        name: langId,
                        extensions: [],  // VSCode 会自动处理文件扩展名
                        commentStyle: {
                            lineComment: config.lineComment || '//',
                            blockComment: config.blockComment || ['/*', '*/'],
                            docComment: config.blockComment || ['/**', '*/']
                        }
                    });
                }
            } catch (error) {
                console.warn(`无法加载语言配置: ${langId}`, error);
                this.addDefaultLanguage(langId);
            }
        }
    }

    private async getLanguageConfiguration(languageId: string): Promise<any> {
        try {
            // 尝试获取语言配置
            return await vscode.workspace.getConfiguration('', { languageId }).get('[' + languageId + ']');
        } catch (error) {
            return null;
        }
    }

    private addLanguage(info: LanguageInfo) {
        this.languageMap.set(info.id, info);
    }

    private addDefaultLanguage(langId: string) {
        this.addLanguage({
            id: langId,
            name: langId,
            extensions: [],
            commentStyle: {
                lineComment: '//',
                blockComment: ['/*', '*/'],
                docComment: ['/**', '*/']
            }
        });
    }

    public getLanguageInfo(fileName: string): LanguageInfo {
        const document = vscode.workspace.textDocuments.find(doc => doc.fileName === fileName);
        if (document) {
            const langInfo = this.languageMap.get(document.languageId);
            if (langInfo) {
                return langInfo;
            }
        }
        return this.getDefaultLanguageInfo();
    }

    public getCommentStyle(languageId: string): CommentStyle {
        const langInfo = this.languageMap.get(languageId);
        return langInfo?.commentStyle || this.getDefaultCommentStyle();
    }

    private getDefaultLanguageInfo(): LanguageInfo {
        return {
            id: 'plaintext',
            name: 'Plain Text',
            extensions: ['.txt'],
            commentStyle: this.getDefaultCommentStyle()
        };
    }

    private getDefaultCommentStyle(): CommentStyle {
        return {
            lineComment: '//',
            blockComment: ['/*', '*/'],
            docComment: ['/**', '*/']
        };
    }
} 