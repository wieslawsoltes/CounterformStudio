import { asyncScheduler, queueScheduler } from 'rxjs';
/** Application-wide scheduling defaults. Override UI dispatch before constructing view models. */
export class RxApp {
    static MainThreadScheduler = queueScheduler;
    static TaskpoolScheduler = asyncScheduler;
    static DefaultExceptionHandler = {
        next(error) { console.error('Unhandled ReactiveWeb exception:', error); }
    };
    static Configure(options) {
        if (options.mainThreadScheduler)
            this.MainThreadScheduler = options.mainThreadScheduler;
        if (options.taskpoolScheduler)
            this.TaskpoolScheduler = options.taskpoolScheduler;
        if (options.defaultExceptionHandler)
            this.DefaultExceptionHandler = options.defaultExceptionHandler;
    }
    static configure(options) { this.Configure(options); }
    static HandleException(error) {
        const handler = this.DefaultExceptionHandler;
        if (typeof handler === 'function')
            handler(error);
        else
            handler.next(error);
    }
    static get mainThreadScheduler() { return this.MainThreadScheduler; }
    static set mainThreadScheduler(value) { this.MainThreadScheduler = value; }
    static get taskpoolScheduler() { return this.TaskpoolScheduler; }
    static set taskpoolScheduler(value) { this.TaskpoolScheduler = value; }
}
//# sourceMappingURL=rx-app.js.map