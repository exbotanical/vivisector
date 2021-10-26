import {
	defineNonConfigurableProp,
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

/**
 * Implements base state and shared functionality for a Vivisector observable
 * @class BaseObservableFactory
 *
 * @internal
 */
export abstract class BaseObservableFactory {
	protected observers: ISubscriptionStore;
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
	protected isConfigurableProp(prop: PropertyKey): boolean {
		if (typeof prop === 'string') {
			return !this.internals.includes(prop);
		}

		return false;
	}

	/**
	 * @summary Programmatically define `subscribe`, `unsubscribe` on the proxied object
	 * @param context The context of the target object on which the
	 * aforementioned listeners will be defined
	 */
	protected defineSubscribers(context: ISubject): IVivisectorApi {
		defineNonConfigurableProp.call(
			context,
			'subscribe',
			(eventName, handler, { alwaysCommit = false } = {}) => {
				validateEventName(
					eventName,
					Object.keys(this.observers) as ISubscriptionEvent[]
				);

				validateEventHandler(handler);

				this.observers[eventName].add({ handler, alwaysCommit });

				return context as IVivisectorApi;
			}
		);

		defineNonConfigurableProp.call(
			context,
			'unsubscribe',
			(eventName, handler) => {
				validateEventName(
					eventName,
					Object.keys(this.observers) as ISubscriptionEvent[]
				);

				validateEventHandler(handler);

				const handlers = this.observers[eventName];

				handlers.forEach((ref) => {
					if (handler === ref.handler) {
						handlers.delete(ref);
					}
				});

				return context as IVivisectorApi;
			}
		);

		return context as IVivisectorApi;
	}

	/**
	 * @summary Serially invokes each handler of the given event type
	 * @param event An object containing data about the event
	 * @param context The `this` value on which to call each instance
	 */
	public raiseEvent(
		event: ISubscriptionEventMetadata,
		done: IDoneFunction
	): void {
		this.observers[event.type].forEach(({ handler, alwaysCommit }) => {
			let finalDoneFunction = done;

			if (alwaysCommit) {
				done(true);
				finalDoneFunction = () => {};
			}

			handler(event, finalDoneFunction);
		});
	}
}
