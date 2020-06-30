
First, let's import the Vivisector library:
```
const Vivisector = require("vivisector");
```

Let's create a new Array with two items. We'll also add some event listeners to the Array so we are notified any time the Array has been mutated. Recall that methods are optionally chainable:
```
let users = Observable("Array", ["Alice","Bob"])
    .addEventListener("itemadded", 
        function(syntheticEvent) {
            // every time an item is added to the array, fire this event
            console.log(`Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
        })
    .addEventListener("itemremoved", 
        function(syntheticEvent) {
            // every time an item is removed from the array, fire this event
            console.log(`Removed ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
        });
```

Because we did not pass an `options` object as the third parameter, the newly-created Array will automatically be assigned an id, which we can use for tracking *this specific* Array. Let's see what the id is:

```
users.getId();
// 0
```
Okay, the id is `0`.

Let's create a second Observable of type 'Array', initialized with two elements: "Carol", "Carlos". This time, we will manually assign an id of `1`. This id will suffice because we know we've only created one other Observable; its id is `0`.

```
let usersTwo = Observable("Array", ["Carol","Carlos"], { id: 1 });
```
Great. Let's ensure the id prop is set as expected:
```
usersTwo.getId()
// 1
```
Now, we'll add an event listener to `usersTwo`:
```
usersTwo.addEventListener("itemadded", function(syntheticEvent) {
    console.log(`Two: Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
});
```

And another:
```
usersTwo.addEventListener("itemremoved", function(syntheticEvent) {
    console.log(`Two: Removed ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
});
```

Now, the fun begins. Let's modify the `ObservableArray` 'users':

```
users.push("Charlie");
// "Added Charlie at index 2."
```
Nice! What happens when we remove the item we just added? 
```
users.pop();
// "Removed Charlie at index 2."
```
What about the listeners on "usersTwo"?
```
usersTwo.push(6)
// "Two: Added 6 at index 2."
```

We can also use the shortened `Vx` alias in lieu of `Observable`:
```
let y = Vx("Array").addEventListener("itemadded", function(syntheticEvent) {
    console.log(`y: Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
});

y.push(8);
// "y: Added 8 at index 0."
```
Excellent. 

Now, this will throw an Error because we've already assigned id 1 to an Observable:
```
let usersThree = Observable("Array", ["user one","user two"], { id: 1 });
// "Error: Identifier 1 is currently in use."
```
