import { BaseObservable } from '../core/BaseObservable';
import { VxEventHandler } from '../types/base.types';
import { VxException } from './exceptions';

/**
 * @summary Validate a provided event handler name, value
 * @param {string} eventName
 * @param {Function} handler
 */
export function validateEventHandler (this: BaseObservable, eventName: string, handler: VxEventHandler): never|void {
	if (!(eventName in this.handlers)) {
		throw VxException.create(new VxException({
			reason: `An unknown event name '${eventName}' was provided; there are no subscribable events matching this identifier`
		}));

	} else if (typeof handler !== 'function') {
		throw VxException.create(new VxException({
			reason: 'The provided event handler must be a function'
		}));
	}
}
