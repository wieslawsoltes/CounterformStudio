import { FontDocument } from '@wieslawsoltes/counterform-model';
import { compileTrueType, compileOpenTypeCFF, encodeWOFF, inspectFont } from '@wieslawsoltes/counterform-font-io';
import { compileVariableTrueType } from '@wieslawsoltes/counterform-variations';
import { validateFont } from '@wieslawsoltes/counterform-validation';
import { exportUFO } from '@wieslawsoltes/counterform-ufo';

/** Pure task dispatcher shared by browser workers, Node workers, and explicit inline mode. */
export function executeTask(kind, source, options = {}, progress = () => {}) {
    if (!['compile', 'validate', 'inspect'].includes(kind)) throw new TypeError(`Unknown compiler task: ${kind}`);
    progress({stage: 'validate', fraction: 0});
    const doc = new FontDocument(source);
    try {
        if (kind === 'validate') return {issues: validateFont(doc, options)};
        const format = options.format || 'ttf';
        if (!['ttf','otf','woff','variable','ufoz'].includes(format)) throw new TypeError(`Unsupported output format: ${format}`);
        if (options.validate) {
            const issues = validateFont(doc).filter(x => x.severity === 'error');
            if (issues.length) throw new Error(`${issues.length} font validation errors: ${issues[0].message}`);
        }
        progress({stage: 'compile', fraction: .2});
        const settings = {masterId: options.masterId || source.masters[0].id};
        if (!source.masters.some(m => m.id === settings.masterId)) throw new Error('Unknown source master');
        let bytes;
        if (format === 'variable') bytes = compileVariableTrueType(doc);
        else if (format === 'otf') bytes = compileOpenTypeCFF(doc, settings);
        else if (format === 'ufoz') bytes = exportUFO(doc, settings);
        else bytes = compileTrueType(doc, settings);
        if (format === 'woff') bytes = encodeWOFF(bytes);
        progress({stage: 'complete', fraction: 1});
        if (kind === 'inspect') {
            if (!['ttf','otf','variable'].includes(format)) throw new Error('Inspect requires an sfnt output');
            return {report: inspectFont(bytes), byteLength: bytes.byteLength};
        }
        return {bytes, format, mime: {ttf:'font/ttf',otf:'font/otf',woff:'font/woff',variable:'font/ttf',ufoz:'application/zip'}[format]};
    } finally { doc.dispose(); }
}
export function handleTask(message, send) {
    if (message?.protocol !== 1 || !Number.isSafeInteger(message.id) || message.id < 1) return;
    const {id, kind, source, options} = message;
    try {
        const result = executeTask(kind, source, options, value => send({protocol:1,id,type:'progress',value}));
        send({protocol:1,id,type:'result',value:result}, result.bytes ? [result.bytes.buffer] : []);
    } catch (error) {
        send({protocol:1,id,type:'error',error:{name:error.name || 'Error',message:String(error.message || error)}});
    }
}
