![Vivisector Logo](https://github.com/MatthewZito/vivisector-js/blob/master/documentation/vx.png)

# Vivisector.js | Create observable JavaScript datatypes
[![Coverage Status](https://coveralls.io/repos/github/MatthewZito/vivisector-js/badge.svg?branch=master)](https://coveralls.io/github/MatthewZito/vivisector-js?branch=master)
[![npm version](https://badge.fury.io/js/vivisector.svg)](https://badge.fury.io/js/vivisector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

 - [Introduction](#intro) 
    - [Features](#feat)
 - [Installation + Usage](#usage)
 - [Documentation](#docs)

## <a name="intro"></a> Introduction
*Vivisector.js* is a light-weight Nodejs library that exposes custom event-driven datatypes. *Vivisector's* *Observable* types broadcast unique events correlated to specific types of mutations and accessors. As such, one can bind methods to variables and render them event-bound. 

*Vivisector* is flexible, compact, and straightforward; it affords you fine-grained control by allowing you to decide when and what happens when a variable changes.

### <a name="feat"></a> Features
  - custom *Observable* datatypes for Array, Object/Array, and String data
  - instantly link/unlink actions to a variable's state
  - bind unlimited callbacks to specific types of state-mutation events *e.g. `itemadded`, `itemremoved`*
  - custom, chainable methods maintain stable execution context *i.e. method-chaining without the need to explicitly pipe `this`*
  - helper accessors on all *Observables* to simplify evaluation
  - no need to use `new` keyword, no configuration; `Vivisector` types work out-of-the-box
  - absolutely zero dependencies

## <a name="usage"></a> Installation and Usage
[Install via NPM](https://www.npmjs.com/package/vivisector) with `npm i vivisector`.

Import *Vivisector's* caller alias `Vx`:
```
const Vx = require("vivisector");
```

Create a new *Observable* - in this example, of type `Array` - and register a handler to fire when any *new elements* are added:
```
const logAdditions = ({item, index}) => console.log(`Added ${item} at index ${index}.`);
                    
const users = Vx("Array", ["Alice","Bob"]);

users.addEventListener("itemadded", logAdditions);
// every time an item is added to the array, fire `logAdditions`

users.push("Charlie");
// "Added Charlie at index 2."
```

Have a look at these usage guides for a full overview:

  - [See Usage Guide for `ObservableArray`](https://github.com/MatthewZito/vivisector-js/blob/master/documentation/usage-observable-array.md)
  - [See Usage Guide for `ObservableString`](https://github.com/MatthewZito/vivisector-js/blob/master/documentation/usage-observable-string.md)

Because Arrays *are* Objects, you certainly can instantiate an `ObservableObject` with Array data. However, you might find some of the Array-specific properties of the decoupled `ObservableArray` useful in certain instances.

## <a name="docs"></a> Documentation

### Vivisector Types

#### ObservableArray (*extends Array*)
*an Array-like Object*

**Unique Methods and Props**
   - **findIndexAll** Returns an Array of all indices that contain a match to given argument.

   ```
   const users = Vx("Array", ["hello", "world", "world", "hello", "world"]);
   console.log(users.findIndexAll("hello"));
   // [0, 3]
   ```

**Event Types**
  - **itemadded** A new item has been added to the Array. Callbacks will receive an Object consisting of 
    - **type** String "itemadded", denoting the event-type that was triggered
    - **item** the new item, now added to the Array, 
    - **index** the index at which the item was added

    **Fires on:** *push, unshift, splice*

  - **itemset** An item in the Array has moved. Callbacks will receive an Object consisting of 
    - **type** String "itemset", denoting the event-type that was triggered
    - **item** the item set in the Array
    - **index** the index to which the item was allocated

    **Fires on:** *unshift, using index accessors to set Array items*

    **Note:** Shuffling the Array or using methods like `unshift` will fire `itemset` for *each* index change

  - **itemremoved** An item has been removed from the Array. Callbacks will receive an Object consisting of 
    - **type** String "itemremoved", denoting the event-type that was triggered
    - **item** the item removed from the Array, 
    - **index** the index at which the item was removed

    **Fires on:** *pop, shift, splice*

  - **mutated** The Array value has been reassigned. Callbacks will receive an Object consisting of 
    - **type** String "mutated", denoting the event-type that was triggered
    - **item** the new Array value, 
    - **index** "all", String - all indices will have been affected

    **Fires on:** *Using the value accessor to mutate the Array value*

#### ObservableString (*extends String*)
*a mutable, String-like Object*

**Unique Methods and Props**
  - **reassign** Mutates String value, chainable (returns `this`).

  ```
  let str = Vx("String", "Hello, world");
  str.reassign("Hello, moon").addEventListener(...

  console.log(str);
  // Hello, moon
  ```

  - **length** Returns String value length; non-configurable. 

**Event Types**
  - **mutated** The String value has been reassigned. Callbacks will receive an Object consisting of 
    - **type** String "mutated", denoting the event-type that was triggered
    - **value** the previous String value, 
    - **mutant** the reassigned String value

#### ObservableObject (*extends Proxy*)
*an extended Object Proxy*

**Event Types**
  - **itemget** An Object property value has been accessed. Callbacks will receive an Object consisting of
    - **type** String "itemget", denoting the event-type that was triggered
    - **prop** The name or Symbol of the property being accessed
    - **target** The target object
    - **value** The specific value being accessed
  - **itemset** An Object property value has been set. Callbacks will receive an Object consisting of
    - **type** String "itemset", denoting the event-type that was triggered
    - **prop** The name or Symbol of the property being set
    - **target** The target object
    - **value** The new value that has been set on `prop`
  - **itemdeleted** An Object property value has been deleted. Callbacks will receive an Object consisting of
    - **type** String "itemdeleted", denoting the event-type that was triggered
    - **prop** The name or Symbol of the property being deleted
    - **target** The stringified target object
    - **value** A Boolean value indicating deletion success

### Vivisector Ubiquitous Methods and Props
  - **value** A non-enumerable accessor for getting and/or setting the core value of a given *Observable*

  ```
   const users = Vx("Array", ["Alice", "Bob"]);
   console.log(users.value);
   // ["Alice", "Bob"]
   users.value = ["Alexei", "Quinn"]
   console.log(users.value);
   // ["Alexei", "Quinn"]
   ```

   *Get/Set on types `String`, `Array`*
   *Get on types `Object`*
    
  - **identifier** A unique identifier assigned to all *Observables*. Namespace confined to the Nodejs runtime's `global`, or 'module context'. Currently a paused feature.
  - **type** The type identifier of a given *Observable*, *e.g. "Array", "Object", "String"*
  - **addEventListener** Bind a callback to fire whenever a given event-type has been triggered.

  ```
  const logMsg = function(event) {
            // every time an item is added to the array, fire this callback
            console.log(`Added ${event.item} at index ${event.index}.`);
        });
  let users = Vx("Array", ["Alice","Bob"]).addEventListener("itemadded", logMsg);

  users.push("Charlie");
  // "Added Charlie at index 2."
  ```

  - **removeEventListener** Remove an existing callback from the respective event-type to which it has been registered.

  ```
  const logMsg = function(event) {
            // every time an item is added to the array, fire this callback
            console.log(`Added ${event.item} at index ${event.index}.`);
        });
  let users = Vx("Array", ["Alice","Bob"]).addEventListener("itemadded", logMsg).removeEventListener("itemadded", logMsg);


  users.push("Charlie");
  // no log - handler was removed ^
  ```