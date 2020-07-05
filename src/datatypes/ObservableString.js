const { defineAddEventListener, defineRemoveEventListener } = require("../utils/ubiquitous-props.js");

/**
 * @override 
 * @readonly
 * @summary Factory for instantiating observable String-like objects.
 * @description Copies given string input into new String object; proceeds to assign props for adding/removing
 *     event-listeners, adds custom `reassign` method and accessors, assimilates extended String prototype props. 
 *     Extended String prototype methods are conformed as computed properties that are called on the primitive String value
 *     contained by the `ObservableString`, and not the `ObservableString` itself.
 *     Registers as events `mutated`.
 * @augments String
 */
function ObservableString(value) {
    const _self = this,
        _handlers = {
            mutated: []
        };

    if (typeof value === "string") {
        /*
            The actual primitive value is stored in String Object.
            Unlike the `ObservableArray`, we don't need to copy the value to an internal, nested let given the limited scope of operations
            to be performed on a primitive i.e. the String versus an Object such as an Array
        */
        _self[0] = String(value);
    }
    
    // helper for event executions
    function raiseEvent(event) {
        _handlers[event.type].forEach((handler) => {
            handler.call(_self, event);
        });
    }

    function mutateCoreValue(coreObject, coreValue) {
        // persist pre-mutated value (note, not the String Object but the value therein)
        const value = coreObject[0].valueOf();
        coreObject[0] = String(coreValue);
        // get current mutated/new String value
        const mutant = coreObject[0].valueOf();
        // execute callback; 
        return { value, mutant };
    }

    // define accessor for actual primitive value
    Object.defineProperty(_self, "value", {
        configurable: false,
        enumerable: false,
        get: function() {
            // if `undefined`, we implicitly return `undefined` and mitigate the exception that would be thrown by calling `valueOf` thereon
            if (_self[0]) {
                return _self[0].valueOf();
            }
        },
        set: function(arg) {
            if (typeof arg === "string") {

                /* 
                    By using `Object.assign`, we can create, in-line, a new Object consisting of a key/value pair to denote our desired event type.
                    `assign` will 'merge' the in-line Object with that returned from `mutateCoreValue`. 
                    Given `raiseEvent` accepts as input an Object, we can pass this expression directly; it will resolve to the necessary values.
                */
                raiseEvent(Object.assign({ type: "mutated" }, mutateCoreValue(_self, arg)));

            }
        }
    });

     // schematic for custom method `reassign`
     Object.defineProperty(_self, "reassign", {
        configurable: false,
        enumerable: false,
        writable: false, 
        value: function(arg) {
            // type-check and validations go here
            if (!(typeof arg === "string")) {
                throw new Error("Invalid type");
            }
            
            /* 
                _self.value = stringInput; 
                
                Mutating the `value` prop here as demonstrated in the above-commented code *would* fire all `mutated` events given the
                execution context of prop `value` is recursively applicable. However, we'd like to maintain as great a degree and 
                granularity of control as possible. As such, we do *not* use the `value` accessor here, instead opting to raise
                the `mutated` event in a discrete context.
            */
           raiseEvent(Object.assign({ type: "mutated" }, mutateCoreValue(_self, arg)));
          
            // return `_self` to allow method to be chainable; see other like-comments
            return _self;
        }
    });
    
    // define props for event-binding
    defineAddEventListener(_self, _handlers);
    defineRemoveEventListener(_self, _handlers);
    
    // override `split` method
    Object.defineProperty(_self, "split", {
        configurable: false,
        enumerable: false,
        writable: false, 
        value: function(delimiter) {
            // get current String value
            const currentStringVal = _self[0].valueOf();
            // split current with provided argument `delimiter`
            const splitArr = currentStringVal.split(delimiter);
            // non-mutating, no need to raise event; return
            return splitArr;
        }
    });

    // override length method
    Object.defineProperty(_self, "length", {
        configurable: false,
        enumerable: false,
        get: function() {
            return _self[0].length;
        },
        // use noop here lest babel 7 complain
        set: function() {
            // essentially the 'only' noop in JavaScript (save for an empty function expression)
            // note we do not use an empty arrow func for linting/consistency purposes
            Function.prototype();
        }
    });

    /*
        Extend `String` prototype as computed values

        Here, we extend onto `ObservableString` all String prototype methods not already extant 
        and, for each, conform get/set to the execution context of the primitive value contained therein.
    */
    Object.getOwnPropertyNames(String.prototype).forEach((name) => {
        // ensure prop isn't already allocated so as to avoid collisions 
        if (!(name in _self)) {
            Object.defineProperty(_self, name, {
                configurable: false,
                enumerable: false,
                writable: false,
                // Here, we intercept the getter/setter conformation of each method on `String`'s prototype
                // We do this so as to set the execution context to point to the primitive `String` and *not* its parent Object, 
                // in this case `ObservableString`
                value: function(...args) {
                    return _self[0][name](...args);
                }
            });
        }
    });

    

    // return _self
}

module.exports = ObservableString;

/* Usage */

// let a = new ObservableString("hello");

// a.addEventListener("mutated", function(syntheticEvent) {
//     console.log(`Value '${syntheticEvent.value}' has been updated to '${syntheticEvent.mutant}'`);
// });

// console.log(a);

// a.reassign("hi");

// console.log("len:", a.length);
// let b = a.split("");
// console.log(b);