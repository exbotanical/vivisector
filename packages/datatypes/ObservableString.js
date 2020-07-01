/**
 * @override 
 * @readonly
 * @summary Factory for instantiating observable String-like objects.
 * @description Copies given string input into new String object; proceeds to assign props for adding/removing
 *     event-listeners, adds custom `reassign` method, assimilates extended String prototype props. Registers as 
 *     events `mutated`, .
 * @augments String
 */
function ObservableString(item) {
    var _self = this,
        _handlers = {
            mutated: []
        };

    if (typeof item === "string") {
        _self[0] = new String(item);
    }
    
    // helper for event executions
    function raiseEvent(event) {
        _handlers[event.type].forEach(function(handler) {
            handler.call(_self, event);
        });
    }

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
            return _self
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
            var handlerSet = _handlers[eventName];
            var handlerSetLen = handlerSet.length;
            // ensure handler exists, lookup, remove
            while (--handlerSetLen >= 0) {
                if (handlerSet[handlerSetLen] === handler) {
                    // handler exists, remove 
                    handlerSet.splice(handlerSetLen, 1);
                }
            }
            // return `this` to allow method chaining across consistent parent Object / execution context
            return _self
        }
    });

    // override `split` method
    Object.defineProperty(_self, "split", {
        configurable: false,
        enumerable: false,
        writable: false, 
        value: function(delimiter) {
            var currentStringVal = _self[0].valueOf();
            var splitArr = currentStringVal.split(delimiter);
            // raiseEvent({
            //     type: "mutated",
            //     value: currentStringVal,
            //     mutant: splitArr
            // });
            console.log("split", splitArr)
            return splitArr
        }
    });

    // override `split` method
    Object.defineProperty(_self, "length", {
        configurable: false,
        enumerable: false,
        get: function() {
            return _self[0].length;
        }
    });


    // schematic for custom method `reassign`
    Object.defineProperty(_self, "reassign", {
        configurable: false,
        enumerable: false,
        writable: false, // false; we do not want further tampering here
        value: function(stringInput) {
            // type-check and validations go here
            if (!(typeof stringInput === "string")) {
                throw new Error("Invalid type.");
            }
            // persist pre-mutated value (note, not the String Object but the value therein)
            var oldVal = _self[0].valueOf();
            // reassign to new String instance
            _self[0] = new String(stringInput);
            // raise event to signal mutation
            raiseEvent({
                type: "mutated",
                value: oldVal,
                mutant: stringInput
            });
            // return for chainable; see other like-comments
            return _self
        }
    });

    // extend onto `ObservableString` all String prototype methods not already extant
    Object.getOwnPropertyNames(String.prototype).forEach(function(name) {
        // ensure prop isn't already allocated so as to avoid collisions 
        if (!(name in _self)) {
            Object.defineProperty(_self, name, {
                configurable: false,
                enumerable: false,
                writable: false,
                value: String.prototype[name]
            });
        }
    });

    return _self
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

/* Notes */

// let a = new Proxy(new String("hello"), {
//     get(target, key) {
//       if (!target.hasOwnProperty(key) && typeof target[key] === "function") {
//         return function(...args) {
//           return target[key].call(target, args);
//         }
//       }
//       return target[key];
//     },
//     set(...args) {
//         console.log("fired", ...args)
//     }
//   });
  
//   console.log(a.valueOf());



// (function (){
//     var counterValue = 0;
//     define("count", {get: function(){ return counterValue++ }});
// }());
