import { IVivisectorApi, ISubject } from '../types';
import { shallowCopy } from '../utils';
import { BaseObservableFactory } from './BaseObservableFactory';
import { RootHandlerFactory } from './proxy';

/**
 * @summary Create proxies
 *
 * @internal
 */
export class ProxiedObservableFactory extends BaseObservableFactory {
	/**
	 * @summary Root Proxy handler; injects event broadcasts into get|set|delete traps
	 */
	private rootHandler: ProxyHandler<ISubject>;

	constructor() {
		super();

		this.rootHandler = RootHandlerFactory.call(this);
	}

	public create(initialState: ISubject): IVivisectorApi {
		const excisedInitialState = shallowCopy<ISubject>(initialState);

		return this.defineSubscribers(
			new Proxy(excisedInitialState, this.rootHandler)
		);
	}
}
