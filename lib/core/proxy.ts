import { BaseObservableFactory } from './BaseObservableFactory';
import { VxState, VX_EVENT_TYPE } from '../types';
import {
  isArrayProto,
  isArrayPropOutOfBounds,
  shallowCopy
} from '../utils';
import { DoneFunctionBuilder } from './done';

const batchedMethods = [
  'shift',
  'unshift'
];

/**
 * @summary Construct a base proxy handler with an implicit context
 * @returns {ProxyHandler<VxState>} Base proxy handler
 */
export function RootHandlerFactory (this: BaseObservableFactory): ProxyHandler<VxState> {
  const rootHandler: ProxyHandler<VxState> = {
    get: (target, prop: keyof VxState, recv) => {
      // trap certain array prototype methods and take control of the events we raise for them
      // this allows us to prevent concurrent events e.g. `set` and `del` both arising due to `shift`

      // otherwise, a method like `splice` or the aforementioned `shift` will be handled by the proxy,
      // invoking traps for pulling an element out of the array, reindexing that array,
      // and modifying the array's length property

      // so here, we listen for one of these methods, then allow the call to `fall through`, where it
      // can be handled by the underlying array
      if (Array.isArray(target) && batchedMethods.includes(prop)) {
        const ogMethod = target[prop];

				return (...args: any[]) => { // eslint-disable-line @typescript-eslint/no-explicit-any
					const nextState = shallowCopy(target);
          let prevState = shallowCopy(target);

          if (args.length) {
            // raise the event for each argument
            for (const arg of args.reverse()) {

							ogMethod.apply(nextState, [arg]);

              this.raiseEvent({
                type: VX_EVENT_TYPE.ADD,
                prevState,
                nextState,
              }, this,
							DoneFunctionBuilder(() => ogMethod.apply(target, [arg])));

              prevState = shallowCopy(target);
            }

						return target.length;
          }

					return ogMethod.apply(target, args);
        };
      }

      // we use reflection to mitigate violation of Proxy invariants, as described in the specification here:
      // https://www.ecma-international.org/ecma-262/8.0/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
      const value = Reflect.get(target, prop, recv);

      // recurse, and continue the chain of Proxies for nested props to ensure traps are executed upon access thereof
      if (typeof value === 'object') {
        return new Proxy(value, rootHandler);
      }

      return value;
    },

    set: (target, prop, value) => {
      if (!this.isConfigurableProp(prop)) {
        return false;
      }

      if (isArrayProto(target, prop)) {
        return Reflect.set(target, prop, value);
      }

			const [prevState, nextState] = [shallowCopy(target), shallowCopy(target)];
			let ret = Reflect.set(nextState, prop, value);

      if (!(prop in prevState) || isArrayPropOutOfBounds(prevState, prop)) {
        this.raiseEvent({
          type: VX_EVENT_TYPE.ADD,
          prevState,
          nextState,
				}, this,
				DoneFunctionBuilder(() => Reflect.set(target, prop, value)));
      } else {
        this.raiseEvent({
          type: VX_EVENT_TYPE.SET,
          prevState,
          nextState,
				}, this,
				DoneFunctionBuilder(() => Reflect.set(target, prop, value)));
      }

      return ret;
    },

    deleteProperty: (target, prop) => {
      if (!this.isConfigurableProp(prop)) {
        return false;
      }

			const [prevState, nextState] = [shallowCopy(target), shallowCopy(target)];

      let ret = true;

      if (Array.isArray(nextState)) {
				nextState.splice(Number(prop), 1);

				this.raiseEvent({
					type: VX_EVENT_TYPE.DEL,
					prevState,
					nextState,
				}, this,
				// @ts-ignore
				DoneFunctionBuilder(() => target.splice(Number(prop), 1)));

				return ret;
      } else if (prop in prevState) {
        /*ret = */Reflect.deleteProperty(nextState, prop);

				this.raiseEvent({
					type: VX_EVENT_TYPE.DEL,
					prevState,
					nextState,
				}, this,
					DoneFunctionBuilder(() => Reflect.deleteProperty(target, prop)));

				return ret;
      }

      return ret;
    }
  };

  return rootHandler;
}
