import { VxException } from './exceptions';

import type {
	ISubject,
	ISubscriptionCallback,
	ISubscriptionEvent
} from '../types';

/**
 * @see https://github.com/microsoft/TypeScript/issues/26916
 */

/**
 * Validate a provided event handler
 * @param handler
 *
 * @internal
 */
export function validateEventHandler(
	handler: unknown
): asserts handler is ISubscriptionCallback<ISubject> {
	if (typeof handler !== 'function') {
		throw VxException.create(
			new VxException({
				reason: 'The provided event handler must be a function'
			})
		);
	}
}

/**
 * Validate a provided event name
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

	if (!validEvents.includes(eventName as any)) {
		throw VxException.create(
			new VxException({
				reason: `An unknown event name '${eventName}' was provided; there are no subscribable events matching this identifier`
			})
		);
	}
}

/**
 * Evaluate whether `testValue` is a plain object
 * @param testValue
 *
 * @internal
 */
export const isObject = (testValue: unknown): testValue is Record<any, any> => {
	return {}.toString.call(testValue) == '[object Object]';
};
