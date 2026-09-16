export function download(data: any, name: any, type?: string): void;
export function parseProject(text: any): any;
export function chooseFile({ accept }?: {
    accept?: string;
}): Promise<any>;
export class ProjectStore {
    constructor({ name }?: {
        name?: string;
    });
    name: string;
    db: any;
    open(): Promise<any>;
    save(document: any): Promise<any>;
    list(): Promise<any>;
    load(id: any): Promise<any>;
    remove(id: any): Promise<void>;
    preference(key: any, value: any, ...args: any[]): Promise<any>;
    close(): void;
}
export class Autosave {
    constructor(document: any, store: any, { delay, onStatus }?: {
        delay?: number;
        onStatus?: () => void;
    });
    document: any;
    store: any;
    delay: number;
    status: () => void;
    timer: number;
    closed: boolean;
    pending: boolean;
    off: any;
    flush(): Promise<void>;
    again: boolean;
    dispose(): void;
}
