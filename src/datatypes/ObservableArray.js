/**
 * @override
 * @readonly
 * @summary Factory for instantiating observable Array-like objects.
 * @description Copies array into Array-like object and hijacks specific instance's base prototype,
 *     thus creating an observable of type Array. Provides custom handlers for
 *     Array methods `push`, `pop`, `shift`, `unshift`, `splice`. `length`,
 *     Makes available custom index accessors provided the ObservableArray has been mutated by way
 *     of aforementioned methods, `length`, or the `value` accessor, which is common to all `Observables`.
 * @augments Array
 */
function ObservableArray(items) {

    // assign outermost local execution context vars for easier reference
    const _self = this,
        _handlers = {
            itemadded: [],
            itemremoved: [],
            itemset: [],
            mutated: []
        };

    let _array = [];

    // helper for configuring index accessors
    function defineIndexProperty(index) {
        if (!(index in _self)) {
            Object.defineProperty(_self, index, {
                configurable: true, // type of descriptor may be changed / deleted from corresponding obj
                enumerable: true, // enumerate to `true` so as to expose item indices
                get: function() {
                    return _array[index];
                },
                set: function(inboundItem) {
                    // set actual item to provided index
                    _array[index] = inboundItem;
                    raiseEvent({
                        type: "itemset",
                        index: index,
                        item: inboundItem
                    });
                }
            });
        }
    }

    // helper for event executions
    function raiseEvent(event) {
        _handlers[event.type].forEach((handler) => {
            handler.call(_self, event);
        });
    }

    // define accessor for actual array value
    Object.defineProperty(_self, "value", {
        configurable: false,
        enumerable: false,
        get: function() {
            return _array;
        },
        set: function(inboundItems) {
            if (inboundItems instanceof Array) {
                _array = inboundItems;
                raiseEvent({
                    type: "mutated",
                    index: "all",
                    item: inboundItems
                });
            }
        },
    });

    // override addEventListener method of given array
    Object.defineProperty(_self, "addEventListener", {
        configurable: false,
        enumerable: false,
        writable: false, // false; we do not want further tampering here
        value: function(eventName, handler) {
            // sanitize and validate handler submissions
            // simple type-check: concatenate an empty string to coerce `eventName`
            eventName = ("" + eventName).toLowerCase();
            // ensure registered event's name corresponds to one of the presets in `_handlers`
            if (!(eventName in _handlers)) {
                throw new Error("Invalid event name.");
            }
            if (typeof handler !== "function") {
                throw new Error("Invalid handler.");
            }
            // add handler to respective event nested Array
            _handlers[eventName].push(handler);
            // return `this` to allow method chaining across consistent parent Object / execution context
            return _self;
        }
    });

    // override removeEventListener method of given array
    Object.defineProperty(_self, "removeEventListener", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function(eventName, handler) {
            eventName = ("" + eventName).toLowerCase();
            if (!(eventName in _handlers)) {
                throw new Error("Invalid event name.");
            }
            if (typeof handler !== "function") {
                throw new Error("Invalid handler.");
            }
            // reference all handlers of given `eventName`
            const handlerSet = _handlers[eventName];
            let handlerSetLen = handlerSet.length;
            // ensure handler exists, lookup, remove
            while (--handlerSetLen >= 0) {
                if (handlerSet[handlerSetLen] === handler) {
                    // handler exists, remove
                    handlerSet.splice(handlerSetLen, 1);
                }
            }
            // return `this` to allow method chaining across consistent parent Object / execution context
            return _self;
        }
    });

    // override push method
    Object.defineProperty(_self, "push", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function(...args) {
            let index;
            // for each provided element, push into Array copy `_array`
            for (let i = 0, argsLen = args.length; i < argsLen; i++) {
                index = _array.length;
                _array.push(args[i]);
                // define index accessor for each element
                defineIndexProperty(index);
                // raise event for added element
                raiseEvent({
                    type: "itemadded",
                    index: index,
                    item: args[i]
                });
            }
            return _array.length;
        }
    });

    // override pop method
    Object.defineProperty(_self, "pop", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function() {
            if (_array.length > -1) {
                const index = _array.length - 1,
                    item = _array.pop();
                delete _self[index];

                raiseEvent({
                    type: "itemremoved",
                    index,
                    item
                });
                return item;
            }
        }
    });

    // override unshift method
    Object.defineProperty(_self, "unshift", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function(...args) {
            // NOTE this is one of those rare instances where we *need* `var`, lest the next loop's `i` be undefined due to
            // scoping behaviors of `let`
            for (var i = 0, argsLen = args.length; i < argsLen; i++) {
                _array.splice(i, 0, args[i]);
                defineIndexProperty(_array.length - 1);
                raiseEvent({
                    type: "itemadded",
                    index: i,
                    item: args[i]
                });
            }
            for (; i < _array.length; i++) {
                // raise event *for each* index change (i.e. all of them) ? currently, yes
                raiseEvent({
                    type: "itemset",
                    index: i,
                    item: _array[i]
                });
            }
            return _array.length;
        }
    });

    // override shift method
    Object.defineProperty(_self, "shift", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function() {
            // only actionable if Array contains elements
            if (_array.length > -1) {
                const item = _array.shift();
                // NOTE imperative; `shift` will not persist this change;
                // changes will, however, be reflected in _array.length
                delete _self[_array.length];
                raiseEvent({
                    type: "itemremoved",
                    index: 0,
                    item
                });
                return item;
            }
        }
    });

    // override splice method
    Object.defineProperty(_self, "splice", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function(...args) {
            let index = args[0];
            let numElements = args[1];
            const removed = [];
            let item,
                // optionally hoist position of item as `pos`
                pos;

            // calculate index qua splice parameters
            // we need `==` so as to coerce possible `undefined` to null during eval
            index = index == null ? 0 : index < 0 ? _array.length + index : index;

            // calculate number of elements qua splice parameters
            numElements = numElements == null ? _array.length - index : numElements > 0 ? numElements : 0;

            while (numElements--) {
                item = _array.splice(index, 1)[0];
                removed.push(item);
                delete _self[_array.length];
                raiseEvent({
                    type: "itemremoved",
                    index: index + removed.length - 1,
                    item
                });
            }
            for (let i = 2, argsLen = args.length; i < argsLen; i++) {
                _array.splice(index, 0, args[i]);
                defineIndexProperty(_array.length - 1);
                raiseEvent({
                    type: "itemadded",
                    index: index,
                    item: args[i]
                });
                index++;
            }

            return removed;
        }
    });

    // override `length` method
    Object.defineProperty(_self, "length", {
        configurable: false,
        enumerable: false,
        get: function() {
            return _array.length;
        },
        set: function(value) {
            const ephemeralLength = Number(value);
            const length = _array.length;
            if (ephemeralLength % 1 === 0 && ephemeralLength >= 0) {
                if (ephemeralLength < length) {
                    _self.splice(ephemeralLength);
                } else if (ephemeralLength > length) {
                    _self.push.apply(_self, new Array(ephemeralLength - length));
                }
            } else {
                throw new RangeError("Invalid array length");
            }
            _array.length = ephemeralLength;
        }
    });

    // process prototype for self instance to ensure we extend Array methods
    Object.getOwnPropertyNames(Array.prototype).forEach((name) => {
        // ensure prop isn't already allocated so as to avoid collisions
        if (!(name in _self)) {
            Object.defineProperty(_self, name, {
                configurable: false,
                enumerable: false,
                writable: false,
                value: Array.prototype[name]
            });
        }
    });

    // allocate inputs
    if (items instanceof Array) {
        // coerces _self into a container Array into which we copy ephemeral Array of `items`
        _self.push.apply(_self, items);
    }

}

module.exports = ObservableArray;

// /* Direct Usage */
// let users = new ObservableArray(["user one","user two"]);

// /* Synthetic Events */
// users.addEventListener("itemadded", function(syntheticEvent) {
//     console.log(`Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
// });

// users.addEventListener("itemremoved", function(syntheticEvent) {
//     console.log(`Removed ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
// });

// users.push("user three");
// users.pop();


