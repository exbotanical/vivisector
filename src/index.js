const ObservableArray = require("./datatypes/ObservableArray.js");
const ObservableString = require("./datatypes/ObservableString.js");

/**
 * @summary A wrapper for exporting the Vivisector.js Observable model and its associated properties.
 * @description Exposes various JavaScript datatypes and primitives and extends them with both event-driven 
 *     properties (qua the Observable's execution context), and ubiquitous Vivisector-contingent properties (qua the macro execution context).
 */

// wrap in IIFE to align execution context in prospective 'non-Node' environments
// we do this in the case we want to expose on global explicitly
(function (global) {  
    // mitigate need to use `new` keyword by returning a discrete function constructor 
    // to generate the object   
    const Observable = function(datatype, data, options) {
        return new Observable.init(datatype, data, options);
    };

    /* Private/Unexposed Props */

    // global aggregation object - used to store and index all Observables
    const _observables = {};

    // meta-prototype for storing methods accessible to all `Observable` instances
    Observable.prototype = {
        // any methods added here will be exposed to *all* Observables 
        // we can actually import other modules or libs here; in doing so, we need to further tighten the security 
        // on global denominations so as to mitigate nasty dependency collisions

        // typecast: function(inboundType) {
        //     // do stuff
        //     // return new Observable.init(datatype, data, options);
        // }
    };

    // the actual method which is executed
    // this is mostly config for prospective macro-object use and ubiquitous methods
    Observable.init = function(datatype, data, options) {
        // this assignment will point to the execution context of the newly generated `Observable`
        // remaining vars are hoisted
        const _self = this,
            _observableKeys = Object.keys(_observables);
        // transient Object for assembling prototype and defaults injection
        let _intermediateObject;

        // selected type: Array
        if (datatype === "Array") {
            // this assignment will point to the execution context of the newly generated `ObservableArray`
            _intermediateObject = new ObservableArray(data);
        }

        // selected type: String
        else if (datatype === "String") {
            // this assignment will point to the execution context of the newly generated `ObservableArray`
            _intermediateObject = new ObservableString(data);
        }

        // unsupported / unprovided type
        else {
            return console.log(`Error: datatype ${datatype} is not available as an Observable.`);
        }

        /* set defaults here */

        // the type of a given Observable instance e.g. 'Array'
        const _type = datatype;
        // the unique identifier for a given Observable instance
        let _identifier;

        // if options passed, configure accordingly
        if (options) {
            
            /* 
                Destructure id and enforce unique filter
                
                What's happening here is we are evaluating a ternary expression wrapped inside of an IIFE. 
                This IIFE accepts as input the `options` object and destructures the id inline. We are explicitly
                mapping the prop `uniqueIdentifier` and destructuring it away from the resolved IIFE.
            */

            const { uniqueIdentifier } = (({ id }) => ({ uniqueIdentifier: _observableKeys.includes(id.toString()) ? undefined : id, /* prop2, prop3... */ }))(options);
            

            // if id is found in keys array of `_observables`, the instantiation should be terminated as the id is a duplicate
            if (!uniqueIdentifier) {
                return console.log(`Error: Identifier ${options.id} is currently in use.`);
            }

            _identifier = uniqueIdentifier;
        }
        // no options object param provided
        else {
            // destructure length from keys Array
            const { length } = _observableKeys;
            _identifier = length;
        }
        // we can do this later at any point within this scope; leave until we need to do something with the type
        // _type = datatype;

        // Here, we are creating a new Object of all ubiquitous props for which `defineProperty` will be called. Then,
        // we destructure the key/value pairs from the Array produced by `Object.entries` and call `forEach` thereon
        // ea. key will become the prop name; each value (that which is preceded by an underscore), the prop value
        Object.entries({ identifier: _identifier, type: _type }).forEach(([key, value]) => 
            // use `defineProperty` for greater control granularity; set prop to non-enumerable
            Object.defineProperty(_intermediateObject, key, {
                configurable: false,
                enumerable: false,
                value: value
            })
        );

        // persist new Observable inside `_observables` at index `_identifier`
        _observables[_identifier] = _intermediateObject;
        
        return _intermediateObject;
        
    };

    // point prototype of each `Observable` instance to the aforementioned meta prototype to expose ubiquitous methods 
    ObservableArray.prototype = Observable.prototype;
    ObservableString.prototype = Observable.prototype;

    // // point proto to same execution context so as to provide an optional caller alias, `Vx`
    // global.Observable = global.Vx = Observable;
    module.exports = Vx = Observable;

}());
/* 
    Passing `global` in lieu of `this`

    We pass the global object in lieu of `this` for a couple of very specific performance reasons:

    1. JavaScript always performs scope 'lookups' from the current function's scope *upward* until it finds an identifier; 
    if we pass `this` as `global` into an IIFE, the IIFE's execution is the only time our code will need to process a scope lookup beyond
    the local scope for `this`. Subsequent references to `global` inside the IIFE will therefore never require a lookup beyond the local scope of the IIFE.

    2. JS minifiers won't minify direct references to anything without the context of the IIFE; 
    we may need this param as a point-of-reference.

*/