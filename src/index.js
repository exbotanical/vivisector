/* eslint-disable no-unused-vars */
import ObservableArray from './core/Array.observable';
import ObservableString from './core/String.observable';
import ObservableObject from './core/Object.observable';


// this codebase is commented liberally for development purposes; see the official build for transpiled lib

/**
 * @summary A factory / wrapper for exporting the Vivisector.js `Observables` and their associated properties.
 * @description Exposes various JavaScript datatypes and primitives and extends them with both event-driven 
 *     properties (qua the `Observable`'s execution context), and ubiquitous Vivisector-contingent properties (qua the macro execution context).
 */

// wrap in IIFE to align execution context in prospective 'non-Node' environments
// we do this in the case we want to expose on global explicitly
export default (function (global) {  
    // mitigate need to use `new` keyword by returning a discrete function constructor 
    // to generate the object   
    const Vx = function (datatype, data, options) {
        return new Vx.init(datatype, data, options);
    };

    /* Private/Unexposed Props */

    // global aggregation object - used to store and index all `Observables`
    const _observables = {};

    /* Method Injection Library */

    // meta-prototype for storing methods accessible to all `Observable` instances
    // place methods which you wish to expose on Vx instances here and uncomment reassignments below (`global` wrapper util)
    Vx.prototype = {
        // any methods added here will be exposed to *all* `Observables`
        // we can actually import other modules or libs here; in doing so, we need to further tighten the security 
        // on global denominations so as to mitigate nasty dependency collisions (assuming we are using `global` - currently, no)

        // typecast: function(inboundType) {
            // do stuff
            // return new Vx.init(datatype, data, options);
        // }
    };

    /* Datatype Factory */

    // the actual method which is executed
    // this is mostly config for prospective macro-object use and ubiquitous methods
    Vx.init = function (datatype, data, options) {
        // this assignment will point to the execution context of the newly generated `Observable`
        // remaining vars are hoisted
        const _self = this,
            _observableKeys = Object.keys(_observables);
        // transient Object for assembling prototype and defaults injection
        let _intermediateObject;

        if (datatype === 'Array') {
            _intermediateObject = new ObservableArray(data);
        }
        else if (datatype === 'String') {
            _intermediateObject = new ObservableString(data);
        }
        else if (datatype === 'Object') {
            _intermediateObject = new ObservableObject(data);
        }
        // unsupported / unprovided type
        else {
            throw new Error(`Error: datatype ${datatype} is not a supported option.`);
        }

        /* set defaults here */

        // the type of a given `Observable` instance e.g. 'Array'
        const _type = datatype;
        // the unique identifier for a given `Observable` instance
        let _identifier;

        // if options passed, configure accordingly
        if (options) {
            
            /* 
                Destructure id and enforce unique filter
                
                Here, we are evaluating a ternary expression wrapped inside of an IIFE. 
                This IIFE accepts as input the `options` object and destructures the id inline. We are explicitly
                mapping the prop `uniqueIdentifier` and destructuring it away from the resolved IIFE.
            */

            const { uniqueIdentifier } = (({ id }) => ({ uniqueIdentifier: _observableKeys.includes(id.toString()) ? undefined : id /* prop2, prop3... */ }))(options);
            
            // if id is found in keys array of `_observables`, the instantiation should be terminated as the id is a duplicate
            if (!uniqueIdentifier) {
                throw new Error(`Error: Identifier ${options.id} is currently in use.`);
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

        // Create a new Object of all ubiquitous props for which `defineProperty` will be called. Then,
        // destructure the key/value pairs from the Array produced by `Object.entries` and call `forEach` thereon
        // Ea. key will be collated as a computed property with its accompanying value
        Object.entries({ identifier: _identifier, type: _type }).forEach(([key, value]) => 
            // use `defineProperty` for greater control granularity; set prop to non-enumerable
            Object.defineProperty(_intermediateObject, key, {
                configurable: false,
                enumerable: false,
                value: value
            })
        );

        // persist new `Observable` inside `_observables` at index `_identifier`
        _observables[_identifier] = _intermediateObject;
        
        return _intermediateObject;
        
    };

    /* 
        ~ For use with currently inactive `global` execution context wrapper ~

        point prototype of each `Observable` instance to the aforementioned meta prototype to expose ubiquitous methods 

        ObservableArray.prototype = Vx.prototype;
        ObservableString.prototype = Vx.prototype;
        ObservableObject.prototype = Vx.prototype;
    
        point proto to same execution context so as to provide an optional caller alias, `Vx`
        global.Observable = global.Vx = Observable;
    */

    return Vx;
}());

/* 
    Passing `global` in lieu of `this`. 
    
    Currently inactive, but applicable if we ever decide to go back to the `global` diad context approach.

    We pass the global object in lieu of `this` for a couple of very specific performance reasons:

    1. JavaScript always performs scope 'lookups' from the current function's scope *upward* until it finds an identifier; 
    if we pass `this` as `global` into an IIFE, the IIFE's execution is the only time our code will need to process a scope lookup beyond
    the local scope for `this`. Subsequent references to `global` inside the IIFE will therefore never require a lookup beyond the local scope of the IIFE.

    2. JS minifiers won't minify direct references to anything without the context of the IIFE; 
    we may need this param as a point-of-reference.

*/
