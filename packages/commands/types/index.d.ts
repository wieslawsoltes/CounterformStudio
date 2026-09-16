export function normalizeBinding(value: any): string;
export function matchesBinding(event: any, binding: any, isMac?: boolean): boolean;
export function formatBinding(binding: any, isMac?: boolean): string;
export function editableEvent(event: any): any;
export class CommandRegistry {
    constructor({ isMac, context }?: {
        isMac?: boolean;
        context?: () => string;
    });
    commands: Map<any, any>;
    bindings: Map<any, any>;
    changed: Signal;
    executed: Signal;
    errors: Signal;
    busy: Set<any>;
    isMac: boolean;
    context: () => string;
    register(command: any): () => void;
    canExecute(id: any): any;
    run(id: any, parameter: any): Promise<boolean>;
    attach(target: any, { capture }?: {
        capture?: boolean;
    }): () => any;
    conflicts(id: any, keys: any): {
        id: any;
        binding: any;
    }[];
    rebind(id: any, keys: any, { allowConflicts }?: {
        allowConflicts?: boolean;
    }): void;
    exportBindings(): {
        format: string;
        version: number;
        bindings: any;
    };
    importBindings(data: any): void;
    search(query?: string): any[];
    dispose(): void;
}
import { Signal } from '@wieslawsoltes/counterform-model';
