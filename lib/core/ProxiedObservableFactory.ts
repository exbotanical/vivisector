import { VxEventedObject, VxState } from '../types';
import { shallowCopy } from '../utils';
import { BaseObservableFactory } from './BaseObservableFactory';
import { RootHandlerFactory } from './proxy';

export class ProxiedObservableFactory extends BaseObservableFactory {
	/**
	 * @summary Root Proxy handler; injects event broadcasts into get|set|delete traps
	 * @type {ProxyHandler<VxState>}
	 */
	private rootHandler: ProxyHandler<VxState>;

	constructor () {
		super();

		this.rootHandler = RootHandlerFactory
			.call(this);
	}

	public create (initialState: VxState): VxEventedObject {
		const excisedInitialState = shallowCopy(initialState);

		return this.defineListeners(
			new Proxy(
				excisedInitialState,
				this.rootHandler
			)
		);
	}
}
