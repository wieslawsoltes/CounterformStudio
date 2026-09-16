import { type Observer, type SchedulerLike } from 'rxjs';
export interface RxAppOptions {
    mainThreadScheduler?: SchedulerLike;
    taskpoolScheduler?: SchedulerLike;
    defaultExceptionHandler?: ((error: unknown) => void) | Pick<Observer<unknown>, 'next'>;
}
/** Application-wide scheduling defaults. Override UI dispatch before constructing view models. */
export declare class RxApp {
    static MainThreadScheduler: SchedulerLike;
    static TaskpoolScheduler: SchedulerLike;
    static DefaultExceptionHandler: ((error: unknown) => void) | Pick<Observer<unknown>, 'next'>;
    static Configure(options: RxAppOptions): void;
    static configure(options: RxAppOptions): void;
    static HandleException(error: unknown): void;
    static get mainThreadScheduler(): SchedulerLike;
    static set mainThreadScheduler(value: SchedulerLike);
    static get taskpoolScheduler(): SchedulerLike;
    static set taskpoolScheduler(value: SchedulerLike);
}
//# sourceMappingURL=rx-app.d.ts.map