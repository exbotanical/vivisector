const { defineAddEventListener, defineRemoveEventListener, raiseEvent } = require("../utils/ubiquitous-props.js");

/**
 * @override
 * @summary Factory for instantiating observable Array-like objects.
 * @description Copies array into Array-like object and hijacks specific instance's base prototype,
 *     thus creating an observable of type Array. Provides custom handlers for
 *     Array methods `push`, `pop`, `shift`, `unshift`, `splice`. `length`,
 *     Makes available custom index accessors provided the ObservableArray has been mutated by way
 *     of aforementioned methods, `length`, or the `value` accessor, which is common to all `Observables`.
 * @augments Array
 */
function ObservableArray(items) {

    // `this` is used throughout as a mutable constructor
    const _self = this,
        _handlers = {
            itemadded: [],
            itemremoved: [],
            itemset: [],
            mutated: []
        };
    // internal value store
    let _array = [];

    // helper for configuring index accessors
    const defineIndexProperty = (index) => {
        if (!(index in _self)) {
            Object.defineProperty(_self, index, {
                configurable: true, // type of descriptor may be changed / deleted from corresponding obj
                enumerable: true, // enumerate to `true` so as to expose item indices
                get: () => _array[index],
                set: (inboundItem) => {
                    // set actual item to provided index
                    _array[index] = inboundItem;
                    raiseEvent({
                        type: "itemset",
                        index: index,
                        item: inboundItem
                    }, _self, _handlers);
                }
            });
        }
    };

    // define accessor for actual array value
    Object.defineProperty(_self, "value", {
        configurable: false,
        enumerable: false,
        get: () => _array,
        set: (inboundItems) => {
            if (inboundItems instanceof Array) {
                _array = inboundItems;
                raiseEvent({
                    type: "mutated",
                    index: "all",
                    item: inboundItems
                }, _self, _handlers);
            }
        },
    });

    /* Custom Methods */

    // given a value, returns an Array of indices which match said value
    Object.defineProperty(_self, "findIndexAll", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: (value) => {
            const indices = [];
            _array.forEach((item, index) => {
                if (item === value) {
                    indices.push(index);
                }
            });
            return indices;
        }
    });

    // given a value, returns an Array of indices which match said value, no matter how nested
    Object.defineProperty(_self, "findIndexAllDeep", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: (value) => {
            const indices = [];
            // path will be an Array with the current level therein
            this.some(function walk(path) {
                // will keep 'matching' indices until it hits the actual value; creates multi-dimensional Array
                return function (item, i) {
                    // while item is a match, continue pushing corresponding indices into Array `indices`
                    if (item === value) {
                        indices.push(path.concat(i));  
                    };
                    // else, ensure `item` is an Array (indicating another level to walk)
                    // recurse and call `walk`; `some` implicitly passes `this` aka `item` as the first argument
                    return Array.isArray(item) && item.some(walk(path.concat(i)));
                };
            }([])); /* we initialize as an IIFE and pass an empty Array as our default param*/
            // return multi-dimensional Array mapping of matched indices
            return indices;
        }
    });
    // Note: we could later add something like `JSON.stringify(_array[i]).indexOf(value) > -1` to eval whether or not 
    // the value exists and we should continue recursing the tree

    // define props for event-binding
    defineAddEventListener(_self, _handlers);
    defineRemoveEventListener(_self, _handlers);
    
    // override `push` method
    Object.defineProperty(_self, "push", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: (...args) => {
            let index;
            // for each provided element, push into copy `_array`
            args.forEach(item => {
                // persist index at which item will be added
                index = _array.length;
                _array.push(item);
                // define index accessor for each element
                defineIndexProperty(index);
                raiseEvent({
                    type: "itemadded",
                    index,
                    item,
                }, _self, _handlers);
            });
        return _array.length;
        }
    });

    // override `pop` method
    Object.defineProperty(_self, "pop", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: () => {
            if (_array.length > 0) {
                const index = _array.length - 1,
                    item = _array.pop();
                delete _self[index];
                raiseEvent({
                    type: "itemremoved",
                    index,
                    item
                }, _self, _handlers);
                return item;
            }
        }
    });

    // override unshift method
    Object.defineProperty(_self, "unshift", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: (...args) => {
            // NOTE this is one of those rare instances where we *need* `var`, lest the next loop's `i` be undefined due to
            // scoping behaviors of `let`
            args.forEach((item, index) => {
                // add arg to beginning of core val
                _array.splice(index, 0, item);
                defineIndexProperty(_array.length - 1);
                raiseEvent({
                    type: "itemadded",
                    index,
                    item,
                }, _self, _handlers);
            });

            _array.forEach((item, index) => {
                if (index >= args.length) {
                    raiseEvent({
                        type: "itemset",
                        index,
                        item,
                    }, _self, _handlers);
                }
            });
            
            return _array.length;
        }
    });

    // override shift method
    Object.defineProperty(_self, "shift", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: () => {
            // only actionable if Array contains elements
            if (_array.length > 0) {
                const item = _array.shift();
                // NOTE imperative; `shift` will not persist this change;
                // we simulate this behavior by deleting value at index `_array.length`
                delete _self[_array.length];
                raiseEvent({
                    type: "itemremoved",
                    index: 0,
                    item
                }, _self, _handlers);
                return item;
            }
        }
    });

    // override splice method
    Object.defineProperty(_self, "splice", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: (...args) => {
            // removed items store
            const removed = [];
            let [index, numToRemove, ...itemsToAdd] = args,
                // explicitly hoist to outer context
                item;

            // calculate index qua splice parameters
            // we need `==` so as to coerce possible `undefined` to null during eval
            // this is also where we simulate `splice's` capacity to accept negative indices and walk recessively from core val length
            index = index == null ? 0 : index < 0 ? _array.length + index : index;

            // calculate number of elements qua splice parameters
            numToRemove = numToRemove == null ? _array.length - index : numToRemove > 0 ? numToRemove : 0;

            while (numToRemove--) {
                // we specify the 0th index to coerce to val as opposed to an array with val therein
                item = _array.splice(index, 1)[0];
                removed.push(item);
                // reflect changes in constructor arr
                delete _self[_array.length];
                raiseEvent({
                    type: "itemremoved",
                    // index begins at first removal; increment by ea. removed item
                    index: index + removed.length - 1,
                    item
                }, _self, _handlers);
            }
            itemsToAdd.forEach(item => {
                // no need to update _self as `splice` interceptor will do this for us
                _array.splice(index, 0, item);
                
                defineIndexProperty(_array.length - 1);
                raiseEvent({
                    type: "itemadded",
                    index,
                    item,
                }, _self, _handlers);
                // explicitly increment index on ea. iteration
                index++;
            });
            return removed;
        }
    });

    // override `length` method
    Object.defineProperty(_self, "length", {
        configurable: false,
        enumerable: false,
        get: () => _array.length,
        set: (value) => {
            // coerce input to Number
            const symbolicLength = Number(value);
            // est core val length
            const length = _array.length;
            // user-specified length must be whole number
            if (symbolicLength % 1 === 0 && symbolicLength >= 0) {
                // if len provided less than that of current arr value, we truncate the core val w/`splice`
                if (symbolicLength < length) {
                    _self.splice(symbolicLength);
                } 
                // user is extending core val; push new generated Array of specified len sans core len
                else if (symbolicLength > length) {
                    Reflect.apply(_self.push, _self, new Array(symbolicLength - length));
                }
            } 
            // catch edge cases
            else {
                throw new RangeError("Error: Invalid array length.");
            }
            // finally, we extend actual core
            _array.length = symbolicLength;
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
        // coerces _self to a container Array into which we copy `items`
        Reflect.apply(_self.push, _self, items);
    }

}

module.exports = ObservableArray;