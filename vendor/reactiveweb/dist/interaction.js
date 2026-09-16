import { Observable, Subscriber, Subscription, from, of, queueScheduler, } from 'rxjs';
/** One request and its write-once answer. */
export class InteractionContext {
    Input;
    handled = false;
    output;
    Signal;
    constructor(Input, signal) {
        this.Input = Input;
        this.Signal = signal ?? new AbortController().signal;
    }
    get IsHandled() { return this.handled; }
    GetInput() { return this.Input; }
    SetOutput(output) {
        if (this.handled)
            throw new Error('Output has already been set.');
        this.output = output;
        this.handled = true;
    }
    GetOutput() {
        if (!this.handled)
            throw new Error('Output has not been set.');
        return this.output;
    }
    get input() { return this.Input; }
    get isHandled() { return this.IsHandled; }
    get signal() { return this.Signal; }
    setOutput(output) { this.SetOutput(output); }
}
export class UnhandledInteractionError extends Error {
    Interaction;
    Input;
    constructor(Interaction, Input) {
        super('No registered interaction handler provided an output.');
        this.Interaction = Interaction;
        this.Input = Input;
        this.name = 'UnhandledInteractionError';
    }
}
/** Familiar .NET name, referring to the same error class. */
export { UnhandledInteractionError as UnhandledInteractionException };
/**
 * A view-independent request/response channel. Handlers are tried newest first,
 * sequentially; each may decline by completing without SetOutput. Async and
 * Observable handlers must complete before the next handler runs. Every Handle
 * subscription takes a fresh handler snapshot and independent context.
 */
export class Interaction {
    handlerScheduler;
    handlers = [];
    requests = new Set();
    disposed = false;
    constructor(handlerScheduler = queueScheduler) {
        this.handlerScheduler = handlerScheduler;
    }
    RegisterHandler(handler) {
        if (typeof handler !== 'function')
            throw new TypeError('handler must be a function.');
        if (this.disposed)
            throw new Error('Interaction has been disposed.');
        // Entries have unique identity so registering the same function twice can
        // still be independently disposed.
        const entry = { handler };
        this.handlers.push(entry);
        const subscription = new Subscription(() => {
            const index = this.handlers.indexOf(entry);
            if (index >= 0)
                this.handlers.splice(index, 1);
        });
        return Object.assign(subscription, { Dispose() { subscription.unsubscribe(); } });
    }
    Handle(input) {
        return new Observable(downstream => {
            if (this.disposed) {
                downstream.error(new Error('Interaction has been disposed.'));
                return;
            }
            const handlers = this.handlers.slice().reverse();
            const controller = new AbortController();
            const context = this.GenerateContext(input, controller.signal);
            const lifetime = new Subscription();
            let index = 0;
            const cancel = () => {
                controller.abort();
                lifetime.unsubscribe();
                this.requests.delete(cancel);
                if (!downstream.closed)
                    downstream.complete();
            };
            this.requests.add(cancel);
            downstream.add(cancel);
            const step = () => {
                const work = this.handlerScheduler.schedule(() => {
                    if (downstream.closed)
                        return;
                    if (context.IsHandled) {
                        downstream.next(context.GetOutput());
                        downstream.complete();
                        return;
                    }
                    if (index >= handlers.length) {
                        downstream.error(new UnhandledInteractionError(this, input));
                        return;
                    }
                    try {
                        const result = handlers[index++].handler(context);
                        if (downstream.closed)
                            return;
                        const observer = new Subscriber({
                            next: () => { },
                            error: (error) => downstream.error(error),
                            complete: step,
                        });
                        lifetime.add(observer);
                        (result == null ? of(undefined) : from(result)).subscribe(observer);
                    }
                    catch (error) {
                        downstream.error(error);
                    }
                });
                lifetime.add(work);
            };
            step();
        });
    }
    GenerateContext(input, signal) {
        return new InteractionContext(input, signal);
    }
    get IsDisposed() { return this.disposed; }
    get HandlerCount() { return this.handlers.length; }
    handle(input) { return this.Handle(input); }
    registerHandler(handler) {
        return this.RegisterHandler(handler);
    }
    Dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        this.handlers = [];
        for (const cancel of [...this.requests])
            cancel();
    }
    unsubscribe() { this.Dispose(); }
    dispose() { this.Dispose(); }
}
//# sourceMappingURL=interaction.js.map