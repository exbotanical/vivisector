import type {
	ISubscriptionCallback,
	ISubscriptionEvent,
	ISubscriptionOpts
} from '../types';

const unboundSlice = Array.prototype.slice;
const slice = Function.prototype.call.bind(unboundSlice);

/**
 * @summary Shallow copy an object or array
 *
 * @internal
 */
export function shallowCopy<T>(base: T): T {
	if (Array.isArray(base)) {
		return slice(base);
	}

	const descriptors: Record<any, any> = Object.getOwnPropertyDescriptors(base);

	const keys = Reflect.ownKeys(descriptors);

	for (let i = 0; i < keys.length; i++) {
		const key: any = keys[i];
		const descriptor = descriptors[key];

		if (!descriptor.writable) {
			descriptor.writable = true;
			descriptor.configurable = true;
		}

		if (descriptor.get || descriptor.set) {
			descriptors[key] = {
				configurable: true,
				writable: !!descriptor.set,
				enumerable: descriptor.enumerable,
				value: base[key as keyof T]
			};
		}
	}

	return Object.create(Object.getPrototypeOf(base), descriptors);
}

/**
 * @summary Define a non-configurable function property `value` with name `name` on a given object `context`
 * @param name The name of the property
 * @param value The value of the function property
 *
 * @internal
 */
export function defineNonConfigurableProp<S>(
	context: S,
	name: string,
	value: (
		eventName: ISubscriptionEvent,
		handler: ISubscriptionCallback<S>,
		opts: ISubscriptionOpts
	) => void
): void {
	Object.defineProperty<typeof context>(context, name, {
		configurable: false,
		enumerable: false,
		writable: false,
		value
	});
}

/**
 * @summary Evaluate whether a given target is an array,
 * and whether a given property exists on that array's prototype
 * @param target
 * @param prop
 *
 * @internal
 */
export function isArrayProto(target: unknown, prop: PropertyKey): boolean {
	return (
		Array.isArray(target) &&
		Object.getOwnPropertyNames(Array.prototype).includes(prop as string)
	);
}

/**
 * @summary Evaluate whether a given property is a number (i.e. an array index),
 * and whether it is out of bounds relative to a given target
 * @param target
 * @param prop
 *
 * @internal
 */
export function isArrayPropOutOfBounds(
	target: unknown,
	prop: PropertyKey
): boolean {
	const maybeIdx = Number(prop);

	if (!Number.isNaN(maybeIdx)) return false;

	return Array.isArray(target) && maybeIdx > target.length - 1;
}
