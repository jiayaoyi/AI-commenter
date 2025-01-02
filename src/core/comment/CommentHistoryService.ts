import { BaseService } from '../services/BaseService';
import { CommentHistoryEntry } from '../../types/Comment';

export class CommentHistoryService extends BaseService<CommentHistoryService> {
    private history: CommentHistoryEntry[] = [];
    private maxHistorySize = 100;

    public addEntry(entry: CommentHistoryEntry): void {
        this.history.unshift(entry);
        if (this.history.length > this.maxHistorySize) {
            this.history.pop();
        }
    }

    public getHistory(): CommentHistoryEntry[] {
        return [...this.history];
    }

    public getHistoryForFile(filePath: string): CommentHistoryEntry[] {
        return this.history.filter(entry => entry.filePath === filePath);
    }

    public clearHistory(): void {
        this.history = [];
    }

    public setMaxHistorySize(size: number): void {
        this.maxHistorySize = size;
        if (this.history.length > size) {
            this.history = this.history.slice(0, size);
        }
    }
} 