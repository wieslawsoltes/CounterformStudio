import {attachmentParser,isAttachment,compileAttachments} from './attachments.js';
import { Writer } from '@wieslawsoltes/counterform-binary';

/** Source-aware FEA parser. Unsupported constructs fail before a table is emitted. */
export function parseFeatures(source, glyphNames = []) {
    if (typeof source !== 'string' || source.length > 2_000_000) throw new RangeError('Feature source budget exceeded');
    const tokens = [...source.replace(/#[^\n]*/g, s => ' '.repeat(s.length))
        .matchAll(/\\[\w.$-]+|@[\w.]+|[A-Za-z_.$][\w.$-]*|-?\d+|\S/g)]
        .map(m => ({ value: m[0], offset: m.index }));
    const classes = new Map(), features = [], lookups = new Map(), languages = [], values = new Map();
    if(tokens.length>300000)throw new RangeError('Feature token budget exceeded');
    const names = new Set(glyphNames);
    let cursor = 0, ruleCount = 0;
    const markFilteringSets = [], markAttachmentClasses = [];
    const peek = () => tokens[cursor]?.value;
    const take = () => tokens[cursor++]?.value;
    const fail = (message, token = tokens[cursor - 1]) => {
        const offset = token?.offset ?? source.length;
        const line = source.slice(0, offset).split('\n').length;
        const column = offset - source.lastIndexOf('\n', offset - 1);
        const error = new SyntaxError(`${message} (line ${line}, column ${column})`);
        Object.assign(error, { line, column, offset }); throw error;
    };
    const expect = text => { if (take() !== text) fail(`Expected '${text}'`); };
    const tag = (language = false) => { const t = take(); if (!(language ? /^[\x20-\x7e]{1,4}$/ : /^[\x20-\x7e]{4}$/).test(t || '')) fail('Tags require four ASCII characters'); return t.padEnd(4, ' '); };
    const number = () => { const s = take(), n = Number(s); if (!/^-?\d+$/.test(s || '') || n < -32768 || n > 32767) fail('Expected int16 value'); return n; };
    const glyph = s => {
        if (!s || !/^(?:\\)?[\w.$][\w.$-]*$/.test(s)) fail('Expected glyph name');
        s = s.replace(/^\\/, '');
        if (names.size && !names.has(s)) fail(`Unknown glyph '${s}'`); return s;
    };
    function group() {
        const t = take();
        if (t?.startsWith('@')) { if (!classes.has(t)) fail(`Unknown class ${t}`); return {glyphs:[...classes.get(t).glyphs],class:true}; }
        if (t !== '[') return { glyphs: [glyph(t)], class: false };
        const result = [];
        while (peek() !== ']') {
            if (!peek()) fail('Unclosed glyph class');
            if (peek().startsWith('@')) {
                const name = take(); if (!classes.has(name)) fail(`Unknown class ${name}`);
                result.push(...classes.get(name).glyphs);
            } else result.push(glyph(take()));
            if (result.length > 65535) fail('Glyph class budget exceeded');
        }
        expect(']'); if (!result.length) fail('Empty glyph class');
        return { glyphs: [...new Set(result)], class: true };
    }
    // Named classes are immutable values, never aliases to mutable parser state.
    function readGroup() {
        if (peek()?.startsWith('@')) {
            const t = take(); if (!classes.has(t)) fail(`Unknown class ${t}`);
            return { glyphs: [...classes.get(t).glyphs], class: true };
        }
        return group();
    }
    const attachments = attachmentParser({peek,take,expect,number,readGroup,fail,classes});
    function value() {
        if (peek() !== '<') return [0, 0, number(), 0];
        take();
        if (values.has(peek())) { const result = values.get(take()); expect('>'); return [...result]; }
        if (peek() === 'NULL') { take(); expect('>'); return [0, 0, 0, 0]; }
        const result = [number(), number(), number(), number()]; expect('>'); return result;
    }
    function sequence(stop) {
        const items = [];
        while (!stop.has(peek())) {
            if (!peek() || peek() === '}') fail('Unterminated layout rule');
            const item = { ...readGroup(), marked: false, lookups: [] };
            if (peek() === "'") { take(); item.marked = true; }
            while (peek() === 'lookup') { take(); const name = take(); if (!name) fail('Missing lookup label'); item.lookups.push(name); }
            if (peek() === '<' || /^-?\d+$/.test(peek() || '')) item.value = value();
            items.push(item); if (items.length > 64) fail('Context sequence budget exceeded');
        }
        if (!items.length) fail('Expected glyph sequence'); return items;
    }
    function substitution(op, ignore = false) {
        const input = sequence(new Set(['by', 'from', ';', ',']));
        let output = [], outputClass = false, alternate = false, replacement = false;
        if (peek() === 'by' || peek() === 'from') {
            alternate = take() === 'from'; replacement = true;
            if (ignore) fail('Ignore rules must not have replacements');
            if (peek() === 'NULL') take();
            else while (peek() !== ';') { const g = readGroup(); output.push(g.glyphs); outputClass ||= g.class; if (output.length > 64) fail('Replacement budget exceeded'); }
        }
        if (peek() !== ',' && peek() !== ';') fail('Unterminated substitution');
        if (ignore && peek() === ',') fail('Use separate ignore statements instead of comma-separated exceptions');
        expect(';');
        const marked = input.some(x => x.marked);
        if (ignore && !marked) input.forEach(x => x.marked = true);
        const contextual = marked || ignore || input.some(x => x.lookups.length);
        if (!replacement && !ignore && !input.some(x=>x.lookups.length)) fail("Expected 'by', 'from', or a named lookup");
        if (contextual) {
            const first = input.findIndex(x => x.marked), last = input.findLastIndex(x => x.marked);
            if (first < 0 || input.slice(first, last + 1).some(x => !x.marked)) fail('Marked input must be contiguous');
            if (alternate) fail('Use a named alternate lookup inside a context');
            return { type: op.startsWith('r') ? 'reverse' : 'contextSub', input, output, outputClass, replacement, first, last, ignore };
        }
        if (op.startsWith('r')) fail('Reverse substitution needs one marked input');
        if (!output.length && input.length !== 1) fail('Deletion needs one input glyph');
        if (alternate) {
            if (input.length !== 1 || input[0].glyphs.length !== 1 || output.length !== 1) fail('Alternate substitution needs one glyph and one output class');
            return { type: 'alternate', from: input[0].glyphs[0], to: output[0] };
        }
        if (input.length === 1 && output.length !== 1) {
            if (input[0].glyphs.length !== 1 || output.some(a => a.length !== 1)) fail('Multiple substitution needs a single input and explicit output glyphs');
            return { type: 'multiple', from: input[0].glyphs[0], to: output.map(a => a[0]) };
        }
        if (input.length === 1) {
            const from = input[0].glyphs, to = output[0];
            if (to.length !== 1 && to.length !== from.length) fail('Substitution classes must have equal length');
            return from.map((g, i) => ({ type: 'single', from: g, to: to.length === 1 ? to[0] : to[i] }));
        }
        if (output.length !== 1 || output[0].length !== 1) fail('Ligature substitution needs one output glyph');
        let combinations = [[]];
        for (const item of input) {
            if (combinations.length * item.glyphs.length > 4096) fail('Ligature class expansion budget exceeded');
            combinations = combinations.flatMap(s => item.glyphs.map(g => [...s, g]));
        }
        return combinations.map(s => ({ type: 'ligature', input: s, output: output[0][0] }));
    }
    function positioning(ignore = false) {
        if (!ignore) { const rule = attachments.positioning(); if (rule) return rule; }
        const input = sequence(new Set([';'])); expect(';');
        if (input.some(x => x.marked) || ignore) {
            if (ignore && !input.some(x => x.marked)) input.forEach(x => x.marked = true);
            const first = input.findIndex(x => x.marked), last = input.findLastIndex(x => x.marked);
            if (input.slice(first, last + 1).some(x => !x.marked)) fail('Marked input must be contiguous');
            if (input.some(x => !x.marked && (x.value || x.lookups.length))) fail('Only marked inputs may have adjustments');
            return { type: 'contextPos', input, first, last, ignore };
        }
        if (input.length === 1 && input[0].value)
            return input[0].glyphs.map(g => ({ type: 'singlePos', glyph: g, value: input[0].value }));
        if (input.length !== 2 || !input.some(x => x.value)) fail('Expected single, pair, or marked contextual positioning');
        const left = input[0], right = input[1], v1 = left.value || right.value, v2 = left.value ? right.value || [0, 0, 0, 0] : [0, 0, 0, 0];
        if (left.glyphs.length * right.glyphs.length > 500000) fail('Position class expansion budget exceeded');
        return left.glyphs.flatMap(l => right.glyphs.map(r => ({ type: 'pairFull', left: l, right: r, value1: v1, value2: v2 })));
    }
    function block(end, inherited = {}) {
        const rules = []; let flags = 0, markFilteringSet = null, script = inherited.script ?? null, language = 'dflt', exclude = false, required = false;
        while (peek() !== end) {
            if (!peek()) fail('Unclosed feature/lookup block');
            const token = tokens[cursor], op = take(); let result;
            if (op === 'script') { script = tag(); language = 'dflt'; exclude = false; required = false; flags = 0; markFilteringSet = null; expect(';'); continue; }
            if (op === 'language') {
                if (!script) script = 'DFLT'; language = tag(true); exclude = false; required = false;
                while (peek() !== ';') { const option = take(); if (option === 'exclude_dflt') exclude = true; else if (option === 'include_dflt') exclude = false; else if (option === 'required') required = true; else fail('Unsupported language option'); }
                expect(';'); continue;
            }
            if (attachments.declaration(op)) continue;
            if (op === 'lookupflag') {
                flags = 0; markFilteringSet = null;
                const bits = { RightToLeft: 1, IgnoreBaseGlyphs: 2, IgnoreLigatures: 4, IgnoreMarks: 8 }, seen = new Set();
                while (peek() !== ';') {
                    if (!peek()) fail('Unclosed lookupflag');
                    const f = take(); if (f === '0') continue;
                    if (seen.has(f)) fail(`Duplicate lookup flag '${f}'`); seen.add(f);
                    if (Object.hasOwn(bits,f)) { flags |= bits[f]; continue; }
                    if (f !== 'UseMarkFilteringSet' && f !== 'MarkAttachmentType') fail(`Unsupported lookup flag '${f}'`);
                    const names = readGroup().glyphs.slice().sort(), list = f === 'UseMarkFilteringSet' ? markFilteringSets : markAttachmentClasses;
                    let index = list.findIndex(a => JSON.stringify(a) === JSON.stringify(names));
                    if (index < 0) { if (list.length >= (f === 'UseMarkFilteringSet' ? 256 : 255)) fail('Mark flag class budget exceeded'); index = list.push(names) - 1; }
                    if (f === 'UseMarkFilteringSet') { flags |= 16; markFilteringSet = index; }
                    else flags |= (index + 1) << 8;
                }
                expect(';'); continue;
            }
            if (op === 'lookup') {
                const name = take(); if (!name || lookups.has(name) && peek() !== ';') fail('Duplicate or missing lookup label');
                if (peek() === 'useExtension') take();
                if (peek() === '{') {
                    take(); const body = block('}'); expect('}'); expect(name); expect(';');
                    lookups.set(name, body); result = { type: 'lookup', name };
                } else { expect(';'); result = { type: 'lookup', name }; }
            } else if (op === 'subtable') { expect(';'); result = { type: 'break' }; }
            else if (['sub', 'substitute', 'rsub', 'reversesub'].includes(op)) result = substitution(op);
            else if (['pos', 'position'].includes(op)) result = positioning();
            else if (op === 'ignore') { const verb = take(); if (['sub', 'substitute'].includes(verb)) result = substitution('sub', true); else if (['pos', 'position'].includes(verb)) result = positioning(true); else fail('Expected sub or pos after ignore'); }
            else fail(`Unsupported feature statement '${op}'`, token);
            for (const r of [result].flat()) {
                rules.push({ ...r, flags, markFilteringSet, script, language, exclude, required, offset: token.offset });
                if (++ruleCount > 100000) fail('Layout rule budget exceeded');
            }
        }
        return rules;
    }
    while (cursor < tokens.length) {
        const op = take();
        if (attachments.declaration(op)) continue;
        if (op.startsWith('@')) { expect('='); const g = readGroup(); expect(';'); if (classes.has(op)) fail(`Duplicate class ${op}`); classes.set(op, g); }
        else if (op === 'languagesystem') { const script = tag(), language = tag(true); expect(';'); if (!languages.some(s => s.script === script && s.language === language)) languages.push({ script, language }); }
        else if (op === 'valueRecordDef') { const v = value(), name = take(); expect(';'); if (values.has(name)) fail('Duplicate value definition'); values.set(name, v); }
        else if (op === 'feature') { const name = tag(); expect('{'); const rules = block('}'); expect('}'); expect(name); expect(';'); features.push({ tag: name, rules }); }
        else if (op === 'lookup') { const name = take(); if (peek() === 'useExtension') take(); expect('{'); const rules = block('}'); expect('}'); expect(name); expect(';'); if (lookups.has(name)) fail(`Duplicate lookup ${name}`); lookups.set(name, rules); }
        else fail(`Unsupported feature syntax '${op}'`);
    }
    if (!languages.length) languages.push({ script: 'DFLT', language: 'dflt' }, { script: 'latn', language: 'dflt' });
    if (languages.length > 256 || lookups.size > 8192) throw new RangeError('Layout declarations exceed budget');
    return { ...attachments.result(), markFilteringSets, markAttachmentClasses, classes: Object.fromEntries([...classes].map(([k, v]) => [k, v.glyphs])), features, lookups: Object.fromEntries(lookups), languages };
}

const patch = (w, p, n) => { if (n < 0 || n > 65535) throw new RangeError('Layout subtable offset exceeds uint16'); w.patch16(p, n); };
const coverage = ids => { const sorted = [...new Set(ids)].sort((a, b) => a - b); const w = new Writer().u16(1).u16(sorted.length); sorted.forEach(id => w.u16(id)); return w.finish(); };
const cv = (w, p, ids) => { patch(w, p, w.pos); w.raw(coverage(ids)); };
const val = (w, v) => { v.forEach(n => w.i16(n)); };

function simple(r, gid) {
    const w = new Writer();
    if (r.type === 'single') return { type: 1, bytes: w.u16(2).u16(8).u16(1).u16(gid(r.to)).raw(coverage([gid(r.from)])).finish() };
    if (r.type === 'multiple' || r.type === 'alternate') {
        w.u16(1).u16(0).u16(1).u16(8).u16(r.to.length); r.to.forEach(g => w.u16(gid(g))); cv(w, 2, [gid(r.from)]);
        return { type: r.type === 'multiple' ? 2 : 3, bytes: w.finish() };
    }
    if (r.type === 'ligature') {
        w.u16(1).u16(0).u16(1).u16(8).u16(1).u16(4).u16(gid(r.output)).u16(r.input.length);
        r.input.slice(1).forEach(g => w.u16(gid(g))); cv(w, 2, [gid(r.input[0])]); return { type: 4, bytes: w.finish() };
    }
    if (r.type === 'singlePos') {
        w.u16(1).u16(14).u16(15); val(w, r.value); w.raw(coverage([gid(r.glyph)])); return { type: 1, bytes: w.finish() };
    }
    if (r.type === 'pairFull' || r.type === 'pair') {
        w.u16(1).u16(0).u16(15).u16(15).u16(1).u16(12).u16(1).u16(gid(r.right));
        val(w, r.value1 || [0, 0, r.value, 0]); val(w, r.value2 || [0, 0, 0, 0]); cv(w, 2, [gid(r.left)]); return { type: 2, bytes: w.finish() };
    }
    throw new Error(`Unknown layout rule '${r.type}'`);
}

/** Build context lookups without executing feature code or requiring a host compiler. */
export function compileFeatureLookups(parsed, glyphs) {
    const ids = new Map(glyphs.map((g, i) => [g.name, i]));
    const gid = name => { if (!ids.has(name)) throw new Error(`Unknown exported glyph '${name}'`); return ids.get(name); };
    const sub = [], pos = [], sf = new Map(), pf = new Map(), named = new Map(), visiting = new Set(), selections = { sub: [], pos: [] };
    let totalBytes = 0;
    const family = r => (isAttachment(r.type) || ['singlePos', 'pair', 'pairFull', 'contextPos'].includes(r.type)) ? 'pos' : 'sub';
    const lists = { sub, pos };
    function insert(which, lookup) {
        totalBytes += lookup.subtables.reduce((n, b) => n + b.length, 0);
        if (totalBytes > 32 * 1024 * 1024 || lists[which].length >= 8192) throw new RangeError('Compiled layout budget exceeded');
        return lists[which].push(lookup) - 1;
    }
    function namedLookup(name) {
        if (named.has(name)) return named.get(name);
        if (visiting.has(name) || visiting.size > 32) throw new Error(`Cyclic/excessively deep lookup reference '${name}'`);
        const rules = Object.hasOwn(parsed.lookups,name) ? parsed.lookups[name] : null; if (!rules) throw new Error(`Unknown lookup '${name}'`);
        visiting.add(name); const result = compileRules(rules); visiting.delete(name);
        if (new Set(result.map(x => x.which)).size > 1) throw new Error(`Lookup '${name}' mixes GSUB and GPOS`);
        named.set(name, result); return result;
    }
    function context(r, which) {
        const before = r.input.slice(0, r.first).toReversed(), input = r.input.slice(r.first, r.last + 1), after = r.input.slice(r.last + 1);
        if (r.type === 'reverse') {
            if (input.length !== 1 || r.output.length !== 1 || r.input.some(x => x.lookups.length)) throw new Error('Reverse substitution needs one input and one replacement class');
            const from = input[0].glyphs, to = r.output[0];
            if (to.length !== 1 && to.length !== from.length) throw new Error('Reverse replacement class length mismatch');
            const pairs = from.map((g, i) => [gid(g), gid(to.length === 1 ? to[0] : to[i])]).sort((a, b) => a[0] - b[0]);
            const w = new Writer().u16(1).u16(0), offsets = [];
            for (const seq of [before, after]) { w.u16(seq.length); for (const g of seq) { offsets.push([w.pos, g.glyphs.map(gid)]); w.u16(0); } }
            w.u16(pairs.length); pairs.forEach(p => w.u16(p[1])); cv(w, 2, pairs.map(p => p[0])); offsets.forEach(([p, ids]) => cv(w, p, ids));
            return { type: 8, bytes: w.finish() };
        }
        const actions = [];
        if (!r.ignore) {
            input.forEach((g, index) => {
                for (const name of g.lookups) for (const ref of namedLookup(name)) {
                    if (ref.which !== which) throw new Error('Context references a lookup from the other layout table');
                    actions.push([index, ref.index]);
                }
                if (g.value) { if (which !== 'pos') throw new Error('Substitution cannot contain value records');
                    const bytes = g.glyphs.map(n => simple({ type: 'singlePos', glyph: n, value: g.value }, gid).bytes);
                    actions.push([index, insert('pos', { type: 1, flags: r.flags, markFilteringSet: r.markFilteringSet, subtables: bytes })]);
                }
            });
            if (which === 'sub' && r.replacement) {
                if (actions.length) throw new Error('Context cannot combine explicit lookup calls and inline replacement');
                let rules;
                if (input.length === 1 && r.output.length === 1 && (r.outputClass || r.output[0].length === 1)) {
                    const a = input[0].glyphs, b = r.output[0]; if (b.length !== 1 && b.length !== a.length) throw new Error('Context replacement class length mismatch');
                    rules = a.map((g, i) => ({ type: 'single', from: g, to: b.length === 1 ? b[0] : b[i] }));
                } else if (input.length === 1 && input[0].glyphs.length === 1 && r.output.every(g => g.length === 1)) {
                    rules = [{ type: 'multiple', from: input[0].glyphs[0], to: r.output.map(g => g[0]) }];
                } else {
                    if (r.output.length !== 1 || r.output[0].length !== 1) throw new Error('Context ligature needs one output');
                    let seqs = [[]]; for (const g of input) { if (seqs.length * g.glyphs.length > 4096) throw new RangeError('Context ligature budget'); seqs = seqs.flatMap(s => g.glyphs.map(n => [...s, n])); }
                    rules = seqs.map(s => ({ type: 'ligature', input: s, output: r.output[0][0] }));
                }
                const compiled = rules.map(x => simple(x, gid)); actions.push([0, insert('sub', { type: compiled[0].type, flags: r.flags, subtables: compiled.map(x => x.bytes) })]);
            }
            if (!actions.length) throw new Error('Context rule has no lookup action');
        }
        const w = new Writer().u16(3), offsets = [];
        for (const seq of [before, input, after]) {
            w.u16(seq.length); for (const g of seq) { offsets.push([w.pos, g.glyphs.map(gid)]); w.u16(0); }
        }
        w.u16(actions.length); actions.forEach(([index, lookup]) => w.u16(index).u16(lookup)); offsets.forEach(([p, ids]) => cv(w, p, ids));
        return { type: which === 'sub' ? 6 : 8, bytes: w.finish() };
    }
    function compileRules(rules) {
        const result = []; let pending = null;
        const flush = () => { if (pending) { if (pending.rules?.length) pending.lookup.subtables.push(compileAttachments(pending.rules,gid,parsed.markClasses).bytes); result.push({ which: pending.which, index: insert(pending.which, pending.lookup), scope: pending.scope }); pending = null; } };
        for (const r of rules) {
            if (r.type === 'break') { if (pending?.rules?.length) { pending.lookup.subtables.push(compileAttachments(pending.rules,gid,parsed.markClasses).bytes); pending.rules = []; } continue; }
            if (r.type === 'lookup') { flush(); result.push(...namedLookup(r.name).map(x => ({ ...x, scope: r }))); continue; }
            const which = family(r);
            if (isAttachment(r.type)) {
                const key = [r.type,r.flags,r.markFilteringSet,r.script,r.language,r.exclude,r.required].join('/');
                if (pending?.key !== key) { flush(); pending = {key,which,scope:r,rules:[],lookup:{type:({cursivePos:3,basePos:4,ligaturePos:5,markPos:6})[r.type],flags:r.flags||0,markFilteringSet:r.markFilteringSet,subtables:[]}}; }
                pending.markClasses ??= new Set();pending.markGlyphs ??= new Map();
                for(const name of new Set((r.components||[]).flatMap(c=>c.map(a=>a.name)))){
                    if(pending.markClasses.has(name))continue;pending.markClasses.add(name);
                    for(const mark of parsed.markClasses[name]||[]){const previous=pending.markGlyphs.get(mark.glyph);if(previous&&previous!==name)throw new Error(`Overlapping mark classes for '${mark.glyph}' in one lookup`);pending.markGlyphs.set(mark.glyph,name);}
                }
                pending.rules.push(r); continue;
            }
            const compiled = r.type.startsWith('context') || r.type === 'reverse' ? context(r, which) : simple(r, gid);
            const key = [which, compiled.type, r.flags, r.markFilteringSet, r.script, r.language, r.exclude, r.required].join('/');
            if (pending?.key !== key) { flush(); pending = { key, which, scope: r, lookup: { type: compiled.type, flags: r.flags || 0, markFilteringSet:r.markFilteringSet, subtables: [] } }; }
            // A single lookup tries subtables in order. Exceptions stop that lookup, not all following lookups.
            pending.lookup.subtables.push(compiled.bytes);
        }
        flush(); return result;
    }
    for (const f of parsed.features) {
        for (const ref of compileRules(f.rules)) {
            const target = ref.which === 'sub' ? sf : pf;
            if (!target.has(f.tag)) target.set(f.tag, []);
            if (!target.get(f.tag).includes(ref.index)) target.get(f.tag).push(ref.index);
            selections[ref.which].push({ tag: f.tag, ...ref });
        }
    }
    for(const name of Object.keys(parsed.lookups))namedLookup(name);
    return { sub, pos, sf, pf, selections };
}

/** Shared script/language selection and 32-bit extension lookup payload layout. */
export function buildLayoutTable(features, lookups, plan = null, which = 'sub') {
    if (!lookups.length) return null;
    const systems = new Map();
    for (const s of plan?.languages || [{ script: 'DFLT', language: 'dflt' }, { script: 'latn', language: 'dflt' }]) systems.set(s.script + '/' + s.language, s);
    for (const s of plan?.selections || []) if (s.scope?.script) {
        systems.set(s.scope.script + '/dflt', { script: s.scope.script, language: 'dflt' });
        systems.set(s.scope.script + '/' + s.scope.language, { script: s.scope.script, language: s.scope.language });
    }
    const records = [], scripts = new Map(), declared = new Set((plan?.selections || []).map(s => s.tag));
    const unique = new Map();
    for (const system of systems.values()) {
        const selected = [], required = [];
        for (const [tag, defaults] of [...features].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
            const refs = (plan?.selections || []).filter(s => s.tag === tag), specific = refs.filter(s => s.scope?.script === system.script && s.scope.language === system.language);
            const excluded = specific.some(s => s.scope.exclude);
            const indices = declared.has(tag) ? [...new Set(refs.filter(s => {
                const scope = s.scope;
                if (!scope?.script) return !excluded;
                return scope.script === system.script && (scope.language === system.language || !excluded && scope.language === 'dflt');
            }).map(s => s.index))] : defaults;
            if (!indices.length) continue;
            const key = tag + ':' + indices.join(','); let id = unique.get(key);
            if (id === undefined) { id = records.length; unique.set(key, id); records.push({ tag, indices }); }
            selected.push(id); if (specific.some(s => s.scope.required)) required.push(id);
        }
        if (required.length > 1) throw new Error('Only one required feature is permitted per language system');
        if (!scripts.has(system.script)) scripts.set(system.script, new Map());
        scripts.get(system.script).set(system.language, { selected, required: required[0] ?? 65535 });
    }
    // Feature records MUST be lexicographically ordered, including duplicated tags.
    const order = records.map((r, i) => ({ ...r, old: i })).sort((a, b) => a.tag < b.tag ? -1 : a.tag > b.tag ? 1 : a.old - b.old);
    const remap = new Map(order.map((r, i) => [r.old, i]));
    const w = new Writer().u32(0x10000).u16(10).u16(0).u16(0), sortedScripts = [...scripts].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
    w.u16(sortedScripts.length); for (const [s] of sortedScripts) w.tag(s).u16(0);
    sortedScripts.forEach(([, languages], i) => {
        patch(w, 16 + i * 6, w.pos - 10); const base = w.pos;
        const other = [...languages].filter(([l]) => l !== 'dflt').sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0);
        w.u16(0).u16(other.length); for (const [l] of other) w.tag(l).u16(0);
        const lang = selection => { w.u16(0).u16(selection.required === 65535 ? 65535 : remap.get(selection.required)); const indices = selection.selected.filter(i => i !== selection.required).map(i => remap.get(i)).sort((a, b) => a - b); w.u16(indices.length); indices.forEach(i => w.u16(i)); };
        if (languages.has('dflt')) { patch(w, base, w.pos - base); lang(languages.get('dflt')); }
        other.forEach(([, s], k) => { patch(w, base + 8 + k * 6, w.pos - base); lang(s); });
    });
    patch(w, 6, w.pos); const fs = w.pos; w.u16(order.length); order.forEach(f => w.tag(f.tag).u16(0));
    order.forEach((f, i) => { patch(w, fs + 6 + i * 6, w.pos - fs); w.u16(0).u16(f.indices.length); f.indices.forEach(n => w.u16(n)); });
    patch(w, 8, w.pos); const ls = w.pos; w.u16(lookups.length).zeros(lookups.length * 2); const payloads = [];
    const extension = lookups.reduce((n,l)=>n+6+((l.flags&16)?2:0)+(l.subtables||[l.bytes]).reduce((s,b)=>s+2+b.length,0),0)>60000;
    lookups.forEach((l, i) => {
        patch(w, ls + 2 + i * 2, w.pos - ls); const base = w.pos, tables = l.subtables || [l.bytes];
        w.u16(extension ? (which === 'sub' ? 7 : 9) : l.type).u16(l.flags || 0).u16(tables.length).zeros(2 * tables.length);
        if ((l.flags || 0) & 16) { if (!Number.isInteger(l.markFilteringSet) || l.markFilteringSet < 0 || l.markFilteringSet > 65535) throw new RangeError('Missing MarkFilteringSet index'); w.u16(l.markFilteringSet); }
        tables.forEach((bytes, k) => { patch(w, base + 6 + 2 * k, w.pos - base); if(extension){const ext = w.pos; w.u16(1).u16(l.type).u32(0); payloads.push({ ext, bytes });}else w.raw(bytes); });
    });
    for (const { ext, bytes } of payloads) { w.patch32(ext + 4, w.pos - ext); w.raw(bytes); }
    return w.finish();
}
