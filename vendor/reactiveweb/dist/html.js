import { distinctUntilChanged } from 'rxjs';
import { WhenAnyValue } from './reactive-object.js';
import { CompositeDisposable, Disposable, SerialDisposable, dispose } from './disposables.js';
import { ViewModelActivator, WhenActivated } from './activation.js';
import { ViewLocator } from './services.js';
import { ConverterService, PropertyBindingHookRegistry } from './converters.js';
import { ToReactiveCollection } from './dynamic-data.js';
export class ReactiveBinding extends CompositeDisposable {
    get IsBound() { return !this.IsDisposed; }
}
/** Owns rendered rows and subscriptions, while the caller retains collection ownership. */
export class ReactiveCollectionBinding extends ReactiveBinding {
    Element;
    render;
    options;
    source;
    connection = new SerialDisposable();
    rows = [];
    ownedRows = new Set();
    ownedNodes = new Set();
    anchor;
    processing = false;
    generation = 0;
    pending = [];
    constructor(source, Element, render, options = {}) {
        super();
        this.Element = Element;
        this.render = render;
        this.options = options;
        this.source = source;
        this.anchor = Element.ownerDocument.createComment('ReactiveWeb collection');
        Element.append(this.anchor);
        this.Add(this.connection);
        this.Add(() => { try {
            this.clearRows();
        }
        finally {
            this.anchor.remove();
        } });
        try {
            this.connect();
        }
        catch (error) {
            this.Dispose();
            throw error;
        }
    }
    get Source() { return this.source; }
    set Source(value) {
        if (this.IsDisposed)
            throw new Error('Collection binding is disposed');
        if (this.source === value)
            return;
        this.run(() => { this.connection.Disposable = undefined; this.clearRows(); this.source = value; this.connect(); });
    }
    run(action) {
        this.pending.push(action);
        if (this.processing)
            return;
        this.processing = true;
        try {
            while (this.pending.length && !this.IsDisposed)
                this.pending.shift()();
        }
        catch (error) {
            this.pending.length = 0;
            throw error;
        }
        finally {
            this.processing = false;
            if (this.IsDisposed)
                this.pending.length = 0;
        }
    }
    clearRows() {
        const old = [...this.ownedRows];
        this.rows = [];
        this.ownedRows.clear();
        this.ownedNodes.clear();
        const resources = new CompositeDisposable(...old.map(row => () => { try {
            row.lifetime.Dispose();
        }
        finally {
            row.node.parentNode?.removeChild(row.node);
        } }));
        resources.Dispose();
    }
    createRow(item, index) {
        const lifetime = new CompositeDisposable();
        try {
            const node = this.render(item, index, lifetime);
            if (!node || typeof node.nodeType !== 'number' || node.nodeType === 11)
                throw new TypeError('Collection renderer must return one persistent DOM node, not a DocumentFragment');
            if (this.ownedNodes.has(node))
                throw new TypeError('Collection renderer must return a distinct node for each occurrence');
            const row = { item, key: this.options.keySelector ? this.options.keySelector(item) : item, node, lifetime };
            this.ownedRows.add(row);
            this.ownedNodes.add(node);
            return row;
        }
        catch (error) {
            lifetime.Dispose();
            throw error;
        }
    }
    removeRows(rows) {
        for (const row of rows) {
            this.ownedRows.delete(row);
            this.ownedNodes.delete(row.node);
        }
        new CompositeDisposable(...rows.map(row => () => { try {
            row.lifetime.Dispose();
        }
        finally {
            row.node.parentNode?.removeChild(row.node);
        } })).Dispose();
    }
    reconcile(items) {
        const available = new Map();
        for (const row of this.rows) {
            const bucket = available.get(row.key) ?? [];
            bucket.push(row);
            available.set(row.key, bucket);
        }
        const next = [];
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            const key = this.options.keySelector ? this.options.keySelector(item) : item;
            const bucket = available.get(key);
            let row;
            if (bucket?.length) {
                const same = bucket.findIndex(candidate => Object.is(candidate.item, item));
                if (same >= 0)
                    row = bucket.splice(same, 1)[0];
                else if (this.options.update)
                    row = bucket.shift();
            }
            if (!row)
                row = this.createRow(item, index);
            row.item = item;
            next.push(row);
        }
        this.rows = next;
        this.removeRows([...available.values()].flat());
        this.layout();
    }
    apply(changes) {
        for (const change of changes) {
            if (change.Reason === 'reset') {
                this.reconcile(change.Items);
                continue;
            }
            if (change.Reason === 'add')
                this.rows.splice(change.Index, 0, ...change.Items.map((item, index) => this.createRow(item, change.Index + index)));
            else if (change.Reason === 'remove')
                this.removeRows(this.rows.splice(change.Index, change.Items.length));
            else if (change.Reason === 'move')
                this.rows.splice(change.Index, 0, ...this.rows.splice(change.PreviousIndex, change.Items.length));
            else if (change.Reason === 'replace') {
                const old = this.rows.splice(change.Index, change.PreviousItems?.length ?? change.Items.length);
                const next = change.Items.map((item, index) => {
                    const key = this.options.keySelector ? this.options.keySelector(item) : item;
                    const match = old.findIndex(row => Object.is(row.key, key) && (Object.is(row.item, item) || !!this.options.update));
                    const row = match < 0 ? this.createRow(item, change.Index + index) : old.splice(match, 1)[0];
                    row.item = item;
                    return row;
                });
                this.rows.splice(change.Index, 0, ...next);
                this.removeRows(old);
            }
        }
        this.layout();
    }
    layout() {
        // Work backwards: insertBefore moves existing nodes without remounting them.
        let reference = this.anchor;
        for (let index = this.rows.length - 1; index >= 0; index--) {
            const row = this.rows[index];
            if (row.node.nextSibling !== reference || row.node.parentNode !== this.Element)
                this.Element.insertBefore(row.node, reference);
            this.options.update?.(row.node, row.item, index, row.lifetime);
            reference = row.node;
        }
    }
    connect() {
        const lifetime = new CompositeDisposable();
        this.connection.Disposable = lifetime;
        const generation = ++this.generation;
        const source = this.source;
        const binding = 'ItemsChanged' in source ? undefined : ToReactiveCollection(source);
        if (binding)
            lifetime.Add(binding);
        const collection = (binding?.Collection ?? source);
        let subscribing = true, failed = false, initialError;
        const fail = (error) => {
            if (generation !== this.generation)
                return;
            lifetime.Dispose();
            this.clearRows();
            if (this.options.onError)
                this.options.onError(error);
            else if (subscribing) {
                failed = true;
                initialError = error;
            }
            else
                throw error;
        };
        if (collection.Connect) {
            // The atomic initial reset excludes a batch already reflected in the current snapshot.
            lifetime.Add(collection.Connect().subscribe({ next: changes => { try {
                    this.run(() => { if (generation === this.generation)
                        this.apply(changes); });
                }
                catch (error) {
                    fail(error);
                } }, error: fail }));
        }
        else
            lifetime.Add(collection.ItemsChanged.subscribe({ next: items => { try {
                    this.run(() => { if (generation === this.generation)
                        this.reconcile(items); });
                }
                catch (error) {
                    fail(error);
                } }, error: fail }));
        if (binding)
            lifetime.Add(binding.Errors.subscribe(fail));
        subscribing = false;
        if (failed)
            throw initialError;
    }
}
/** Binds DynamicData list/cache changes or a bindable collection to independently owned rows. */
export function BindCollection(source, element, render, options = {}) {
    return new ReactiveCollectionBinding(source, element, render, options);
}
export const bindCollection = BindCollection;
const invalidParts = new Set(['__proto__', 'prototype', 'constructor']);
function pathParts(path) {
    const parts = path.split('.');
    if (!parts.length || parts.some(part => !/^[A-Za-z_$][\w$]*$/.test(part) || invalidParts.has(part)))
        throw new TypeError(`Unsafe or invalid binding path: ${path}`);
    return parts;
}
function readPath(source, path) {
    return pathParts(path).reduce((value, key) => value == null ? undefined : value[key], source);
}
function writePath(source, path, value) {
    const parts = pathParts(path);
    const last = parts.pop();
    const target = parts.reduce((current, key) => current == null ? undefined : current[key], source);
    if (target == null || (typeof target !== 'object' && typeof target !== 'function'))
        throw new TypeError(`Cannot write binding path ${path}: its parent is null.`);
    target[last] = value;
}
function bindingError(target, error, handler) {
    if (handler) {
        handler(error);
        return;
    }
    const EventType = target.ownerDocument.defaultView?.CustomEvent ?? globalThis.CustomEvent;
    if (EventType)
        target.dispatchEvent(new EventType('reactive-error', { detail: error, bubbles: true, composed: true }));
}
function defaultProperty(element) {
    return element.localName === 'input' && ['checkbox', 'radio'].includes(element.getAttribute('type') ?? '') ? 'checked' : ['input', 'textarea', 'select'].includes(element.localName) ? 'value' : 'textContent';
}
function applyValue(element, property, value) {
    if (property.startsWith('attr.')) {
        const attribute = property.slice(5);
        if (/^on/i.test(attribute) || ['srcdoc', 'style'].includes(attribute.toLowerCase()))
            throw new TypeError('Executable attributes are not binding targets.');
        if (['href', 'src', 'action', 'formaction', 'xlink:href'].includes(attribute.toLowerCase()) && /^\s*(?:javascript|vbscript|data):/i.test(String(value)))
            throw new TypeError('Unsafe binding URL.');
        if (value == null || value === false)
            element.removeAttribute(attribute);
        else
            element.setAttribute(attribute, value === true ? '' : String(value));
    }
    else if (property.startsWith('class.')) {
        element.classList.toggle(property.slice(6), Boolean(value));
    }
    else {
        pathParts(property);
        if (['innerHTML', 'outerHTML', 'srcdoc'].includes(property) || /^on/i.test(property))
            throw new TypeError('Use trusted DOM construction for HTML and event handlers.');
        const target = element;
        const next = ['textContent', 'value'].includes(property) ? value ?? '' : value;
        if (!Object.is(target[property], next))
            target[property] = next;
    }
}
/** Binds an observable directly to a DOM property and returns its subscription lifetime. */
export function BindTo(source, element, property = defaultProperty(element), options = {}) {
    const binding = new ReactiveBinding();
    binding.Add(source.pipe(distinctUntilChanged()).subscribe({
        next: value => { try {
            applyValue(element, property, options.convert ? options.convert(value) : options.converter ? options.converter.Convert(value) : options.targetType ? (options.conversionService ?? ConverterService.Current).Convert(value, options.targetType, options.conversionHint, options.sourceType) : value);
        }
        catch (error) {
            bindingError(element, error, options.onError);
        } },
        error: error => bindingError(element, error, options.onError),
    }));
    return binding;
}
export function OneWayBind(viewModel, path, element, property = defaultProperty(element), options = {}) {
    pathParts(path);
    if (!(options.bindingHooks ?? PropertyBindingHookRegistry.Current).ExecuteHooks({ ViewModel: viewModel, View: element, SourceProperty: path, TargetProperty: property, Direction: 'OneWay' })) {
        const rejected = new ReactiveBinding();
        rejected.Dispose();
        return rejected;
    }
    return BindTo(WhenAnyValue(viewModel, path), element, property, options);
}
/** Two-way binding; inputs use input, select/checkbox/radio use change by default. */
export function Bind(viewModel, path, element, property = defaultProperty(element), options = {}) {
    pathParts(path);
    if (!(options.bindingHooks ?? PropertyBindingHookRegistry.Current).ExecuteHooks({ ViewModel: viewModel, View: element, SourceProperty: path, TargetProperty: property, Direction: 'TwoWay' })) {
        const rejected = new ReactiveBinding();
        rejected.Dispose();
        return rejected;
    }
    const binding = BindTo(WhenAnyValue(viewModel, path), element, property, options);
    const eventName = options.event ?? (element.localName === 'select' || property === 'checked' ? 'change' : 'input');
    let composing = false;
    const change = () => {
        if (composing)
            return;
        try {
            const value = element[property];
            writePath(viewModel, path, options.convertBack ? options.convertBack(value) : options.converter?.ConvertBack ? options.converter.ConvertBack(value) : options.sourceType ? (options.conversionService ?? ConverterService.Current).Convert(value, options.sourceType, options.conversionHint, options.targetType) : value);
        }
        catch (error) {
            bindingError(element, error, options.onError);
        }
    };
    const start = () => { composing = true; };
    const end = () => { composing = false; change(); };
    element.addEventListener(eventName, change);
    element.addEventListener('compositionstart', start);
    element.addEventListener('compositionend', end);
    binding.Add(() => { element.removeEventListener(eventName, change); element.removeEventListener('compositionstart', start); element.removeEventListener('compositionend', end); });
    return binding;
}
export function BindCommand(command, element, options = {}) {
    const binding = new ReactiveBinding();
    let canExecute = false;
    const hadAria = element.getAttribute('aria-disabled');
    const originalDisabled = element.disabled;
    binding.Add(command.CanExecute.subscribe(value => { canExecute = value; if ('disabled' in element)
        element.disabled = !value; element.setAttribute('aria-disabled', String(!value)); }));
    const execute = (event) => {
        if (options.preventDefault ?? true)
            event.preventDefault();
        if (!canExecute || command.CanExecuteValue === false)
            return;
        try {
            const parameter = typeof options.parameter === 'function' ? options.parameter(event) : options.parameter;
            // A completed execution is removed immediately; long-lived views do not accumulate subscriptions.
            const execution = command.Execute(parameter).subscribe({ error: error => bindingError(element, error, options.onError) });
            binding.Add(execution);
            execution.add(() => binding.Remove(execution));
        }
        catch (error) {
            bindingError(element, error, options.onError);
        }
    };
    const eventName = options.event ?? 'click';
    element.addEventListener(eventName, execute);
    binding.Add(() => { element.removeEventListener(eventName, execute); if ('disabled' in element)
        element.disabled = originalDisabled; if (hadAria == null)
        element.removeAttribute('aria-disabled');
    else
        element.setAttribute('aria-disabled', hadAria); });
    return binding;
}
export function BindValidation(viewModel, element, propertyName, separator = '\n') {
    const context = 'ValidationContext' in viewModel ? viewModel.ValidationContext : viewModel;
    const binding = new ReactiveBinding();
    binding.Add(context.ObserveErrors(propertyName).subscribe(errors => { element.textContent = errors.join(separator); element.setAttribute('aria-live', 'polite'); element.hidden = errors.length === 0; }));
    return binding;
}
/** Re-registers the handler if a reactive interaction property is replaced. */
export function BindInteraction(viewModel, path, handler) {
    pathParts(path);
    const binding = new ReactiveBinding();
    const registration = binding.Add(new SerialDisposable());
    binding.Add(WhenAnyValue(viewModel, path).subscribe(interaction => {
        registration.Disposable = undefined;
        if (interaction)
            registration.Disposable = interaction.RegisterHandler(handler);
    }));
    return binding;
}
export const BindingConverters = Object.freeze({
    String: { Convert: (value) => String(value ?? ''), ConvertBack: (value) => value },
    Number: { Convert: (value) => value == null ? '' : String(value), ConvertBack: (value) => { if (value.trim() === '')
            return null; const number = Number(value); if (!Number.isFinite(number))
            throw new TypeError('Enter a finite number.'); return number; } },
    Boolean: { Convert: (value) => Boolean(value), ConvertBack: (value) => Boolean(value) },
    Not: { Convert: (value) => !value, ConvertBack: (value) => !value },
});
const selector = '[data-rx-text],[data-rx-bind],[data-rx-value],[data-rx-checked],[data-rx-visible],[data-rx-enabled],[data-rx-command],[data-rx-validation],[data-rx-one-way]';
/** Declarative bindings use property paths only, never eval or expression compilation. */
export function BindHtml(root, viewModel, options = {}) {
    const result = new ReactiveBinding();
    const bound = new Map();
    const bindElement = (element) => {
        if (bound.has(element))
            return;
        const binding = new ReactiveBinding();
        bound.set(element, binding);
        try {
            const converterName = element.getAttribute('data-rx-converter');
            const converter = converterName ? options.converters?.[converterName] ?? BindingConverters[converterName] : undefined;
            if (converterName && !converter)
                throw new TypeError(`Unknown binding converter: ${converterName}`);
            const bindingOptions = { converter, onError: options.onError, event: element.getAttribute('data-rx-event') ?? undefined };
            for (const attribute of ['data-rx-bind', 'data-rx-value', 'data-rx-checked']) {
                const path = element.getAttribute(attribute);
                if (path)
                    binding.Add(Bind(viewModel, path, element, attribute === 'data-rx-checked' ? 'checked' : defaultProperty(element), bindingOptions));
            }
            for (const [attribute, property, convert] of [
                ['data-rx-text', 'textContent', undefined], ['data-rx-one-way', defaultProperty(element), undefined],
                ['data-rx-visible', 'hidden', (value) => !value], ['data-rx-enabled', 'disabled', (value) => !value],
            ]) {
                const path = element.getAttribute(attribute);
                if (path)
                    binding.Add(OneWayBind(viewModel, path, element, property, { ...bindingOptions, convert }));
            }
            const commandPath = element.getAttribute('data-rx-command');
            if (commandPath) {
                pathParts(commandPath);
                const current = new SerialDisposable();
                binding.Add(current);
                binding.Add(WhenAnyValue(viewModel, commandPath).subscribe(value => {
                    current.Disposable = undefined;
                    if (!value) {
                        if ('disabled' in element)
                            element.disabled = true;
                        return;
                    }
                    current.Disposable = BindCommand(value, element, { event: bindingOptions.event, onError: options.onError, parameter: () => {
                            const parameterPath = element.getAttribute('data-rx-parameter');
                            return parameterPath ? readPath(viewModel, parameterPath) : undefined;
                        } });
                }));
            }
            if (element.hasAttribute('data-rx-validation')) {
                if (!('ValidationContext' in viewModel))
                    throw new TypeError('Validation binding requires a ValidationContext.');
                binding.Add(BindValidation(viewModel, element, element.getAttribute('data-rx-validation') || undefined));
            }
        }
        catch (error) {
            binding.Dispose();
            bound.delete(element);
            bindingError(element, error, options.onError);
        }
    };
    const ownsElement = (element) => {
        let ancestor = element;
        while (ancestor && ancestor !== root) {
            if ('ViewModel' in ancestor || ancestor.hasAttribute('data-rx-scope'))
                return false;
            ancestor = ancestor.parentElement;
        }
        return true;
    };
    const reconcile = () => {
        const elements = new Set(Array.from(root.querySelectorAll(selector)).filter(ownsElement));
        if ('matches' in root && root.matches(selector))
            elements.add(root);
        for (const [element, binding] of bound)
            if (!elements.has(element)) {
                binding.Dispose();
                bound.delete(element);
            }
        for (const element of elements)
            bindElement(element);
    };
    reconcile();
    const document = 'ownerDocument' in root ? root.ownerDocument : root;
    const Observer = document?.defaultView?.MutationObserver ?? globalThis.MutationObserver;
    if ((options.observeMutations ?? true) && Observer) {
        const observer = new Observer(mutations => {
            for (const mutation of mutations)
                if (mutation.type === 'attributes' && mutation.attributeName?.startsWith('data-rx-')) {
                    const element = mutation.target;
                    bound.get(element)?.Dispose();
                    bound.delete(element);
                }
            reconcile();
        });
        observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-rx-text', 'data-rx-bind', 'data-rx-value', 'data-rx-checked', 'data-rx-visible', 'data-rx-enabled', 'data-rx-command', 'data-rx-validation', 'data-rx-one-way', 'data-rx-converter', 'data-rx-event', 'data-rx-parameter', 'data-rx-scope'] });
        result.Add(() => observer.disconnect());
    }
    result.Add(() => { for (const binding of bound.values())
        binding.Dispose(); bound.clear(); });
    return result;
}
// Safe to import during SSR. Construct/register elements only in a DOM environment.
const HTMLElementBase = (globalThis.HTMLElement ?? class {
});
export class ReactiveElement extends HTMLElementBase {
    Activator = new ViewModelActivator();
    viewModel = null;
    lifetime;
    disposed = false;
    get ViewModel() { return this.viewModel; }
    set ViewModel(value) { if (this.viewModel === value)
        return; this.viewModel = value; this.RefreshBindings(); }
    get DataContext() { return this.ViewModel; }
    set DataContext(value) { this.ViewModel = value; }
    get BindingRoot() { return this.shadowRoot ?? this; }
    connectedCallback() { if (!this.disposed)
        this.activate(); }
    disconnectedCallback() { this.lifetime?.Dispose(); this.lifetime = undefined; }
    WhenActivated(block) { return WhenActivated(this.Activator, block); }
    OnActivated(_disposables) { }
    RefreshBindings() { if (!this.isConnected || this.disposed)
        return; this.disconnectedCallback(); this.activate(); }
    activate() {
        if (this.lifetime)
            return;
        const lifetime = this.lifetime = new CompositeDisposable();
        try {
            if (this.ViewModel) {
                const activator = this.ViewModel.Activator;
                if (activator)
                    lifetime.Add(activator.Activate());
                lifetime.Add(BindHtml(this.BindingRoot, this.ViewModel));
            }
            lifetime.Add(this.Activator.Activate());
            this.OnActivated(lifetime);
        }
        catch (error) {
            lifetime.Dispose();
            this.lifetime = undefined;
            throw error;
        }
    }
    Dispose() { if (this.disposed)
        return; this.disposed = true; this.disconnectedCallback(); this.Activator.Dispose(); }
    unsubscribe() { this.Dispose(); }
}
export { ReactiveElement as ReactiveUserControl };
function mountView(host, viewModel, locator, contract, fallback) {
    const resolved = viewModel == null ? undefined : locator.ResolveView(viewModel, contract);
    let node;
    if (resolved && typeof resolved === 'object') {
        if ('ViewModel' in resolved)
            resolved.ViewModel = viewModel;
        if ('DataContext' in resolved)
            resolved.DataContext = viewModel;
        if ('nodeType' in resolved)
            node = resolved;
        else if ('Element' in resolved)
            node = resolved.Element;
    }
    if (resolved != null && !node)
        throw new TypeError('An HTML view factory must return a DOM Node or { Element, ViewModel }.');
    if (node)
        host.replaceChildren(node);
    else if (typeof fallback === 'string')
        host.textContent = fallback;
    else if (fallback)
        host.replaceChildren(fallback);
    else
        host.replaceChildren();
    return Disposable.Create(() => { host.replaceChildren(); if (resolved && typeof resolved === 'object' && 'Dispose' in resolved && !locator.IsSingletonView?.(resolved))
        dispose(resolved); });
}
export class ViewModelViewHost extends ReactiveElement {
    locator = ViewLocator.Current;
    get ViewLocator() { return this.locator; }
    set ViewLocator(value) { if (this.locator !== value) {
        this.locator = value;
        this.RefreshBindings();
    } }
    contract;
    fallback = null;
    get ViewContract() { return this.contract; }
    set ViewContract(value) { if (this.contract !== value) {
        this.contract = value;
        this.RefreshBindings();
    } }
    get DefaultContent() { return this.fallback; }
    set DefaultContent(value) { this.fallback = value; this.RefreshBindings(); }
    OnActivated(disposables) { disposables.Add(mountView(this, this.ViewModel, this.ViewLocator, this.ViewContract, this.DefaultContent)); }
}
export class RoutedViewHost extends ReactiveElement {
    locator = ViewLocator.Current;
    get ViewLocator() { return this.locator; }
    set ViewLocator(value) { if (this.locator !== value) {
        this.locator = value;
        this.RefreshBindings();
    } }
    router = null;
    contract;
    fallback = null;
    get Router() { return this.router; }
    set Router(value) { if (this.router !== value) {
        this.router = value;
        this.RefreshBindings();
    } }
    get ViewContract() { return this.contract; }
    set ViewContract(value) { if (this.contract !== value) {
        this.contract = value;
        this.RefreshBindings();
    } }
    get DefaultContent() { return this.fallback; }
    set DefaultContent(value) { this.fallback = value; this.RefreshBindings(); }
    OnActivated(disposables) {
        const view = disposables.Add(new SerialDisposable());
        const render = (value) => { view.Disposable = undefined; view.Disposable = mountView(this, value, this.ViewLocator, this.ViewContract, this.DefaultContent); };
        if (this.Router)
            disposables.Add(this.Router.CurrentViewModel.subscribe(render));
        else
            render(null);
    }
}
/** Explicit registration avoids globals and allows multiple versions in the same document. */
export function RegisterReactiveElements(registry = globalThis.customElements, prefix = 'reactive') {
    if (!registry)
        throw new Error('A CustomElementRegistry is required.');
    for (const [name, type] of [[`${prefix}-view`, ReactiveElement], [`${prefix}-view-host`, ViewModelViewHost], [`${prefix}-routed-view-host`, RoutedViewHost]]) {
        const Base = type;
        if (!registry.get(name))
            registry.define(name, class extends Base {
            });
    }
}
export const bind = Bind;
export const oneWayBind = OneWayBind;
export const bindTo = BindTo;
export const bindCommand = BindCommand;
export const bindHtml = BindHtml;
//# sourceMappingURL=html.js.map