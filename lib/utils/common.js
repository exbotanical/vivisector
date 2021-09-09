"use strict";
exports.__esModule = true;
exports.isArrayPropOutOfBounds = exports.isArrayProto = exports.defineNonConfigurableProp = exports.shallowCopy = void 0;
var unboundedSlice = Array.prototype.slice;
var slice = Function.prototype.call.bind(unboundedSlice);
/**
 * @summary Shallow copy an object or array
 */
function shallowCopy(base) {
    if (Array.isArray(base)) {
        return slice(base);
    }
    var descriptors = Object.getOwnPropertyDescriptors(base);
    var keys = Reflect.ownKeys(descriptors);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i]; // eslint-disable-line @typescript-eslint/no-explicit-any
        var desc = descriptors[key];
        if (!desc.writable) {
            desc.writable = true;
            desc.configurable = true;
        }
        if (desc.get || desc.set)
            descriptors[key] = {
                configurable: true,
                writable: !!desc.set,
                enumerable: desc.enumerable,
                value: base[key]
            };
    }
    return Object.create(Object.getPrototypeOf(base), descriptors);
}
exports.shallowCopy = shallowCopy;
/**
 * @summary Define a non-configurable function property `value` with name `name` on a given object `context`
 * @param {VxState} context The object on which the property will be defined
 * @param {string} name The name of the property
 * @param {Function} value The value of the function property
 */
function defineNonConfigurableProp(context, name, value) {
    Object.defineProperty(context, name, {
        configurable: false,
        enumerable: false,
        writable: false,
        value: value
    });
}
exports.defineNonConfigurableProp = defineNonConfigurableProp;
/**
 * @summary Evaluate whether a given target is an array,
 * and whether a given property exists on that array's prototype
 * @param {VxState} target
 * @param {string|symbol} prop
 * @returns {boolean}
 */
function isArrayProto(target, prop) {
    return Array.isArray(target)
        && Object.getOwnPropertyNames(Array.prototype)
            .includes(prop);
}
exports.isArrayProto = isArrayProto;
/**
 * @summary Evaluate whether a given property is a number (i.e. an array index),
 * and whether it is out of bounds relative to a given target
 * @param {VxState} target
 * @param {string|symbol} prop
 * @returns {boolean}
 */
function isArrayPropOutOfBounds(target, prop) {
    var maybeIdx = Number(prop);
    if (!Number.isNaN(maybeIdx))
        return false;
    return Array.isArray(target) && (maybeIdx > (target.length - 1));
}
exports.isArrayPropOutOfBounds = isArrayPropOutOfBounds;
