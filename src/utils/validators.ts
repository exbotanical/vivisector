import { BaseObservable } from '../core/BaseObservable';
import { VxEventHandler } from '../types/base.types';
import { VxException } from './exceptions';

export function validateEventHandler (this: BaseObservable, eventName: string, handler: VxEventHandler): never | void /* TODO correct? */ {
	if (!(eventName in this.handlers)) {
		throw VxException.create(new VxException({
			reason: `An unknown event name '${eventName}' was provided; there are no subscribable events matching this identifier`,
			source: {
				lineno: 90,
				filename: 'src/core/BaseObservable.ts'
			}
		}));

	} else if (typeof handler !== 'function') {
		throw VxException.create(new VxException({
			reason: 'The provided event handler must',
			source: {
				lineno: 101,
				filename: 'src/core/BaseObservable.ts'
			}
		}));
	}
}
