/**
 * @override 
 * @readonly
 * @summary A custom observable Array-like synthetic-primitive
 * @description Copies array into Array-like object and hijacks specific instance's base prototype,
 *     thus creating an observable synthetic-primitive of type Array. Provides custom handlers for
 *     Array methods `push`, `pop`, `shift`, `unshift`, `slice`, `splice`.
 *     Makes available custom index accessors provided the ObservableArray has been mutated by way 
 *     of aforementioned methods OR `length`.
 * @augments Array
 */

function ObservableArray(items) {
    var _self = this,
        _array = [],
        _handlers = {
            itemadded: [],
            itemremoved: [],
            itemset: []
        };
    // configure index accessors
    function defineIndexProperty(index) {
        if (!(index in _self)) {
            Object.defineProperty(_self, index, {
                configurable: true, // type of descriptor may be changed / deleted from corresponding obj
                enumerable: true, // enumerate prop ?
                get: function() {
                    return _array[index];
                },
                set: function(v) {
                    _array[index] = v;
                    raiseEvent({
                        type: "itemset",
                        index: index,
                        item: v
                    });
                }
            });
        }
    }
    // configure event-listener injections
    function raiseEvent(event) {
        _handlers[event.type].forEach(function(h) {
            h.call(_self, event);
        });
    }
    // override addEventListener method of given array
    Object.defineProperty(_self, "addEventListener", {
        configurable: false,
        enumerable: false,
        writable: false, // false; we do not want further tampering here
        value: function(eventName, handler) {
            // sanitize and validate handler submissions
            eventName = ("" + eventName).toLowerCase(); 
            if (!(eventName in _handlers)) {
                throw new Error("Invalid event name.");
            }
            if (typeof handler !== "function") {
                throw new Error("Invalid handler.");
            }
            // persist handler relative to given event
            _handlers[eventName].push(handler);
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
            var h = _handlers[eventName];
            var len = h.length;
            // ensure handler exists, lookup, remove
            while (--len >= 0) {
                if (h[len] === handler) {
                    h.splice(len, 1);
                }
            }
        }
    });
    // override push method
    Object.defineProperty(_self, "push", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function() {
            var index;
            for (var i = 0, len = arguments.length; i < len; i++) {
                index = _array.length;
                _array.push(arguments[i]);
                defineIndexProperty(index);
                raiseEvent({
                    type: "itemadded",
                    index: index,
                    item: arguments[i]
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
                var index = _array.length - 1,
                    item = _array.pop();
                delete _self[index];
                raiseEvent({
                    type: "itemremoved",
                    index: index,
                    item: item
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
        value: function() {
            for (var i = 0, len = arguments.length; i < len; i++) {
                _array.splice(i, 0, arguments[i]);
                defineIndexProperty(_array.length - 1);
                raiseEvent({
                    type: "itemadded",
                    index: i,
                    item: arguments[i]
                });
            }
            for (; i < _array.length; i++) {
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
            if (_array.length > -1) {
                var item = _array.shift();
                delete _self[_array.length];
                raiseEvent({
                    type: "itemremoved",
                    index: 0,
                    item: item
                });
                return item;
            }
        }
    });
    // override splice method -- modified code from SO post
    Object.defineProperty(_self, "splice", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: function(index, numElements) {
            var removed = [],
                    item,
                    pos;

            index = index == null ? 0 : index < 0 ? _array.length + index : index;

            numElements = numElements == null ? _array.length - index : numElements > 0 ? numElements : 0;

            while (numElements--) {
                item = _array.splice(index, 1)[0];
                removed.push(item);
                delete _self[_array.length];
                raiseEvent({
                    type: "itemremoved",
                    index: index + removed.length - 1,
                    item: item
                });
            }

            for (var i = 2, len = arguments.length; i < len; i++) {
                _array.splice(index, 0, arguments[i]);
                defineIndexProperty(_array.length - 1);
                raiseEvent({
                    type: "itemadded",
                    index: index,
                    item: arguments[i]
                });
                index++;
            }

            return removed;
        }
    });
    // override length method
    Object.defineProperty(_self, "length", {
        configurable: false,
        enumerable: false,
        get: function() {
            return _array.length;
        },
        set: function(value) {
            var ephemeralLength = Number(value);
            var length = _array.length;
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
            return value;
        }
    });
    // process prototype for self instance
    Object.getOwnPropertyNames(Array.prototype).forEach(function(name) {
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
        _self.push.apply(_self, items);
    }
}
    
module.exports = ObservableArray

// /* Usage */
// let users = new ObservableArray(["user one","user two"]);

// /* Synthetic Events */
// users.addEventListener("itemadded", function(syntheticEvent) {
//     console.log(`Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
// });

// users.addEventListener("itemremoved", function(syntheticEvent) {
//     console.log(`Removed ${syntheticEvent.item} at index ${syntheticEvent.index}."`);
// });

// users.push("user three");
// users.pop();
