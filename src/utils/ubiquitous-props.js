const debounce = (fn, ms) => {
    let timeout;
    return (args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(args), ms);
    };
};

const computeNamedFunction = (fn, name) => {
    Object.defineProperty(fn, "name", {
        value: name,
        configurable: true
    });
    return fn;
};

const defineAddEventListener = (context, handlers) => {
    // override addEventListener method of given array
    Object.defineProperty(context, "addEventListener", {
        configurable: false,
        enumerable: false,
        writable: false, // false; we do not want further tampering here
        value: function(eventName, handler, ms) {
            // sanitize and validate handler submissions
            // simple type-check: concatenate an empty string to coerce `eventName`
            eventName = ("" + eventName).toLowerCase(); 
            // ensure registered event's name corresponds to one of the presets in `_handlers`
            if (!(eventName in handlers)) {
                throw new Error("Error: Invalid event name.");
            }
            if (typeof handler !== "function") {
                throw new Error("Error: Invalid handler.");
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
};

const defineRemoveEventListener = (context, handlers) => {
    // override removeEventListener method of given array
    Object.defineProperty(context, "removeEventListener", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function(eventName, handler) {
            eventName = ("" + eventName).toLowerCase();
            if (!(eventName in handlers)) {
                throw new Error("Error: Invalid event name.");
            }
            if (typeof handler !== "function") {
                throw new Error("Error: Invalid handler.");
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
};

 // helper for event executions
 const raiseEvent = (event, context, handlers) => {
    handlers[event.type].forEach((handler) => {
        handler.call(context, event);
    });
};

module.exports = {
    defineAddEventListener,
    defineRemoveEventListener,
    raiseEvent,
    debounce,
    computeNamedFunction
};