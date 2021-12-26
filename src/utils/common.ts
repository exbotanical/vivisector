import type {
	ISubscriptionCallback,
	ISubscriptionEvent,
	ISubscriptionOpts
} from '../types';

// eslint-disable-next-line @typescript-eslint/unbound-method
const unboundSlice = Array.prototype.slice;
const slice = Function.prototype.call.bind(unboundSlice);

/**
 * Shallow copy an object or array
 *
 * @internal
 */
export function shallowCopy<T>(base: T): T {
	if (Array.isArray(base)) {
		return slice(base);
	}

	const descriptors: Record<string, PropertyDescriptor> =
		Object.getOwnPropertyDescriptors(base);

	const keys = Reflect.ownKeys(descriptors);

	for (const key of keys as string[]) {
		const descriptor = descriptors[key];

		if (!descriptor.writable) {
			descriptor.writable = true;
			descriptor.configurable = true;
		}

		if (descriptor.get || descriptor.set) {
			descriptors[key] = {
				configurable: true,
				enumerable: descriptor.enumerable,
				value: base[key as keyof T],
				writable: !!descriptor.set
			};
		}
	}

	return Object.create(Object.getPrototypeOf(base), descriptors);
}

/**
 * Define a non-configurable function property `value` with name `name` on a given object `context`
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
		value,
		writable: false
	});
}

/**
 * Evaluate whether a given target is an array,
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
 * Evaluate whether a given property is a number (i.e. an array index),
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
