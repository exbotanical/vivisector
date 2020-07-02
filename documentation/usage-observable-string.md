## Basic Usage for `Observable` of Type `String`

Let's see how we can use an `ObservableString`. First, let's import the Vivisector library:

```
const Vivisector = require("vivisector");
```

Using the shorthand syntax `Vx`, let's instantiate a new `Observable` of type `String` with an event handler bound to its sole event, `mutated`. As usual, we don't need to use the `new` keyword, as `vivisector` takes care of that for you:

```
let str = Vx("String", "hello").addEventListener("mutated", function(syntheticEvent) {
    console.log(`Value '${syntheticEvent.value}' has been updated to '${syntheticEvent.mutant}'`);
});
```

We have all the base `Observable` accessor properties available to us:

```
console.log(str.value);
// hello
console.log(str.identifier);
// 0
console.log(str.type);
// String
```

We can reassign the value of an `ObservableString` using the `value` accessor. In our case, this will raise the `mutated` event, causing our handler to be called:

```
str.value = "hallo";
// Value 'hello' has been updated to 'hallo'
```

## Advanced Usage for `Observable` of Type `String`
Let us continue where we left off in the last section and review some of the more involved features of an `ObservableString`...

With `ObservableString`s comes *another* way to reassign/mutate the primitive value: `reassign`. *This method is only available for Observables of type `String`.* The `reassign` method does precisely the same thing as assignment by way of the `value` accessor prop, however `reassign` is *chainable*.

Let's first define a callback for the new event listener we will chain to our newly reassigned ObservableString:

```
const processUpdates = (incomingObject)  => {
    console.log(`Value '${incomingObject.value}' has been updated to '${incomingObject.mutant}!!!'`);
    // do stuff
};

```
Among the many benefits of using a named callback as opposed to an anonymous function - as used in the previous example - is that we can *name* this handler when calling `removeEventListener`. 

And now, we will reassign the `ObservableString`'s value and register our callback in the same line. Note our previous event handler *will* fire when we call `reassign`:

```
str.reassign("yeoboseyo").addEventListener("mutated", processUpdates);
// Value 'hallo' has been updated to 'yeoboseyo'
```

Now, we've two handlers for `mutated` events. Let's call `reassign` again to test them:

```
str.reassign("hola");
// Value 'yeoboseyo' has been updated to 'hola'
// Value 'yeoboseyo' has been updated to 'hola!!!'
```

Now, let's explore some of the other props available to us:

```
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
```

Note something interesting: `ObservableString`s are Objects, not actual primitives...and yet, we are able to call `String` methods on them directly. 
This is a pretty crucial design feature that you should keep in mind when using `Vivisector` - `Observables`, just like most things in JavaScript - are just Objects. 

However, `Observables` inherit as computed properties all methods from their corresponding type's prototype. `Vivisector` - hence the name - 'cuts' into
these props and proxies all get/set accessors such that they point to the actual value stored in the `Observable`. 

In other words, when you call `.concat` on an `ObservableString`, the context of `this` is nested to point at the `value`, and not the parent container. This is how we are capable of doing such things with `Observables`.

And, of course, we can call these methods during assignment and our event listeners will fire:

```
str.value = str.concat(" means", " hello in Espanol");
// Value 'hola' has been updated to 'hola means hello in Espanol'
// Value 'hola' has been updated to 'hola means hello in Espanol!!!'
```









