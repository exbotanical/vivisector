module.exports = {
  defineAddEventListener,
  defineRemoveEventListener,
  raiseEvent,
  debounce,
  computeNamedFunction
};

/**
 * @param {Function} fn The callback to be executed after the timeout is lifted.
 * @param {Number} ms A number denoting milliseconds until timeout is lifted.
 * @summary Debounces a function call by `ms` milliseconds.
 */
function debounce (fn, ms) {
  let timeout;
  return (args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(args), ms);
  };
}

/**
 * @param {Function} fn The function to be granted a computed name property.
 * @param {String} name The value of prop `name`.
 * @summary Accepts as input a function and assigns to it a computed name property of value `name`.
 * @returns {Function} The passed function, now accompanied by a computed name property.
 */
function computeNamedFunction (fn, name) {
  Object.defineProperty(fn, 'name', {
    value: name,
    configurable: true
  });
  return fn;
}

/**
 * @param {Object} context The Object instance on which to define prop `addEventListener`.
 * @param {Object} handlers The provided instance's handlers store.
 * @summary Defines `addEventListener` property.
 */
function defineAddEventListener (context, handlers) {
  // override addEventListener method of given array
  Object.defineProperty(context, 'addEventListener', {
    configurable: false,
    enumerable: false,
    writable: false, // false; we do not want further tampering here
    value: function (eventName, handler, ms) {
      // sanitize and validate handler submissions
      // simple type-check: concatenate an empty string to coerce `eventName`
      eventName = ('' + eventName).toLowerCase(); 
      // ensure registered event's name corresponds to one of the presets in `_handlers`
      if (!(eventName in handlers)) {
        throw new Error('Error: Invalid event name.');
      }
      if (typeof handler !== 'function') {
        throw new Error('Error: Invalid handler.');
      }
      if (ms) {
        const machinedProperty = handler.name;
        handler = debounce(handler, ms);
        handler = computeNamedFunction(handler, machinedProperty);
      }
      // add handler to respective event store Array 
      handlers[eventName].push(handler);
      // explicitly return `context` to allow method chaining across consistent parent Object / execution context
      return context;
    }
  });
}

/**
 * @param {Object} context The Object instance on which to define prop `removeEventListener`.
 * @param {Object} handlers The provided instance's handlers store.
 * @summary Defines `removeEventListener` property.
 */
function defineRemoveEventListener (context, handlers) {
  // override removeEventListener method of given array
  Object.defineProperty(context, 'removeEventListener', {
    configurable: false,
    enumerable: false,
    writable: false,
    value: function (eventName, handler) {
      eventName = ('' + eventName).toLowerCase();
      if (!(eventName in handlers)) {
        throw new Error('Error: Invalid event name.');
      }
      if (typeof handler !== 'function') {
        throw new Error('Error: Invalid handler.');
      }
      // reference all handlers of given `eventName`
      const handlerSet = handlers[eventName];
      let handlerSetLen = handlerSet.length;
      // ensure handler exists, lookup, remove
      while (--handlerSetLen >= 0) {
        // we eval via the handler's name property given some handlers will have been recomputed with the
        // `debounce` wrapper; by-value comparison is included to handle anon fns.
        if (handlerSet[handlerSetLen] === handler || handlerSet[handlerSetLen].name === handler.name) {
          // handler exists, remove
          // NOTE: w/out explicit `return`, this loop will continue removing *all* matched handlers
          handlerSet.splice(handlerSetLen, 1);
        }
      }
      // explicitly return `context` to allow method chaining across consistent parent Object / execution context
      return context;
    }
  });
}

/**
 * @param {Object} event An Object containing event-contingent data.
 * @param {Object} context The `this` value on which to call each instance.
 * @param {Object} handlers The provided instance's handlers store.
 * @summary Systematically calls each handler of a given event type.
 */
function raiseEvent (event, context, handlers) {
  handlers[event.type].forEach((handler) => {
    handler.call(context, event);
  });
}
