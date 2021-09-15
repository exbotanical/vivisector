import {
	VX_EVENT_TYPE,
	VX_LISTENER_INTERNALS,
	VxState,
	VxEvent,
	VxEventHandler,
	VxEventHandlerStore,
	VxEventedObject,
	DoneFunction,
	VxAddEventListenerOpts
} from '../types';

import {
	defineNonConfigurableProp,
	validateEventHandler
} from '../utils';

/**
 * Implements base state and shared functionality for a Vivisector observable
 * @class BaseObservableFactory
 */
export abstract class BaseObservableFactory {
	protected handlerStore: VxEventHandlerStore;
	protected internals: VX_LISTENER_INTERNALS[];

	protected constructor () {
		/**
		 * Event-correlated handlers; below are defaults
		 * @property {VxEventHandlerStore}
		 */
		this.handlerStore = {
			[VX_EVENT_TYPE.ADD]: new Set(),
			[VX_EVENT_TYPE.DEL]: new Set(),
			[VX_EVENT_TYPE.SET]: new Set(),
			[VX_EVENT_TYPE.BATCHED]: new Set()
		};

		this.internals = [
			...Object.values(VX_LISTENER_INTERNALS)
		];
	}

	/**
	 * @summary Evaluates whether the given property is marked as non-configurable
	 * @param {string|symbol} prop The property presently being accessed
	 * @returns {boolean}
	 */
	protected isConfigurableProp (prop: string|symbol): boolean {
		return !this.internals.includes(prop);
	}

	/**
	 * @summary Programmatically define `addEventListener`, `removeEventListener` on the proxied object
	 * @param context The context (i.e. `this` instance) of the target object on which the
	 * aforementioned listeners will be defined
	 */
	protected defineListeners<T extends VxState> (context: T): VxEventedObject {
		defineNonConfigurableProp(
			context,
			VX_LISTENER_INTERNALS.ADD,
			(eventName: VX_EVENT_TYPE, handler: VxEventHandler, { alwaysCommit = false }: VxAddEventListenerOpts = {}): T => {
				validateEventHandler.call(this,
					eventName,
					handler
				);

				this.handlerStore[eventName]
					.add({ handler, alwaysCommit });

				return context;
			}
		);

		defineNonConfigurableProp(
			context,
			VX_LISTENER_INTERNALS.REM,
			(eventName: VX_EVENT_TYPE, handler: VxEventHandler): T => {
				validateEventHandler.call(this,
					eventName,
					handler
				);

				const handlers = this.handlerStore[eventName];

				handlers.forEach((ref) => {
					if (handler === ref.handler) {
						handlers.delete(ref);
					}
				});

				return context;
			}
		);

		return context as VxEventedObject;
	}

	/**
	 * @summary Serially invokes each handler of the given event type
	 * @param {object} event An object containing data about the event
	 * @param {object} context The `this` value on which to call each instance
	 */
	public raiseEvent (event: VxEvent<VxState>, context: BaseObservableFactory, done: DoneFunction): void {
		this.handlerStore[event.type]
			.forEach(({ handler, alwaysCommit }) => {
				let finalDoneFunction = done;

				if (alwaysCommit) {
					done(true);
					finalDoneFunction = () => { };
				}

				handler.call(context, event, finalDoneFunction);
			});
	}
}
