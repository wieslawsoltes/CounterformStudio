import {CompilerClient} from '@wieslawsoltes/counterform-compiler';
/** The proof is shaped from freshly compiled font bytes, not a substitute system font. */
export class FontProof {
    constructor(host: any, doc: any, { masterId, delay }?: {
        masterId?: any;
        delay?: number; compiler?: CompilerClient;
    });
    compiler: CompilerClient;
    changed: Signal;
    errors: Signal;
    host: any;
    doc: any;
    masterId: any;
    delay: number;
    family: string;
    generation: number;
    text: string;
    size: number;
    features: string;
    variable: boolean;
    location: {};
    tracking: number;
    waterfall: boolean;
    disposed: boolean;
    content: HTMLDivElement;
    off: any;
    schedule(delay?: number): void;
    timer: number;
    compile(): Promise<void>;
    face: FontFace;
    update(options?: {}): void;
    render(): void;
    dispose(): void;
}
import { Signal } from '@wieslawsoltes/counterform-model';
