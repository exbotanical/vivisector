const ObservableArray = require("./ObservableArray");

/**
 * @summary A wrapper for exporting the Vivisector.js Observable model and its associated properties.
 * @description Exposes various JavaScript datatypes and primitives and extends them with both event-driven 
 *     properties (qua the Observable's execution context), and ubiquitous Vivisector-contingent properties (qua the macro execution context)
 */

module.exports = (function (global) {
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
            // this assignment will point to the execution context of the newly generated `ObservableArray`
            var intermediateObject = new ObservableArray(data);
            // set defaults
            if (options) {
                // destructure id and enforce unique filter 
                const { uniqueIdentifier } = (({ id }) => ({ uniqueIdentifier: Object.keys(_observables).includes(id.toString()) ? undefined : id, /* prop2, prop3... */ }))(options);
                // if id is found in keys array of `_observables`, the instantiation should be terminated
                if (!uniqueIdentifier) {
                    console.log(`Error: Identifier ${options.id} is currently in use.`);
                }
                // use `defineProperty` for greater control granularity; set prop to non-enumerable
                Object.defineProperty(intermediateObject, "identifier", {
                    configurable: false,
                    enumerable: false,
                    value: uniqueIdentifier
                });
                _observables[uniqueIdentifier] = intermediateObject;
            }
            // no options object param provided
            else {
                let { length } = Object.keys(_observables);
                Object.defineProperty(intermediateObject, "identifier", {
                    configurable: false,
                    enumerable: false,
                    value: length
                });
                _observables[length] = intermediateObject;
            }
            return intermediateObject
        }
    }
    // point prototype of each `Observable` instance to the aforementioned meta prototype to expose ubiquitous methods 
    ObservableArray.prototype = Observable.prototype;
    // point proto to same execution context so as to provide an optional caller alias, `Vx`
    global.Observable = global.Vx = Observable;

}(global));