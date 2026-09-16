import { BehaviorSubject, EMPTY, Observable, Subject, Subscriber, Subscription, catchError, combineLatest, filter, from, map, mergeMap, of, withLatestFrom, } from 'rxjs';
import { RxApp } from './rx-app.js';
/**
 * A reusable RxJS command. Subscribe to the command for all successful results;
 * subscribe to Execute(input) to start one cold execution and observe its result.
 * Explicit executions are independent of CanExecute, as in ReactiveUI. Bindings
 * and InvokeCommand honor CanExecute and drop disabled/busy invocations.
 *
 * Result broadcasts, execution-state transitions and ThrownExceptions use the
 * output scheduler. Execute's own observer receives the source notifications
 * directly. Unsubscribing cancels an observable execution and aborts a task's
 * signal; a task stays executing until its promise actually settles.
 */
export class ReactiveCommand extends Observable {
    executeFactory;
    outputScheduler;
    tracksPromise;
    results;
    canExecuteState = new BehaviorSubject(false);
    executingState = new BehaviorSubject(false);
    exceptions = new Subject();
    lifetime = new Subscription();
    scheduled = new Subscription();
    executions = new Set();
    userCanExecute = false;
    inFlight = 0;
    disposed = false;
    forwardExecutionErrors = true;
    CanExecute = this.canExecuteState.asObservable();
    IsExecuting = this.executingState.asObservable();
    ThrownExceptions = this.exceptions.asObservable();
    Results;
    /** Compatibility hook; by default this delegates to RxApp's current handler. */
    static DefaultExceptionHandler = error => RxApp.HandleException(error);
    constructor(executeFactory, canExecute, outputScheduler = RxApp.MainThreadScheduler, tracksPromise = false) {
        const results = new Subject();
        super(subscriber => results.subscribe(subscriber));
        this.executeFactory = executeFactory;
        this.outputScheduler = outputScheduler;
        this.tracksPromise = tracksPromise;
        if (typeof executeFactory !== 'function')
            throw new TypeError('execute must be a function.');
        this.results = results;
        this.Results = results.asObservable();
        this.lifetime.add((canExecute ?? of(true)).subscribe({
            next: value => {
                this.userCanExecute = Boolean(value);
                this.setCanExecute(this.CanExecuteValue);
            },
            error: error => {
                this.userCanExecute = false;
                this.setCanExecute(false);
                this.reportException(error);
            },
        }));
    }
    static Create(execute, canExecute, outputScheduler) {
        if (typeof execute !== 'function')
            throw new TypeError('execute must be a function.');
        return new ReactiveCommand(input => of(execute(input)), canExecute, outputScheduler);
    }
    static CreateFromTask(execute, canExecute, outputScheduler) {
        return new ReactiveCommand(execute, canExecute, outputScheduler, true);
    }
    static CreateFromObservable(execute, canExecute, outputScheduler) {
        return new ReactiveCommand(execute, canExecute, outputScheduler);
    }
    /** Execute every child, combining the latest result from each child. */
    static CreateCombined(commands, canExecute, outputScheduler) {
        if (commands == null)
            throw new TypeError('commands are required.');
        const children = [...commands];
        if (!children.length)
            throw new RangeError('At least one child command is required.');
        const enabled = combineLatest([
            canExecute ?? of(true),
            ...(children.map(command => command.CanExecute)),
        ]).pipe(map(states => states.every(Boolean)));
        const combined = ReactiveCommand.CreateFromObservable(input => combineLatest(children.map(command => command.Execute(input))), enabled, outputScheduler);
        // Child errors are the sole aggregate exception source, including when a
        // child runs independently. Avoid reporting the same failure again when
        // combineLatest propagates it through the aggregate execution subscription.
        combined.forwardExecutionErrors = false;
        for (const child of children) {
            combined.lifetime.add(child.ThrownExceptions.subscribe(error => {
                combined.reportException(error);
            }));
        }
        return combined;
    }
    static create = ReactiveCommand.Create;
    static createFromTask = ReactiveCommand.CreateFromTask;
    static createFromObservable = ReactiveCommand.CreateFromObservable;
    static createCombined = ReactiveCommand.CreateCombined;
    get CanExecuteValue() { return !this.disposed && this.userCanExecute && this.inFlight === 0; }
    get IsExecutingValue() { return this.inFlight > 0; }
    get IsDisposed() { return this.disposed; }
    get canExecute$() { return this.CanExecute; }
    get isExecuting$() { return this.IsExecuting; }
    get thrownExceptions$() { return this.ThrownExceptions; }
    Execute(input) {
        return new Observable(downstream => {
            if (this.disposed) {
                const error = new Error('ReactiveCommand has been disposed.');
                error.name = 'ObjectDisposedError';
                downstream.error(error);
                return;
            }
            const controller = new AbortController();
            let ended = false;
            let cancelled = false;
            let taskSettled = false;
            let taskStarted = false;
            const inner = new Subscription();
            const finish = () => {
                if (ended)
                    return;
                ended = true;
                this.executions.delete(cancel);
                this.inFlight = Math.max(0, this.inFlight - 1);
                this.publishState();
            };
            const cancel = () => {
                if (!cancelled) {
                    cancelled = true;
                    controller.abort();
                    inner.unsubscribe();
                }
                if (!taskStarted || taskSettled || this.disposed)
                    finish();
                if (!downstream.closed)
                    downstream.complete();
            };
            this.executions.add(cancel);
            this.inFlight++;
            this.publishState();
            // Install cancellation before invoking user code; this also handles a
            // synchronous take(1) unsubscribe during source notification correctly.
            downstream.add(cancel);
            const value = (result) => {
                if (cancelled || downstream.closed || this.disposed)
                    return;
                downstream.next(result);
                this.schedule(() => this.results.next(result));
            };
            const fail = (error) => {
                finish();
                if (cancelled || downstream.closed || this.disposed)
                    return;
                if (this.forwardExecutionErrors)
                    this.reportException(error);
                downstream.error(error);
            };
            try {
                if (downstream.closed || this.disposed)
                    return;
                const source = this.executeFactory(input, controller.signal);
                if (this.tracksPromise) {
                    if (source == null || typeof source.then !== 'function') {
                        throw new TypeError('CreateFromTask must return a Promise or thenable.');
                    }
                    taskStarted = true;
                    Promise.resolve(source).then(result => {
                        taskSettled = true;
                        value(result);
                        finish();
                        downstream.complete();
                    }, error => {
                        taskSettled = true;
                        fail(error);
                    });
                }
                else {
                    const observer = new Subscriber({
                        next: value,
                        error: fail,
                        complete: () => { finish(); downstream.complete(); },
                    });
                    inner.add(observer);
                    from(source).subscribe(observer);
                }
            }
            catch (error) {
                fail(error);
            }
        });
    }
    /** Gated, eager execution for DOM events and ICommand-style use. */
    Invoke(input) {
        return this.CanExecuteValue
            ? this.Execute(input).subscribe({ error: () => { } })
            : Subscription.EMPTY;
    }
    execute(input) { return this.Execute(input); }
    invoke(input) { return this.Invoke(input); }
    executeAsync(input) {
        return new Promise((resolve, reject) => {
            let found = false;
            let last;
            this.Execute(input).subscribe({
                next: value => { found = true; last = value; },
                error: reject,
                complete: () => found ? resolve(last) : reject(new Error('The command completed without a result.')),
            });
        });
    }
    Dispose() {
        if (this.disposed)
            return;
        this.disposed = true;
        this.lifetime.unsubscribe();
        for (const cancel of [...this.executions])
            cancel();
        this.scheduled.unsubscribe();
        this.inFlight = 0;
        this.setCanExecute(false);
        if (this.executingState.value)
            this.executingState.next(false);
        this.canExecuteState.complete();
        this.executingState.complete();
        this.results.complete();
        this.exceptions.complete();
    }
    unsubscribe() { this.Dispose(); }
    dispose() { this.Dispose(); }
    setCanExecute(value) {
        if (this.canExecuteState.value !== value)
            this.canExecuteState.next(value);
    }
    publishState() {
        const executing = this.IsExecutingValue;
        this.schedule(() => {
            if (this.executingState.value !== executing)
                this.executingState.next(executing);
            this.setCanExecute(!this.disposed && this.userCanExecute && !executing);
        });
    }
    reportException(error) {
        this.schedule(() => {
            if (this.exceptions.observed)
                this.exceptions.next(error);
            else
                ReactiveCommand.DefaultExceptionHandler(error);
        });
    }
    schedule(action) {
        if (this.disposed)
            return;
        // Self-removing actions avoid retaining every completed scheduled result.
        const scheduled = this.outputScheduler.schedule(function () { action(); this.unsubscribe(); });
        this.scheduled.add(scheduled);
    }
}
export function InvokeCommand(sourceOrCommand, command) {
    const target = command ?? sourceOrCommand;
    const operator = source => source.pipe(withLatestFrom(target.CanExecute), filter(([, enabled]) => enabled && target.CanExecuteValue), mergeMap(([input]) => target.Execute(input).pipe(catchError(() => EMPTY))));
    if (!command)
        return operator;
    const subscription = operator(sourceOrCommand).subscribe({
        error: error => ReactiveCommand.DefaultExceptionHandler(error),
    });
    return Object.assign(subscription, { Dispose() { subscription.unsubscribe(); } });
}
export const invokeCommand = InvokeCommand;
//# sourceMappingURL=command.js.map