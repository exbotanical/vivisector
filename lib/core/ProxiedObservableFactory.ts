import { VxEventedObject, VxState, VX_EVENT_TYPE } from '../types';
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
    const proxy = this.defineListeners(new Proxy(excisedInitialState, this.rootHandler));

		if (Array.isArray(excisedInitialState)) {
			const observableCtx = this;

			Object.defineProperty(proxy, 'shift', {
				configurable: true,
				value: function () {
					// only actionable if array contains elements
					if (this.length > 0) {
						const prevState = shallowCopy(this);

						const item = Array.prototype.shift.call(this);

						observableCtx.raiseEvent({
							type: VX_EVENT_TYPE.DEL,
							prevState,
							nextState: this
						}, observableCtx);

						return item;
					}
				}
			});
		}

    return proxy;
  }
}
