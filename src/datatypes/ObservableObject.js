const { defineAddEventListener, defineRemoveEventListener } = require("../utils/ubiquitous-props.js");

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
            if (value) {
                raiseEvent({
                    type: "itemget",
                    prop,
                    target,
                    value
                });
            }
        
            return value;
        },
        set(target, prop, value, recv) {
            raiseEvent({
                type: "itemset",
                prop,
                target,
                value
            });
            return Reflect.set(target, prop, value);
        },
        deleteProperty(target, prop) {
            const ephemeralTarget = JSON.stringify(target, null, 0);
            const value = Reflect.deleteProperty(target, prop);
            raiseEvent({
                type: "itemdeleted",
                prop,
                target: ephemeralTarget,
                value
            });

            return value;
        }
    };

    /* Root Object Conformations */
    
    // initialize root Proxy
    if (!(obj instanceof Object)) {
        return;
    }
    // using `Object.assign` here breaks the chain of reference to the provided argument `obj` 
    // if we pass `obj` directly, the Proxy will modifiy the original target
    const _self = new Proxy(Object.assign({}, obj), _rootHandler);

    // helper for event executions
    const raiseEvent = (event) => {
        _handlers[event.type].forEach((handler) => {
            handler.call(_self, event);
        });
    };
    defineAddEventListener(_self, _handlers);
    defineRemoveEventListener(_self, _handlers);
    return _self;

};


module.exports = ObservableObject;

// const mockEventHandler = (eventData) => {
//     const { type, prop, target, value }  = eventData;
//         console.log("EVENT", { type, prop, target, value });
// }
// const mockTarget = { items: ["foo", "bar"], data: { meta: 1 } };

// const obj = ObservableObject(mockTarget).addEventListener("itemdeleted", mockEventHandler);
// delete obj.items
// delete obj.data.meta.fourteen;
// console.log(obj);

// obj.data.meta[1]= "john";
// console.log(obj);
// let a = obj.data
// a.data = "mopo"
// obj.data.meta[0] = function (...args) {
//     [...args].forEach(arg => console.log(arg));
// }

// obj.data.meta[0]("HELLO", "WORLD");

// Object.keys(obj).forEach(i => console.log(i));
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






