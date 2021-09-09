"use strict";
exports.__esModule = true;
exports.validateEventHandler = void 0;
var exceptions_1 = require("./exceptions");
/**
 * @summary Validate a provided event handler name, value
 * @param {string} eventName
 * @param {Function} handler
 */
function validateEventHandler(eventName, handler) {
    if (!(eventName in this.handlers)) {
        throw exceptions_1.VxException.create(new exceptions_1.VxException({
            reason: "An unknown event name '" + eventName + "' was provided; there are no subscribable events matching this identifier"
        }));
    }
    else if (typeof handler !== 'function') {
        throw exceptions_1.VxException.create(new exceptions_1.VxException({
            reason: 'The provided event handler must be a function'
        }));
    }
}
exports.validateEventHandler = validateEventHandler;
