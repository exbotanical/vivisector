<img src="https://github.com/MatthewZito/vivisector-js/blob/master/documentation/vx.png" width="390" height="390">

# Vivisector.js | Create observable JavaScript datatypes
[![Coverage Status](https://coveralls.io/repos/github/MatthewZito/vivisector-js/badge.svg?branch=master)](https://coveralls.io/github/MatthewZito/vivisector-js?branch=master)
```
Author: Matthew T Zito
License: MIT
```
## Table of Contents

 - [Introduction](#intro) 
    - [Features](#feat)
 - [Installation + Usage](#usage)
 - [Documentation](#docs)
    * [About](#about)
    * [Notes](#notes)


## *Listen to Arrays or Objects, even Strings for changes with Vivisector.js*

## <a name="intro"></a> Introduction
*Vivisector.js* is a light-weight Nodejs library that enables one to instantiate observable datatypes - that is, Arrays, Strings, et cetera that can have event listeners attached to them. 

Each *Vivisector* child object - any given `Observable` - extends its respective type's interface so as to expose custom event-driven methods. As such, one can attach event listeners to variables and render them event-bound.

### <a name="feat"></a> Features
  - custom `Observable` datatypes for Arrays, Objects, and String data
  - instantly bind actions to a variable's state
  - bind unlimited callbacks to specific types of state-mutation events *e.g. `itemadded`, `itemremoved`*
  - custom, chainable methods maintain stable execution context *i.e. method-chaining without the need to explicitly pipe `this`*
  - helper accessors on all `Observables` to ease evaluation
  - no need to use `new` keyword, no configuration; `Vivisector` types work out-of-the-box

## <a name="usage"></a> Installation and Usage

Import `Vivisector's` caller alias `Vx`:
```
const Vx = require("vivisector");
```

Create a new `Observable` - in this example, of type `Array` - and register a handler to fire when any *new elements* are added:
```
let users = Vx("Array", ["Alice","Bob"])
    .addEventListener("itemadded", 
        function(syntheticEvent) {
            // every time an item is added to the array, fire this event
            console.log(`Added ${syntheticEvent.item} at index ${syntheticEvent.index}.`);
        });

users.push("Charlie");
// "Added Charlie at index 2."
```

Have a look at these usage guides for a full overview:

  - [See Usage Guide for `ObservableArray`](https://github.com/MatthewZito/vivisector-js/blob/master/documentation/usage-observable-array.md)
  - [See Usage Guide for `ObservableString`](https://github.com/MatthewZito/vivisector-js/blob/master/documentation/usage-observable-string.md)

## <a name="docs"></a> Documentation

Full wiki coming soon...

### `Vivisector` Types
#### `ObservableArray` (*extends `Array`*)
*an Array-like Object*

**Unique Methods and Props**
   - `findIndexAll` Returns an Array of all indices that contain a match to given argument.

   ```
   const users = Vx("Array", ["hello", "world", "world", "hello", "world"]);
   console.log(users.findIndexAll("hello"));
   // [0, 3]
   ```

**Event Types**
  - `itemadded` A new item has been added to the Array. Callbacks will receive an `events` Object consisting of: 
    - `type` "itemadded", String, 
    - `item`, the new item, now added to the Array, 
    - `index` the index at which the item was added

    **Fires on:** *`push`, `unshift`, `splice`*

  - `itemset` An item in the Array has moved. Callbacks will receive an `events` Object consisting of: 
    - `type` "itemset", String, 
    - `item`, the item set in the Array
    - `index` the index to which the item was allocated

    **Fires on:** *`unshift`, using index accessors to set Array items*

    **Note:** Shuffling the Array or using methods like `unshift` will fire `itemset` for *each* index change

  - `itemremoved` An item has been removed from the Array. Callbacks will receive an `events` Object consisting of: 
    - `type` "itemremoved", String, 
    - `item`, the item removed from the Array, 
    - `index` the index at which the item was removed

    **Fires on:** *`pop`, `shift`, `splice`*

  - `mutated` The Array value has been reassigned. Callbacks will receive an `events` Object consisting of: 
    - `type` "mutated", String, 
    - `item`, the new Array value, 
    - `index` "all", String - all indices will have been affected

    **Fires on:** *Using the `value` accessor to mutate the Array value*

#### `ObservableString` (*extends `String`*)
*a mutable, String-like Object*

**Unique Methods and Props**
  - `reassign` Mutates String value, chainable (returns `this`).

  ```
  let str = Vx("String", "Hello, world");
  str.reassign("Hello, moon").addEventListener(...

  console.log(str);
  // Hello, moon
  ```

  - `length` Returns String value length; non-configurable. 

**Event Types**
  - `mutated` The String value has been reassigned. Callbacks will receive an `events` Object consisting of: 
    - `type` "mutated", String, 
    - `value`, the previous String value, 
    - `mutant` the reassigned String value

#### `ObservableObject` (*extends Proxy*)
*an extended Object Proxy*

**Event Types**
  - `itemget`
  - `itemset`
  - `itemdeleted`

### `Vivisector` Ubiquitous Methods and Props
  - `value` A non-enumerable accessor for getting/setting the core value of a given `Observable`

  ```
   const users = Vx("Array", ["Alice", "Bob"]);
   console.log(users.value);
   // ["Alice", "Bob"]
   users.value = ["Alexei", "Quinn"]
   console.log(users.value);
   // ["Alexei", "Quinn"]
   ```
    
  - `identifier` A unique identifier assigned to all `Observables`. Namespace confined to the Nodejs runtime's `global`, or 'module context'. Currently a paused feature.
  - `type` The type identifier of a given `Observable`, *e.g. "Array", "Object", "String"*
  - `addEventListener` Bind a callback to fire whenever a given event-type has been triggered.
  
  ```
  const logMsg = function(event) {
            // every time an item is added to the array, fire this event
            console.log(`Added ${event.item} at index ${event.index}.`);
        });
  let users = Vx("Array", ["Alice","Bob"]).addEventListener("itemadded", logMsg);

  users.push("Charlie");
  // "Added Charlie at index 2."
  ```

  - `removeEventListener` Remove an existing callback from the respective event-type to which it has been registered.

### <a name="about"></a> About

*How can we listen to changes in an Object or Array, or even a String?*

This is the question I set out to answer when I started writing `ObservableArrays`. I read about things like Rxjs or the *Observer pattern* but found in them paradigms far too complex for what I was trying to do: simply fire events when various values had changed. And so I continued with the creation of *Vivisector.js*, a very light-weight (and dependency-free) library for creating 'Observable' datatypes.

For example, we can instantiate a new `Observable` of type `Array` and we will have available to us an Array-like object which extends native Array methods and properties, but is also equipped with the capacity to become event-bound. That is, *Vivisector* gives you an Array onto which you can bind (and chain) events. 

### <a name="notes"></a> Notes 

#### Unengaged Features 

The following features have been built but not implemented:

A Centralized Store for Observables

The library itself is exposed as an API from which Observables can be instantiated on the fly; this centralizes a "store" of all active Observables for easy management and greater control granularity.

*How does this work?*

*Vivisector* recursively points child objects at its own prototype so as to expose an internal library of methods; this subset of methods is therefore ubiquitous to *all* Observables. The internal prototype also maintains a list of all Observables extant in a given code-base. This is a powerful feature that allows you to centralize a singular source-of-truth for managing your Observable Arrays, Strings, *et al*.

#### Imminent Todos

  - build out `transmogrify` method on base prototype for handling observable transfers
  - error handling
  - enumerate event-listeners method on all `Observables` (see: jQuery 1.1.0 source's `data` method)
