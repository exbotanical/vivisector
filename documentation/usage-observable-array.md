## Basic Usage for `Observable` of Type `Array`

First, let's import the Vivisector library:
```
const Vivisector = require("vivisector");
```

Let's create a new Array with two items. We'll also add some event listeners to the Array so we are notified any time the Array has been mutated. Recall that listener methods are optionally chainable:
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
console.log(users.identifier);
// 0
```
Okay, the id is `0`.

Let's create a second `Observable` of type 'Array', initialized with two elements: "Carol", "Carlos". This time, we will manually assign an id of `1`. This id will suffice because we know we've only created one other `Observable`; its id is `0`.

```
let usersTwo = Observable("Array", ["Carol","Carlos"], { id: 1 });
```
Great. Let's ensure the id prop is set as expected:
```
console.log(usersTwo.identifier);
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

Now, the fun begins. Let's modify the `ObservableArray` assigned to `users`:

```
users.push("Charlie");
// "Added Charlie at index 2."
```
Nice! What happens when we remove the item we just added? 
```
users.pop();
// "Removed Charlie at index 2."
```
What about the listeners on `usersTwo`?
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

Excellent. Let's register one more type of event that we've yet to use:
```
y.addEventListener("itemset", function(syntheticEvent) {
    console.log(`Item at index ${syntheticEvent.index} set to ${syntheticEvent.item} `);
});
```
And let's change the value at the 0th index of `y`:
```
y[0] = 9;
// "Item at index 0 set to 9"
```

Now, this will throw an Error because we've already assigned id `1` to an `Observable`:
```
let usersThree = Observable("Array", ["user one","user two"], { id: 1 });
// "Error: Identifier 1 is currently in use."
```

All `Observables` share non-enumerable properties `value`, `type`, and `identifier`. Should you need to, you can change the actual value of an `ObservableArray` by setting the `value` prop:

```
y.value = ["new", "array", "items"];
```

There is also an event correlated with this action: `mutated`. Let's add an event listener that will fire any time we mutate the `ObservableArray` by setting its value:

```
y.addEventListener("mutated", function(syntheticEvent) {
    // every time the array is fundamentally mutated e.g. reassigned, fire this event
    console.log(`Mutated Array to [${ syntheticEvent.item.map(item => ` ${item} `) }] at index ${syntheticEvent.index}.`);
});
```

Now that we've registered a handler, the preceding reassignment statement would log this to the console:
```
// Mutated Array to [ new , array , items ] at index all.
```

## Advanced Usage for `Observable` of Type `Array`

We can also create an `ObservableArray` of `ObservableString`s. First we need an `ObservableString`:

```
let observableStr = Vx("String", "hello").addEventListener("mutated", function(syntheticEvent) {
    console.log(`Value '${syntheticEvent.value}' has been updated to '${syntheticEvent.mutant}'`);
});
```

Let's trigger that event listener for demonstration purposes:

```
observableStr.value = "hola";
// Value 'hello' has been updated to 'hola'
```

Good. Let's create a new `ObservableArray` with a single element, `observableStr`:

```
let observableArr = Vx("Array", [observableStr]);

observableArr[0].value = ("hallo");

// Value 'hola' has been updated to 'hallo'
```

Interesting. This happened because we used the `value` accessor for the `ObservableString` nested *inside* of the `ObservableArray`. The value is indeed set:
```
console.log(observableArr[0].value);
// hallo
```

However, keep in mind that we added the `ObservableString` itself to the `ObservableArray`. Note how mutating copies of the value via the accessor will mutate the original `ObservableString` - this is a standard upheld by `Vivisector` to enforce a singular source-of-truth across `Observables`:

```
let copiedObservableStr = observableArr[0];

console.log(copiedObservableStr.value);
// hallo

console.log(observableArr[0].value);
// hallo

let copiedObservableStr = observableArr[0];

console.log(copiedObservableStr.value);
// hallo

copiedObservableStr.value = "" 
// Value 'hallo' has been updated to ''

console.log(observableStr.value);
// ''
```

If you are trying to copy the actual value of an `Observable` and not the `Observable` itself, you need to use the `value` property/accessor when doing so:

```
let newObservableStr = Vx("String", "hello").addEventListener("mutated", function(syntheticEvent) {
    console.log(`Value '${syntheticEvent.value}' has been updated to '${syntheticEvent.mutant}'`);
});

let observableArrDiscrete = Vx("Array", [newObservableStr.value]);

console.log(observableArrDiscrete[0]);
// hello
console.log(observableArrDiscrete[0].value);
// undefined - observableArrDiscrete[0] is a String primitive, not an `ObservableString` - it does not have access to `Observable` props e.g. `value`
```

