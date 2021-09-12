import {
  VX_EVENT_TYPE,
  VX_LISTENER_INTERNALS,
  VxState,
  VxEvent,
  VxEventHandler,
  VxEventHandlerStore,
  VxEventedObject,
	DoneFunction
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
  protected handlers: VxEventHandlerStore;
  protected internals: VX_LISTENER_INTERNALS[];

  protected constructor () {
    /**
		 * Event-correlated handlers; below are defaults
		 * @property {VxEventHandlerStore}
		 */
    this.handlers = {
      [VX_EVENT_TYPE.ADD]: [],
      [VX_EVENT_TYPE.DEL]: [],
      [VX_EVENT_TYPE.SET]: []
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
   * @summary Serially invokes each handler of the given event type
   * @param {object} event An object containing data about the event
   * @param {object} context The `this` value on which to call each instance
   */
	protected raiseEvent (event: VxEvent<VxState>, context: BaseObservableFactory, done: DoneFunction): void {
    this.handlers[event.type]
      .forEach(handler => {
				handler.call(context, event, done);
      });
  }

  /**
   * @summary Programmatically define `addEventListener`, `removeEventListener` on the proxied object
   * @param context The context (i.e. `this` instance) of the target object on which the
   * aforementioned listeners will be defined
   */
  protected defineListeners <T extends VxState> (context: T): VxEventedObject {
    defineNonConfigurableProp(
      context,
      VX_LISTENER_INTERNALS.ADD,
      (eventName: VX_EVENT_TYPE, handler: VxEventHandler): T => {
				validateEventHandler.call(this,
					eventName,
					handler
				);

        this.handlers[eventName]
					.push(handler);

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

        const handlerSet = this.handlers[eventName];

        let handlerSetLen = handlerSet.length;

        while (--handlerSetLen >= 0) {
          if (handlerSet[handlerSetLen] === handler) {
            handlerSet.splice(handlerSetLen, 1);
          }
        }

        return context;
      }
    );

    return context as VxEventedObject;
  }
}
