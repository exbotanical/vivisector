const Vivisector = require("./lib/index.js");




// let users = Observable("Array", ["Alice","Bob"])
//     .addEventListener("itemadded", 
//         function(syntheticEvent) {
//             // every time an item is added to the array, fire this event
//             console.log(`Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
//         })
//     .addEventListener("itemremoved", 
//         function(syntheticEvent) {
//             // every time an item is removed from the array, fire this event
//             console.log(`Removed ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
//         })
//     .addEventListener("mutated", function(syntheticEvent) {
//         // every time the array is fundamentally mutated e.g. reassigned, fire this event
//         console.log(`Mutated Array to [${ syntheticEvent.item.map(item => ` ${item} `) }] at index ${syntheticEvent.index}.`);
//     })
//     .addEventListener("itemset", function(syntheticEvent) {
//         console.log(`Item at index ${syntheticEvent.index} set to ${syntheticEvent.item} `);
//     });

// console.log(users.value);
// users.value = ["hi"]
// console.log(users.value);
// console.log(users.length = 3);
// console.log(users.value);

// users[1] = "me"
// console.log(users.value);

const met = function(syntheticEvent) {
    console.log(`Value '${syntheticEvent.value}' has been updated to '${syntheticEvent.mutant}'`);
}

let str = Vx("String", "hello").addEventListener("mutated", met);

console.log(str.value);
// hello
console.log(str.identifier);
// 0
console.log(str.type);
// String

str.value = "hallo";
// Value 'hello' has been updated to 'hallo'

const processUpdates = (incomingObject)  => {
    console.log(`Value '${incomingObject.value}' has been updated to '${incomingObject.mutant}!!!'`);
    // do stuff
};

str.reassign("yeoboseyo").addEventListener("mutated", processUpdates);

str.reassign("hola");

console.log(str.value);


console.log(str.value);


console.log(str.value === "hola");
// true
console.log(str.split(""));
// [ 'h', 'o', 'l', 'a' ]

console.log(str.toUpperCase());
// HOLA

console.log(str.includes("h"));
// true

console.log(str.concat(" means", " hello"));
// hola means hello

str.value = str.concat(" means", " hello in Espanol");
// Value 'hola' has been updated to 'hola means hello in Espanol'
// Value 'hola' has been updated to 'hola means hello in Espanol!!!'

console.log(str.includes("hola", 0));
// true


