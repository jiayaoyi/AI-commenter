import * as vscode from 'vscode';
import { BaseAnalyzer } from './BaseAnalyzer';
import { CodeBlock, TokenInfo } from '../../../types/CodeBlock';

interface SemanticToken {
    line: number;
    startChar: number;
    length: number;
    tokenType: number;
    tokenModifiers: number;
}

export class SemanticAnalyzer extends BaseAnalyzer {
    async analyze(document: vscode.TextDocument, range: vscode.Range): Promise<CodeBlock[]> {
        try {
            const tokens = await this.getSemanticTokens(document);
            if (!tokens) {return [];}
            
            const tokenTypes = await this.getTokenTypes(document);
            const tokenInfos = this.parseTokens(document, tokens, range, tokenTypes);
            
            return this.convertTokensToBlocks(tokenInfos);
        } catch (error) {
            console.error('语义分析失败:', error);
            return [];
        }
    }

    private async getSemanticTokens(document: vscode.TextDocument): Promise<{ data: Uint32Array } | undefined> {
        try {
            const tokens = await vscode.commands.executeCommand<{ data: Uint32Array }>(
                'vscode.provideDocumentSemanticTokens',
                document.uri
            );
            return tokens;
        } catch (error) {
            console.error('获取语义标记失败:', error);
            return undefined;
        }
    }

    private async getTokenTypes(document: vscode.TextDocument): Promise<string[]> {
        try {
            const legend = await vscode.commands.executeCommand<{ tokenTypes: string[] }>(
                'vscode.provideDocumentSemanticTokensLegend',
                document.uri
            );
            return legend?.tokenTypes || [];
        } catch (error) {
            console.error('获取语义标记类型失败:', error);
            return [];
        }
    }

    private parseTokens(
        document: vscode.TextDocument,
        tokens: { data: Uint32Array },
        range: vscode.Range,
        tokenTypes: string[]
    ): TokenInfo[] {
        const result: TokenInfo[] = [];
        const semanticTokens: SemanticToken[] = this.decodeTokens(tokens.data);

        for (const token of semanticTokens) {
            const tokenRange = new vscode.Range(
                new vscode.Position(token.line, token.startChar),
                new vscode.Position(token.line, token.startChar + token.length)
            );

            if (this.isInRange(tokenRange, range)) {
                const tokenType = tokenTypes[token.tokenType] || 'unknown';
                result.push({
                    type: this.getTokenType(tokenType),
                    range: tokenRange,
                    text: document.getText(tokenRange),
                    encoding: document.languageId
                });
            }
        }

        return result;
    }

    private decodeTokens(data: Uint32Array): SemanticToken[] {
        const tokens: SemanticToken[] = [];
        let line = 0;
        let charPos = 0;

        for (let i = 0; i < data.length; i += 5) {
            const [deltaLine, deltaStartChar, length, tokenType, tokenModifiers] = [
                data[i],
                data[i + 1],
                data[i + 2],
                data[i + 3],
                data[i + 4]
            ];

            line += deltaLine;
            charPos = deltaLine === 0 ? charPos + deltaStartChar : deltaStartChar;

            tokens.push({
                line,
                startChar: charPos,
                length,
                tokenType,
                tokenModifiers
            });
        }

        return tokens;
    }

    private getTokenType(semanticType: string): TokenInfo['type'] {
        const commentTypes = ['comment', 'docComment', 'blockComment', 'lineComment'];
        return commentTypes.includes(semanticType.toLowerCase()) ? 'comment' : 'code';
    }

    private convertTokensToBlocks(tokens: TokenInfo[]): CodeBlock[] {
        const blocks: CodeBlock[] = [];
        let currentCommentBlock: CodeBlock | undefined;

        for (const token of tokens) {
            if (token.type === 'comment') {
                if (!currentCommentBlock) {
                    currentCommentBlock = this.createCommentBlock(token);
                    blocks.push(currentCommentBlock);
                } else if (this.isAdjacentToken(currentCommentBlock.symbol.range, token.range)) {
                    // 合并相邻的注释
                    this.extendCommentBlock(currentCommentBlock, token);
                } else {
                    currentCommentBlock = this.createCommentBlock(token);
                    blocks.push(currentCommentBlock);
                }
            } else {
                currentCommentBlock = undefined;
                blocks.push(this.createCodeBlock(token));
            }
        }

        return blocks;
    }

    private createCommentBlock(token: TokenInfo): CodeBlock {
        return {
            symbol: new vscode.DocumentSymbol(
                token.text,
                '',
                vscode.SymbolKind.String,
                token.range,
                token.range
            ),
            type: 'other',
            children: []
        };
    }

    private createCodeBlock(token: TokenInfo): CodeBlock {
        return {
            symbol: new vscode.DocumentSymbol(
                token.text,
                '',
                vscode.SymbolKind.Variable,
                token.range,
                token.range
            ),
            type: 'other',
            children: []
        };
    }

    private isAdjacentToken(range1: vscode.Range, range2: vscode.Range): boolean {
        return range1.end.line === range2.start.line - 1 ||
               (range1.end.line === range2.start.line && 
                range1.end.character === range2.start.character);
    }

    private extendCommentBlock(block: CodeBlock, token: TokenInfo): void {
        const newRange = new vscode.Range(
            block.symbol.range.start,
            token.range.end
        );
        
        block.symbol = new vscode.DocumentSymbol(
            block.symbol.name + '\n' + token.text,
            '',
            vscode.SymbolKind.String,
            newRange,
            newRange
        );
    }
} 