import { type Observable } from 'rxjs';
import { type IDisposable } from './disposables.js';
/** Providers emit property change notifications; they must not emit an initial property value. */
export interface IObservableForProperty {
    GetAffinityForObject(objectType: Function, propertyName: string, beforeChanged?: boolean): number;
    GetNotificationForProperty(sender: object, propertyName: string, beforeChanged?: boolean): Observable<unknown>;
}
/** Highest affinity wins; the most recently registered provider breaks ties. */
export declare class ObservablePropertyProviderRegistry {
    private readonly providers;
    Register(provider: IObservableForProperty): IDisposable;
    GetProvider(sender: object, propertyName: string, beforeChanged?: boolean): IObservableForProperty | undefined;
    Observe(sender: object, propertyName: string, beforeChanged?: boolean): Observable<unknown> | undefined;
    get Count(): number;
    Clear(): void;
}
export declare class ObservablePropertyProviders {
    static Current: ObservablePropertyProviderRegistry;
}
export declare function getPropertyChangeObservable(target: object, propertyName: string, beforeChange: boolean): Observable<unknown> | undefined;
//# sourceMappingURL=providers.d.ts.map