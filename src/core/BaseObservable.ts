import {
  VX_EVENT_TYPES,
  VX_LISTENER_INTERNALS,
  VxState,
  VxEvent,
  VxEventHandler,
  VxEventHandlerStore,
  VxEventedObject
} from '../types/base.types';

import {
	defineNonConfigurableProp,
	validateEventHandler
} from '../utils';

/**
 * Implements base state and shared functionality for a Vivisector observable
 * @class BaseObservable
 */
export abstract class BaseObservable {
  protected handlers: VxEventHandlerStore;
  protected internals: VX_LISTENER_INTERNALS[];

  protected constructor () {
    /**
		 * Event-correlated handlers; below are defaults
		 * @property {VxEventHandlerStore}
		 */
    this.handlers = {
      [VX_EVENT_TYPES.ADD]: [],
      [VX_EVENT_TYPES.DEL]: [],
      [VX_EVENT_TYPES.SET]: []
    };

    this.internals = [
      ...Object.values(VX_LISTENER_INTERNALS)
    ];
  }

  /**
   * @summary Evaluates whether the given property is marked as non-configurable
   * @param {string} prop The property presently being accessed
   * @returns {boolean}
   */
  protected isConfigurableProp (prop: string): boolean {
    if (this.internals.includes(prop as VX_LISTENER_INTERNALS)) { // TODO forreal?
      // TODO throw
      return false;
    }

    return true;
  }

  /**
   * @summary Serially invokes each handler of the given event type
   * @param {object} event An object containing data about the event
   * @param {object} context The `this` value on which to call each instance
   */
  protected raiseEvent (event: VxEvent<VxState>, context: BaseObservable): void {
    this.handlers[event.type]
      .forEach(handler => {
        handler.call(context, event);
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
      (eventName: VX_EVENT_TYPES, handler: VxEventHandler): T => {
				validateEventHandler.call(this,
					eventName,
					handler
				);

        this.handlers[eventName].push(handler);

        return context;
      }
    );

    defineNonConfigurableProp(
      context,
      VX_LISTENER_INTERNALS.REM,
      (eventName: VX_EVENT_TYPES, handler: VxEventHandler): T => {
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
