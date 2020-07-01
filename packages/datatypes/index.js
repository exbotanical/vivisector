const ObservableArray = require("./ObservableArray");

/**
 * @summary A wrapper for exporting the Vivisector.js Observable model and its associated properties.
 * @description Exposes various JavaScript datatypes and primitives and extends them with both event-driven 
 *     properties (qua the Observable's execution context), and ubiquitous Vivisector-contingent properties (qua the macro execution context)
 */

module.exports = (function (global) {  // wrap in IIFE to align execution context in prospective 'non-Node' environments
    // mitigate need to use `new` keyword by returning a discrete function constructor 
    // to generate the object   
    var Observable = function(datatype, data, options) {
        return new Observable.init(datatype, data, options);
    }

    /* Private/Unexposed Props */

    // global aggregation object - used to store and index all Observables
    var _observables = {};

    // meta-prototype for storing methods accessible to all `Observable` instances
    Observable.prototype = {
        getId: function() {
            console.log(this.identifier)
        }
    }

    // the actual method which is executed
    Observable.init = function(datatype, data, options) {
        // this assignment will point to the execution context of the newly generated `Observable`
        // set defaults here, if applicable
        var _self = this;
        if (datatype === "Array") {
            var _identifier;
            // this assignment will point to the execution context of the newly generated `ObservableArray`
            var intermediateObject = new ObservableArray(data);
            var observableKeys = Object.keys(_observables);
            // set defaults
            if (options) {
                
                /* 
                    Destructure id and enforce unique filter
                    
                    What's happening here is we are evaluating a ternary expression wrapped inside of an IIFE. 
                    This IIFE accepts as input the `options` object and destructures the id inline. We are explicitly
                    mapping the prop `uniqueIdentifier` and destructuring it away from the resolved IIFE.
                */

                const { uniqueIdentifier } = (({ id }) => ({ uniqueIdentifier: observableKeys.includes(id.toString()) ? undefined : id, /* prop2, prop3... */ }))(options);
                

                // if id is found in keys array of `_observables`, the instantiation should be terminated as the id is a duplicate
                if (!uniqueIdentifier) {
                    return console.log(`Error: Identifier ${options.id} is currently in use.`);
                }

                _identifier = uniqueIdentifier;
            }
            // no options object param provided
            else {
                // destructure length from keys Array
                let { length } = observableKeys;
                _identifier = length;
            }
            // use `defineProperty` for greater control granularity; set prop to non-enumerable
            Object.defineProperty(intermediateObject, "identifier", {
                configurable: false,
                enumerable: false,
                value: _identifier
            });
            // persist new Observable inside `_observables` at index `_identifier`
            _observables[_identifier] = intermediateObject;
            
            return intermediateObject;
        }
        else {
            return console.log(`Error: datatype ${datatype} is not available as an Observable.`)
        }
    }
    // point prototype of each `Observable` instance to the aforementioned meta prototype to expose ubiquitous methods 
    ObservableArray.prototype = Observable.prototype;
    // point proto to same execution context so as to provide an optional caller alias, `Vx`
    global.Observable = global.Vx = Observable;

}(global));
/* 
    Passing `global` in lieu of `this`

    We pass the global object in lieu of `this` for a couple of very specific performance reasons:

    1. JavaScript always performs scope 'lookups' from the current function's scope *upward* until it finds an identifier; 
    if we pass `this` as `global` into an IIFE, the IIFE's execution is the only time our code will need to process a scope lookup beyond
    the local scope for `this`. Subsequent references to `global` inside the IIFE will therefore never require a lookup beyond the local scope of the IIFE.

    2. JS minifiers won't minify direct references to anything without the context of the IIFE; 
    we may need this param as a point-of-reference.

*/