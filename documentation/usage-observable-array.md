
```
const Vivisector = require("./packages/datatypes/index.js");


// methods are optionally chainable 

let users = Observable("Array", ["Alice","Bob"]).addEventListener("itemadded", function(syntheticEvent) {
    // every time an item is added to the array, fire this event
    console.log(`Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
}).addEventListener("itemremoved", function(syntheticEvent) {
    // every time an item is removed from the array, fire this event
    console.log(`Removed ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
});

// new Observable of type 'Array', initialized with two elements: "Carol", "Carlos", assigned an id of 1
let usersTwo = Observable("Array", ["Carol","Carlos"], { id: 1 });

// add event listener to `usersTwo`
usersTwo.addEventListener("itemadded", function(syntheticEvent) {
    console.log(`Two: Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
});

// add another event listener to `usersTwo`
usersTwo.addEventListener("itemremoved", function(syntheticEvent) {
    console.log(`Two: Removed ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
});

users.push("Charlie");
// "Added Charlie at index 2."
users.pop();
// "Removed Charlie at index 2."

usersTwo.push(6)
// "Two: Added 6 at index 2."

// We can also use the shortened `Vx` alias in lieu of `Observable`
let y = Vx("Array").addEventListener("itemadded", function(syntheticEvent) {
    console.log(`y: Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
});

y.push(8);
// "y: Added 8 at index 0."

usersTwo.getId()
// 1
users.getId()
// 0 

// this will throw an Error because we've already assigned id 1 to an Observable 
let usersThree = Observable("Array", ["user one","user two"], { id: 1 });
// "Error: Identifier 1 is currently in use."

```