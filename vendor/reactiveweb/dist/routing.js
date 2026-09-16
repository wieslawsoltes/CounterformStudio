import { Observable, distinctUntilChanged, map } from 'rxjs';
import { Disposable, dispose } from './disposables.js';
import { ObservableCollection } from './collections.js';
import { ReactiveCommand } from './command.js';
export class RoutingState {
    NavigationStack = new ObservableCollection();
    CurrentViewModel;
    Navigate;
    NavigateBack;
    NavigateAndReset;
    constructor() {
        this.CurrentViewModel = this.NavigationStack.ItemsChanged.pipe(map(stack => stack.at(-1) ?? null), distinctUntilChanged());
        this.Navigate = ReactiveCommand.Create(viewModel => {
            this.validate(viewModel);
            this.NavigationStack.Add(viewModel);
            return viewModel;
        });
        this.NavigateBack = ReactiveCommand.Create(() => {
            if (this.NavigationStack.Count > 1)
                this.NavigationStack.RemoveAt(this.NavigationStack.Count - 1);
            return this.CurrentViewModelValue;
        }, this.NavigationStack.CountChanged.pipe(map(count => count > 1)));
        this.NavigateAndReset = ReactiveCommand.Create(viewModel => {
            this.validate(viewModel);
            this.NavigationStack.Reset([viewModel]);
            return viewModel;
        });
    }
    validate(viewModel) {
        if (!viewModel || typeof viewModel.UrlPathSegment !== 'string')
            throw new TypeError('Navigation requires an IRoutableViewModel with UrlPathSegment');
    }
    get CurrentViewModelValue() { return this.NavigationStack.Items.at(-1) ?? null; }
    get CurrentPath() { return this.NavigationStack.Items.map(item => item.UrlPathSegment).join('/'); }
    FindViewModelInStack(type) {
        return [...this.NavigationStack.Items].reverse().find(item => item instanceof type);
    }
    Dispose() { this.Navigate.Dispose(); this.NavigateBack.Dispose(); this.NavigateAndReset.Dispose(); this.NavigationStack.Dispose(); }
    unsubscribe() { this.Dispose(); }
}
export function WhenNavigatedTo(viewModel, onNavigate) {
    if (onNavigate) {
        let resource, current = false;
        const subscription = viewModel.HostScreen.Router.CurrentViewModel.subscribe(value => {
            const isCurrent = value === viewModel;
            if (isCurrent && !current) {
                current = true;
                resource = onNavigate();
            }
            else if (!isCurrent && current) {
                current = false;
                const old = resource;
                resource = undefined;
                dispose(old);
            }
        });
        return Disposable.Create(() => { subscription.unsubscribe(); dispose(resource); resource = undefined; });
    }
    return new Observable(subscriber => {
        let wasCurrent = false;
        return viewModel.HostScreen.Router.CurrentViewModel.subscribe(current => {
            const isCurrent = current === viewModel;
            if (isCurrent && !wasCurrent)
                subscriber.next();
            wasCurrent = isCurrent;
        });
    });
}
export function WhenNavigatedFrom(viewModel) {
    return new Observable(subscriber => {
        let wasCurrent = false;
        return viewModel.HostScreen.Router.CurrentViewModel.subscribe(current => {
            const isCurrent = current === viewModel;
            if (!isCurrent && wasCurrent)
                subscriber.next();
            wasCurrent = isCurrent;
        });
    });
}
export function IsCurrentViewModel(viewModel) {
    return viewModel.HostScreen.Router.CurrentViewModel.pipe(map(current => current === viewModel), distinctUntilChanged());
}
export const WhenNavigatedToObservable = (viewModel) => WhenNavigatedTo(viewModel);
export const WhenNavigatingFromObservable = WhenNavigatedFrom;
//# sourceMappingURL=routing.js.map