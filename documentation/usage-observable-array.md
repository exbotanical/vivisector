## Basic Usage for `Observable` of Type `Array`

Let's learn how to `vivisect` arrays. First, let's import the Vivisector library:

```js
const { vivisect } = require("vivisector");
```

Let's create a new Array with two items. We'll also add some event listeners to the Array so we are notified any time the Array has been 'mutated'. Recall that listener methods are optionally chainable:

```js
let users = vivisect(["Alice","Bob"])
  .addEventListener("itemadded",
    function (syntheticEvent) {
      // every time an item is added to the array, fire this event
      console.log(`Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
    })
  .addEventListener("itemremoved",
    function (syntheticEvent) {
      // every time an item is removed from the array, fire this event
      console.log(`Removed ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
    });
```

Let's add an event listener to `usersTwo`:

```js
usersTwo.addEventListener("itemadded", function (syntheticEvent) {
  console.log(`Two: Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
});
```

And another:

```js
usersTwo.addEventListener("itemremoved", function (syntheticEvent) {
  console.log(`Two: Removed ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
});
```

Now, the fun begins. Let's modify the array assigned to `users`:

```js
users.push("Charlie");
// "Added Charlie at index 2."
```

Nice! What happens when we remove the item we just added?

```js
users.pop();
// "Removed Charlie at index 2."
```

What about the listeners on `usersTwo`?

```js
usersTwo.push(6)
// "Two: Added 6 at index 2."
```

Let's instantiate yet another array:

```js
let y = vivisect([]).addEventListener("itemadded", function (syntheticEvent) {
    console.log(`y: Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
});

y.push(8);
// "y: Added 8 at index 0."
```

Excellent. Let's register one more type of event that we've yet to use:

```js
y.addEventListener("itemset", function (syntheticEvent) {
  console.log(`Item at index ${syntheticEvent.index} set to ${syntheticEvent.item} `);
});
```

And let's change the value at the 0th index of `y`:

```js
y[0] = 9;
// "Item at index 0 set to 9"
```

All `Observables` share the non-enumerable property `value`. Should you need to, you can change the actual value of an array by setting the `value` prop:

```js
y.value = ["new", "array", "items"];
```

There is also an event correlated with this action: `mutated`. Let's add an event listener that will fire any time we mutate the array by setting its value:

```js
y.addEventListener("mutated", function (syntheticEvent) {
  // every time the array is fundamentally mutated e.g. reassigned, fire this event
  console.log(`Mutated Array to [${ syntheticEvent.item.map(item => ` ${item} `) }] at index ${syntheticEvent.index}.`);
});
```

Now that we've registered a handler, the preceding reassignment statement would log this to the console:

```js
// Mutated Array to [ new , array , items ] at index all.
```

## Advanced Usage for vivisected arrays

We can also create an array of vivisected strings. First we need an vivisected string:

```js
let observableStr = vivisect("hello").addEventListener("mutated", function (syntheticEvent) {
  console.log(`Value '${syntheticEvent.value}' has been updated to '${syntheticEvent.mutant}'`);
});
```

Let's trigger that event listener for demonstration purposes:

```js
observableStr.value = "hola";
// Value 'hello' has been updated to 'hola'
```

Good. Let's create a new array with a single element, `observableStr`:

```js
let observableArr = vivisect([observableStr]);

observableArr[0].value = ("hallo");

// Value 'hola' has been updated to 'hallo'
```

Interesting. This happened because we used the `value` accessor for the vivisected string nested *inside* of the array. The value is indeed set:

```js
console.log(observableArr[0].value);
// hallo
```

However, keep in mind that we added the vivisected string itself to the array. Note how mutating copies of the value via the accessor will mutate the original vivisected string - this is standard JavaScript behavior (see by reference versus by value) that is further upheld by `Vivisector` to enforce a singular source-of-truth across `Observables`:

```js
let copiedObservableStr = observableArr[0];

console.log(copiedObservableStr.value);
// hallo

console.log(observableArr[0].value);
// hallo

copiedObservableStr.value = ""
// Value 'hallo' has been updated to ''

console.log(observableStr.value);
// ''
```

If you are trying to copy the actual value of an `Observable` and not the `Observable` itself, you need to use the `value` property/accessor when doing so:

```js
let newObservableStr = vivisect("hello").addEventListener("mutated", function (syntheticEvent) {
    console.log(`Value '${syntheticEvent.value}' has been updated to '${syntheticEvent.mutant}'`);
});

let observableArrDiscrete = vivisect([newObservableStr.value]);

console.log(observableArrDiscrete[0]);
// hello
console.log(observableArrDiscrete[0].value);
// undefined - observableArrDiscrete[0] is a String primitive, not an vivisected string - it does not have access to `Observable` props e.g. `value`
```
