import type { ISubscriptionEvent } from '../types';
import { VxException } from './exceptions';


// must use >= v4.4 see https://github.com/microsoft/TypeScript/pull/44512
export interface IObject {
	[key: PropertyKey]: any;
}

/**
 * @see https://github.com/microsoft/TypeScript/issues/26916
 */

/**
 * @summary Validate a provided event handler
 * @param handler
 *
 * @internal
 */
export function validateEventHandler(
	handler: unknown
): asserts handler is ISubscriptionEvent {
	if (typeof handler !== 'function') {
		throw VxException.create(
			new VxException({
				reason: 'The provided event handler must be a function'
			})
		);
	}
}

/**
 * @summary Validate a provided event name
 * @param eventName
 * @param validEvents - a list of possible valid event names
 *
 * @internal
 */
export function validateEventName(
	eventName: unknown,
	validEvents: ISubscriptionEvent[]
): asserts eventName is ISubscriptionEvent {
	if (typeof eventName !== 'string') {
		throw VxException.create(
			new VxException({
				reason: `Event name must be a string`
			})
		);
	}

	// I cannot stress enough how much I disagree with the TS team on WHY this is necessary
	// see https://github.com/microsoft/TypeScript/issues/26255
	if (!validEvents.includes(eventName as any)) {
		throw VxException.create(
			new VxException({
				reason: `An unknown event name '${eventName}' was provided; there are no subscribable events matching this identifier`
			})
		);
	}
}

/**
 * @summary Evaluate whether `testValue` is a plain object
 * @param testValue
 *
 * @internal
 */
export const isObject = (testValue: unknown): testValue is IObject => {
	return {}.toString.call(testValue) == '[object Object]';
};
