import { VxState } from '../types/base.types';

const unboundedSlice = Array.prototype.slice;
const slice = Function.prototype.call.bind(unboundedSlice);

/**
 * @summary Shallow copy an object or array
 */
export function shallowCopy (base: VxState): VxState {
  if (Array.isArray(base)) {
    return slice(base);
  }

  const descriptors = Object.getOwnPropertyDescriptors(base);

  const keys = Reflect.ownKeys(descriptors);

  for (let i = 0; i < keys.length; i++) {
		const key: any = keys[i]; // eslint-disable-line @typescript-eslint/no-explicit-any
    const desc = descriptors[key];

    if (!desc.writable) {
      desc.writable = true;
      desc.configurable = true;
    }

    if (desc.get || desc.set)
      descriptors[key] = {
        configurable: true,
        writable: !!desc.set,
        enumerable: desc.enumerable,
        value: base[key as keyof VxState]
      };
  }

  return Object.create(Object.getPrototypeOf(base), descriptors);
}

/**
 * @summary Define a non-configurable function property `value` with name `name` on a given object `context`
 * @param {VxState} context The object on which the property will be defined
 * @param {string} name The name of the property
 * @param {Function} value The value of the function property
 */
export function defineNonConfigurableProp (context: VxState, name: string, value: Function /* TODO fixme */): void {
  Object.defineProperty(context, name, {
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
  return Array.isArray(target)
    && Object.getOwnPropertyNames(Array.prototype)
      .includes(prop);
}

/**
 * @summary Evaluate whether a given property is a number (i.e. an array index),
 * and whether it is out of bounds relative to a given target
 * @param {VxState} target
 * @param {string|symbol} prop
 * @returns {boolean}
 */
export function isArrayPropOutOfBounds (target: VxState, prop: string | symbol): boolean {
  const maybeIdx = Number(prop);

  if (!Number.isNaN(maybeIdx)) return false;

  return Array.isArray(target) && (maybeIdx > (target.length - 1));
}
