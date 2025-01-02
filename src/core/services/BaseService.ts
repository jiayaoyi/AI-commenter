// 所有服务的基类
export abstract class BaseService<T> {
    private static _instance: any;
    
    public constructor() {}
    
    public static getInstance<T>(this: { new(): T } & typeof BaseService): T {
        if (!this._instance) {
            this._instance = new (this as { new(): T });
        }
        return this._instance;
    }
} 