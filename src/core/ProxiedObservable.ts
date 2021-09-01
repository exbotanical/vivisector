import { VxEventedObject, VxState, VX_EVENT_TYPES } from '../types/base.types';
import { shallowCopy } from '../utils';
import { BaseObservable } from './BaseObservable';
import { RootHandlerFactory } from './proxy';

export class ProxiedObservable extends BaseObservable {
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

    const observableCtx = this;
    Object.defineProperty(proxy, 'shift', {
      configurable: true,
      value: function () {
        // only actionable if array contains elements
        if (this.length > 0) {
          const prevState = shallowCopy(this);

          const item = Array.prototype.shift.call(this);
          // remember, `shift` will not persist this change;
          // we simulate this behavior by deleting value at index `this.length`
          // delete this[this.length];

					observableCtx.raiseEvent({
            type: VX_EVENT_TYPES.DEL,
            prevState,
            nextState: this
					}, observableCtx);

          return item;
        }
      }
    });

    return proxy;
  }
}
