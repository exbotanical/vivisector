import { eventedArrayPrototypeResolver } from '../adapters';
import { isArrayProto, isArrayPropOutOfBounds, shallowCopy } from '../utils';

import { DoneFunctionBuilder } from './done';

import type { ISubject } from '../types';
import type { BaseObservableFactory } from './factory';

const batchedMethods = ['shift', 'unshift', 'push', 'reverse', 'sort', 'pop'];

/**
 * Construct a base proxy handler with an implicit context
 * @returns {ProxyHandler<?>} Base proxy handler
 *
 * @internal
 */
export function RootHandlerFactory<S extends ISubject>(
	base: BaseObservableFactory<S>
) {
	const rootHandler: ProxyHandler<S> = {
		deleteProperty: (target, prop) => {
			if (!base.isConfigurableProp(prop)) {
				return false;
			}

			const [prevState, nextState] = [shallowCopy(target), shallowCopy(target)];

			const ret = true;

			// tested via public API
			// istanbul ignore next
			if (Array.isArray(nextState)) {
				const numericProp = Number(prop);

				nextState.splice(numericProp, 1);

				base.raiseEvent(
					{
						nextState,
						prevState,
						type: 'del'
					},
					DoneFunctionBuilder(() => target.splice(numericProp, 1))
				);

				return ret;
			} else if (prop in prevState) {
				Reflect.deleteProperty(nextState, prop);

				base.raiseEvent(
					{
						nextState,
						prevState,
						type: 'del'
					},
					DoneFunctionBuilder(() => Reflect.deleteProperty(target, prop))
				);

				return ret;
			}
			// istanbul ignore next
			return ret;
		},

		get: (target, prop, recv) => {
			// trap certain array prototype methods and take control of the events we raise for them
			// this allows us to prevent concurrent events e.g. `set` and `del` both arising due to `shift`

			// otherwise, a method like `splice` or the aforementioned `shift` will be handled by the proxy,
			// invoking traps for pulling an element out of the array, re-indexing that array,
			// and modifying the array's length property

			// so here, we listen for one of these methods, then allow the call to `fall through`, where it
			// can be handled by the underlying array
			if (Array.isArray(target) && batchedMethods.includes(prop as any)) {
				return eventedArrayPrototypeResolver(base, target, prop);
			}

			// we use reflection to mitigate violation of Proxy invariants, as described in the specification here:
			// https://www.ecma-international.org/ecma-262/8.0/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
			const value = Reflect.get(target, prop, recv);

			// recurse, and continue the chain of Proxies for nested props to ensure traps are executed upon access thereof
			if (typeof value === 'object' && value !== null) {
				return new Proxy(value, rootHandler);
			}

			return value;
		},

		set: (target, prop, value) => {
			if (!base.isConfigurableProp(prop)) {
				return false;
			}

			if (isArrayProto(target, prop)) {
				return Reflect.set(target, prop, value);
			}

			const [prevState, nextState] = [shallowCopy(target), shallowCopy(target)];
			const ret = Reflect.set(nextState, prop, value);
			const done = DoneFunctionBuilder(() => Reflect.set(target, prop, value));

			if (!(prop in prevState) || isArrayPropOutOfBounds(prevState, prop)) {
				base.raiseEvent(
					{
						nextState,
						prevState,
						type: 'add'
					},
					done
				);
			} else {
				base.raiseEvent(
					{
						nextState,
						prevState,
						type: 'set'
					},
					done
				);
			}

			return ret;
		}
	};

	return rootHandler;
}
