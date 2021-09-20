import { VxState } from '../types';

interface VxPropertyDescriptor {
	[x: string]: PropertyDescriptor;
}

type VxStateDescriptors = object & VxPropertyDescriptor;

const unboundSlice = Array.prototype.slice;
const slice = Function.prototype.call.bind(unboundSlice);

/**
 * @summary Shallow copy an object or array
 */
export function shallowCopy <T extends VxState> (base: T): T {
	if (Array.isArray(base)) {
		return slice(base);
	}

	const descriptors: VxStateDescriptors = Object.getOwnPropertyDescriptors(base);

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
				value: base[key as keyof VxState]
			};
		}
	}

	return Object.create(
		Object.getPrototypeOf(base),
		descriptors
	);
}

/**
 * @summary Define a non-configurable function property `value` with name `name` on a given object `context`
 * @param {string} name The name of the property
 * @param {Function} value The value of the function property
 */
export function defineNonConfigurableProp (this: VxState, name: string, value: Function): void {
	Object.defineProperty(this, name, {
		configurable: false,
		enumerable: false,
		writable: false,
		value
	});
}

/**
 * @summary Evaluate whether a given target is an array,
 * and whether a given property exists on that array's prototype
 * @param {VxState} target
 * @param {string|symbol} prop
 * @returns {boolean}
 */
export function isArrayProto (target: VxState, prop: string|symbol): boolean {
	return Array.isArray(target) &&
		Object.getOwnPropertyNames(Array.prototype)
			.includes(prop);
}

/**
 * @summary Evaluate whether a given property is a number (i.e. an array index),
 * and whether it is out of bounds relative to a given target
 * @param {VxState} target
 * @param {string|symbol} prop
 * @returns {boolean}
 */
export function isArrayPropOutOfBounds (target: VxState, prop: string|symbol): boolean {
	const maybeIdx = Number(prop);

	if (!Number.isNaN(maybeIdx)) return false;

	return Array.isArray(target) && (maybeIdx > (target.length - 1));
}
