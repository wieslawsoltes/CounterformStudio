#!/usr/bin/env node
export type GeneratedValueType = 'string' | 'number' | 'boolean' | 'object' | 'unknown' | 'string[]' | 'number[]' | 'boolean[]';
export interface GeneratedValidation {
    required?: boolean;
    minimum?: number;
    maximum?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
}
export interface GeneratedPropertySchema {
    initial: unknown;
    type?: GeneratedValueType;
    nullable?: boolean;
    validate?: GeneratedValidation;
    dependents?: string[];
}
export interface GeneratedComputedSchema {
    source: string;
    type?: GeneratedValueType;
    nullable?: boolean;
    initialValue?: unknown;
    deferSubscription?: boolean;
}
export interface GeneratedCommandSchema {
    execute: string;
    kind?: 'sync' | 'task' | 'observable';
    canExecute?: string;
    inputType?: GeneratedValueType | 'void';
    outputType?: GeneratedValueType | 'void';
}
export interface GenerationSchema {
    className: string;
    /** Map of local factory/export names to their module specifiers. */
    imports?: Record<string, string>;
    properties?: Record<string, GeneratedPropertySchema>;
    computed?: Record<string, GeneratedComputedSchema>;
    commands?: Record<string, GeneratedCommandSchema>;
}
export interface GenerationOptions {
    language?: 'ts' | 'js';
    moduleName?: string;
}
/** Validates names, imported factories, types, validation rules, and collisions. */
export declare function ValidateGenerationSchema(value: unknown): asserts value is GenerationSchema;
/** Generates reviewable ESM source, without eval or embedding executable expressions from JSON. */
export declare function GenerateViewModelSource(schema: GenerationSchema, options?: GenerationOptions): string;
/** CLI implementation exported separately so invocation/validation can be tested. */
export declare function RunGenerator(args: readonly string[], io?: {
    stdout: (text: string) => void;
    stderr: (text: string) => void;
}): Promise<number>;
//# sourceMappingURL=generator-cli.d.ts.map