import {
	defineNonConfigurableProp,
	shallowCopy,
	validateEventHandler,
	validateEventName
} from '../utils';

import type {
	IDoneFunction,
	ISubscriptionEvent,
	ISubscriptionEventMetadata,
	ISubscriptionStore,
	IVivisectorApi,
	ISubject
} from '../types';
import { RootHandlerFactory } from './proxy';

/**
 * Implements base state and shared functionality for a Vivisector observable
 * @class BaseObservableFactory
 *
 * @internal
 */
export abstract class BaseObservableFactory<S> {
	protected observers: ISubscriptionStore<S>;
	protected internals: string[];

	protected constructor() {
		/**
		 * Event-correlated handlers; below are defaults
		 */
		this.observers = {
			add: new Set(),
			del: new Set(),
			set: new Set(),
			batched: new Set()
		} as const;

		this.internals = ['subscribe', 'unsubscribe'];
	}

	/**
	 * @summary Evaluates whether the given property is marked as non-configurable
	 * @param prop The property presently being accessed
	 */
	public isConfigurableProp(prop: PropertyKey): boolean {
		// see -> https://github.com/microsoft/TypeScript/issues/26255
		// btw, this is where TypeScript's bizarre `Array.prototype.includes` approach could screw us over
		// if I followed TS' way, I may only pass a string to `includes`, which means if we receive a symbol, we'll return false
		// which would propagate to the proxy and lead to a invariant violation
		return !this.internals.includes(prop as any);
	}

	/**
	 * @summary Programmatically define `subscribe`, `unsubscribe` on the proxied object
	 * @param context The context of the target object on which the
	 * aforementioned listeners will be defined
	 */
	protected defineSubscribers<S>(context: S): IVivisectorApi<S> {
		defineNonConfigurableProp<S>(
			context,
			'subscribe',
			(eventName, handler, { alwaysCommit = false } = {}) => {
				validateEventName(
					eventName,
					Object.keys(this.observers) as ISubscriptionEvent[]
				);

				validateEventHandler(handler);

				this.observers[eventName].add({ handler, alwaysCommit });

				return context;
			}
		);

		defineNonConfigurableProp<S>(
			context,
			'unsubscribe',
			(eventName, handler) => {
				// both validators are tested via the public API
				// istanbul ignore next
				validateEventName(
					eventName,
					Object.keys(this.observers) as ISubscriptionEvent[]
				);

				// istanbul ignore next
				validateEventHandler(handler);

				const handlers = this.observers[eventName];

				handlers.forEach((ref) => {
					if (handler === ref.handler) {
						handlers.delete(ref);
					}
				});

				return context;
			}
		);

		return context as IVivisectorApi<S>;
	}

	/**
	 * @summary Serially invokes each handler of the given event type
	 * @param event An object containing data about the event
	 * @param context The `this` value on which to call each instance
	 */
	public raiseEvent(
		event: ISubscriptionEventMetadata<S>,
		done: IDoneFunction
	): void {
		this.observers[event.type].forEach(({ handler, alwaysCommit }) => {
			let finalDoneFunction = done;

			// tested via public API
			// istanbul ignore next
			if (alwaysCommit) {
				done(true);
				finalDoneFunction = () => {};
			}

			handler(event, finalDoneFunction);
		});
	}
}

/**
 * @summary Create proxies
 *
 * @internal
 */
export class ProxiedObservableFactory<S> extends BaseObservableFactory<S> {
	/**
	 * @summary Root Proxy handler; injects event broadcasts into get|set|delete traps
	 */
	public static create<S extends ISubject>(initialState: S) {
		const excisedInitialState = shallowCopy<S>(initialState);
		const instance = new ProxiedObservableFactory();

		return instance.defineSubscribers<S>(
			new Proxy(excisedInitialState, RootHandlerFactory<S>(instance))
		);
	}
}
