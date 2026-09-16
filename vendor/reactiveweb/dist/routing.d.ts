import { Observable } from 'rxjs';
import { type IDisposable, type DisposableLike } from './disposables.js';
import { ObservableCollection } from './collections.js';
import { ReactiveCommand } from './command.js';
export interface IScreen {
    readonly Router: RoutingState;
}
export interface IRoutableViewModel {
    readonly UrlPathSegment: string;
    readonly HostScreen: IScreen;
}
export declare class RoutingState<T extends IRoutableViewModel = IRoutableViewModel> implements IDisposable {
    readonly NavigationStack: ObservableCollection<T>;
    readonly CurrentViewModel: Observable<T | null>;
    readonly Navigate: ReactiveCommand<T, T>;
    readonly NavigateBack: ReactiveCommand<void, T | null>;
    readonly NavigateAndReset: ReactiveCommand<T, T>;
    constructor();
    private validate;
    get CurrentViewModelValue(): T | null;
    get CurrentPath(): string;
    FindViewModelInStack<TView extends T>(type: new (...args: any[]) => TView): TView | undefined;
    Dispose(): void;
    unsubscribe(): void;
}
export declare function WhenNavigatedTo(viewModel: IRoutableViewModel): Observable<void>;
export declare function WhenNavigatedTo(viewModel: IRoutableViewModel, onNavigate: () => DisposableLike): IDisposable;
export declare function WhenNavigatedFrom(viewModel: IRoutableViewModel): Observable<void>;
export declare function IsCurrentViewModel(viewModel: IRoutableViewModel): Observable<boolean>;
export declare const WhenNavigatedToObservable: (viewModel: IRoutableViewModel) => Observable<void>;
export declare const WhenNavigatingFromObservable: typeof WhenNavigatedFrom;
//# sourceMappingURL=routing.d.ts.map