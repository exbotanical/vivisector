const { defineAddEventListener, defineRemoveEventListener, raiseEvent } = require("../utils/ubiquitous-props.js");

// const setNIntervals = (fn, delay, rounds) => {
//     if (!rounds) {
//         return;
//     }
//     setTimeout(() => {
//         fn();
//         setNIntervals(fn, delay, rounds - 1);
//     }, delay);
// };

function ObservableObject(obj) {
    const _handlers = {
            itemget: [],
            itemdeleted: [],
            itemset: []
        },
        // non-enumerable prop store - mitigate get/set events from being called thereon
        _internals = [
            "addEventListener",
            "removeEventListener",
            "identifier",
            "type"
        ];

    const isPropConfigurable = (prop) => {
        if (_internals.includes(prop)) {
            throw new Error(`Error: Property '${prop}' is non-configurable.`);
        }
    };
   
    const _rootHandler = {
        get(target, prop, recv) {
            // type-check mechanism for testing
            if (prop === Symbol.for("_isProxy")) {
                return true;
            }
            // we use `Reflect` here as a simple mitigative effort to avoid violating Proxy invariants, as described in the specification here: 
            // https://www.ecma-international.org/ecma-262/8.0/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
            const value = Reflect.get(target, prop, recv);
            
            // recurse and continue chain of Proxies for nested props to ensure traps are executed upon access thereof
            if (typeof value === "object") {
                return new Proxy(value, _rootHandler);
            }
            // tradeoff here is `raiseEvent` won't be called for root getters; else, the cb would fire for each branch
            // TODO fix this by caching the Object with a WeakMap or something and walking the tree on ea. `get`...I think this would work
            if (value && !_internals.includes(prop)) {
                raiseEvent({
                    type: "itemget",
                    prop,
                    target,
                    value
                }, this, _handlers);
            }
        
            return value;
        },
        set(target, prop, value, recv) {
            isPropConfigurable(prop);
            raiseEvent({
                type: "itemset",
                prop,
                target,
                value
            }, this, _handlers);
            return Reflect.set(target, prop, value);
        },
        deleteProperty(target, prop) {
            isPropConfigurable(prop);
            const ephemeralTarget = JSON.stringify(target, null, 0);
            const value = Reflect.deleteProperty(target, prop);
            raiseEvent({
                type: "itemdeleted",
                prop,
                target: ephemeralTarget,
                value
            }, this, _handlers);
            return value;
        }
    };

    /* Root Object Conformations */
    
    // initialize root Proxy
    if (!(obj instanceof Object)) {
        return;
    }
    // make a deep clone here so as to break the chain of reference to the provided argument `obj` 
    // if we pass `obj` directly, the Proxy will modify the original target
    const _self = new Proxy(JSON.parse(JSON.stringify(obj)), _rootHandler);

    defineAddEventListener(_self, _handlers);
    defineRemoveEventListener(_self, _handlers);
    return _self;

};

module.exports = ObservableObject;

// const mockHandler = args => {
//     let [targetObject, targetProp, givenValue, receiverObject ] = args,
//         _operationType;

//     if (args.length === 2) {
//         _operationType = "DEL";

//     }
//     else if (args.length === 3) {
//         _operationType = "GET";
//     }
//     else if (args.length === 4) {
//         _operationType = "SET"
//     }
//     console.log(_operationType, givenValue, "on prop", targetProp, "of object", targetObject);
// }






