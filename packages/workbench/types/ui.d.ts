export function button(label: any, action: any, { className, title }?: {
    className?: string;
    title?: any;
}): any;
export function toast(message: any, kind?: string): void;
export function dialog(title: any, { subtitle, className, wide }?: {
    subtitle?: string;
    className?: string;
    wide?: boolean;
}): {
    element: any;
    body: any;
    footer: any;
    close: () => any;
};
export function field(label: any, value: any, { type, min, max, step, placeholder, options }?: {
    type?: string;
    placeholder?: string;
    options?: any;
}): {
    element: any;
    input: any;
};
export function section(title: any, { extra }?: {
    extra?: any;
}): {
    element: any;
    head: any;
};
export function setValue(input: any, value: any): void;
export function formDialog(title: any, fields: any, { subtitle, submit, onSubmit, wide }?: {
    subtitle?: string;
    submit?: string;
    onSubmit?: () => void;
    wide?: boolean;
}): Promise<{
    element: any;
    body: any;
    footer: any;
    close: () => any;
}>;
export function renderCommandButtons(host: any, registry: any, ids: any): void;
export function el(tag: any, cls?: string, text?: string): any;
export { escapeHTML };
import { escapeHTML } from '@wieslawsoltes/counterform-integrations';
