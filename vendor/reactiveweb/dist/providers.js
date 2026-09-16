import { isObservable } from 'rxjs';
import { Disposable } from './disposables.js';
/** Highest affinity wins; the most recently registered provider breaks ties. */
export class ObservablePropertyProviderRegistry {
    providers = [];
    Register(provider) {
        const registration = { provider };
        this.providers.push(registration);
        return Disposable.Create(() => { const index = this.providers.indexOf(registration); if (index >= 0)
            this.providers.splice(index, 1); });
    }
    GetProvider(sender, propertyName, beforeChanged = false) {
        let best, affinity = 0;
        for (const { provider } of this.providers) {
            const score = provider.GetAffinityForObject(sender.constructor, propertyName, beforeChanged);
            if (Number.isFinite(score) && score > 0 && score >= affinity) {
                affinity = score;
                best = provider;
            }
        }
        return best;
    }
    Observe(sender, propertyName, beforeChanged = false) {
        const provider = this.GetProvider(sender, propertyName, beforeChanged);
        if (!provider)
            return undefined;
        const stream = provider.GetNotificationForProperty(sender, propertyName, beforeChanged);
        if (!isObservable(stream))
            throw new TypeError('An observable property provider must return an RxJS Observable');
        return stream;
    }
    get Count() { return this.providers.length; }
    Clear() { this.providers.length = 0; }
}
export class ObservablePropertyProviders {
    static Current = new ObservablePropertyProviderRegistry();
}
export function getPropertyChangeObservable(target, propertyName, beforeChange) {
    return ObservablePropertyProviders.Current.Observe(target, propertyName, beforeChange);
}
//# sourceMappingURL=providers.js.map