import type { ISubscriptionEvent } from '../src/types';

type IMockCallbacks = { [key in ISubscriptionEvent]: jest.Mock };
type IIteratedCallback = (k: ISubscriptionEvent, v: jest.Mock) => void;

export function forEachKeyValue<T extends IIteratedCallback>(
	obj: IMockCallbacks
) {
	const kv = Object.entries(obj);

	return function forEach(fn: T) {
		kv.forEach(([k, v]) => {
			fn(k as ISubscriptionEvent, v);
		});
	};
}
