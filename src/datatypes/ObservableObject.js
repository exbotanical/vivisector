
// const target =  { data: "hello, world", type: "String" };

// const mockHandler = () => console.log("Fired!");


// const transmogrifyObject = (obj, fn) => {
//     const handler = {
//         get(target, property, receiver) {
//             fn();
//             // recurse and continue chain of Proxies for nested props
//             const value = Reflect.get(target, property, receiver);
            
//             if (typeof value === "object") {
//                 return new Proxy(value, handler);
//             }
//             return value;
//             // return Reflect[trapName](...arguments);
//         },
//         set(target, property, value) {
//             fn();
//             console.log("T" , target)
//             Object.entries({ target, property, value }).forEach(([key, value]) => console.log("SET FIRED", `${key}:  ${JSON.stringify(value)}`));
//             return Reflect.set(target, property, value);
//         },
//         deleteProperty(target, property) {
//             fn();
//             return Reflect.deleteProperty(target, property);
//         }
//     };
//     return new Proxy(obj, handler);
// };

// const obj = transmogrifyObject(target, mockHandler);

// obj.data = 1

// // obj.data = { hello:"hello" }
// // console.log(obj.data);




