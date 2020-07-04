// Soon enough...
// I'll probably just use Proxies with a wrapper here; no sense in NOT doing that since Proxies were *designed* for this

// let target = document.documentElement;
// let targetProxy = new Proxy(target,{
//   get:(obj,key)=>{
//     let value = Reflect.get(obj,key);
//     if(typeof(value) == "function"){
//       return value.bind(obj);
//     }
//     return value;
//   }
// });

// targetProxy.addEventListener('click',()=>console.log('clicked'));

// /* Notes */

// // let a = new Proxy(new String("hello"), {
// //     get(target, key) {
// //       if (!target.hasOwnProperty(key) && typeof target[key] === "function") {
// //         return function(...args) {
// //           return target[key].call(target, args);
// //         }
// //       }
// //       return target[key];
// //     },
// //     set(...args) {
// //         console.log("fired", ...args)
// //     }
// //   });
  
// //   console.log(a.valueOf());



// // (function (){
// //     var counterValue = 0;
// //     define("count", {get: function(){ return counterValue++ }});
// // }());
