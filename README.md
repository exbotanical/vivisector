![Vivisector Logo](/documentation/vx.png)

# Vivisector.js | Create event-driven datatypes
[![Coverage Status](https://coveralls.io/repos/github/MatthewZito/vivisector-js/badge.svg?branch=master)](https://coveralls.io/github/MatthewZito/vivisector-js?branch=master)
[![npm version](https://badge.fury.io/js/vivisector.svg)](https://badge.fury.io/js/vivisector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Introduction](#intro)
  - [Features](#feat)
- [Installation + Usage](#usage)
- [Documentation](#docs)

## <a name="intro"></a> Introduction

*Vivisector* is a light-weight JavaScript library for reactive programming. *Vivisector's* *Observable* types broadcast unique events correlated to specific types of mutations and accessors. As such, one can bind methods to variables and render them event-bound.

*Vivisector* is flexible, compact, and straightforward; it affords you fine-grained control by allowing you to decide when and what happens when a variable changes.

### <a name="feat"></a> Features

- lightweight, reactive programming with no setup or boilerplate
- Observe prototype methods on Arrays, Objects, Strings
- instantly link/unlink actions to a variable's state
- bind unlimited callbacks to specific types of state-mutation events *e.g. `itemadded`, `itemremoved`*
- custom, chainable methods maintain stable execution context *i.e. method-chaining without the need to explicitly pipe `this`*
- helper accessors on all *Observables* to simplify evaluation
- no need to use `new` keyword, no configuration; `Vivisector` types work out-of-the-box
- absolutely zero dependencies

## <a name="usage"></a> Installation and Usage

[Install via NPM](https://www.npmjs.com/package/vivisector) with `npm i vivisector`.

Import *Vivisector's* caller alias `vivisect`:

```js
const { vivisect } = require("vivisector"); // assuming cjs - Vivisector supports esm, too
```

Create a new *Observable* - in this example, of type `Array` - and register a handler to fire when any *new elements* are added:

```js
const logAdditions = ({item, index}) => console.log(`Added ${item} at index ${index}.`);

const users = vivisect(["Alice", "Bob"]);

users.addEventListener("itemadded", logAdditions);
// every time an item is added to the array, fire `logAdditions`

users.push("Charlie");
// "Added Charlie at index 2."
```

Have a look at these usage guides for a full overview:

- [See Usage Guide for arrays](/documentation/usage-observable-array.md)
- [See Usage Guide for strings](/documentation/usage-observable-string.md)

## <a name="docs"></a> Documentation

- [Type-specific APIs](#types)
  - [Arrays](#arr)
  - [Objects](#obj)
  - [Strings](#str)
- [Ubiquitous Properties](#all)

### <a name="types"></a> Vivisector Types

#### <a name="arr"></a> Arrays

**Example:**

```js
const albums = vivisect(["Tago Mago", "Monster Movie", "Ege Bamyasi"]);
```

#### Unique Methods and Props

#### findIndexAll

Returns an Array of all indices that contain a match to given argument. Does not evaluate nested items.

**Example:**

```js
const users = vivisect(["hello", "world", "world", "hello", "world"]);
console.log(users.findIndexAll("hello"));
// [0, 3]
```

#### findIndexAllDeep
Returns an Array of all indices that contain a match to given argument. Walks entire Array tree and evaluates nested items.

**Example:**

```js
const users = vivisect(["hello",["hello"], "world", ["world", "hello"], ["world", ["world",["hello"]]]]);
console.log(users.findIndexAllDeep("hello"));
// [ [ 0 ], [ 1, 0 ], [ 3, 1 ], [ 4, 1, 1, 0 ] ]
```

#### Event Types

#### itemadded

A new item has been added to the Array. Callbacks will receive an Object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "itemadded", denoting the event-type that was triggered |
| **item** | the new item, now added to the Array |
| **index** | the index at which the item was added |

**Fires on:** *push, unshift, splice*

#### itemset

An item in the Array has moved. Callbacks will receive an Object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "itemset", denoting the event-type that was triggered |
| **item** | the item set in the Array |
| **index** | the index to which the item was allocated |

**Fires on:** *unshift, using index accessors to set Array items*

**Note:** Shuffling the Array or using methods like `unshift` will fire `itemset` for *each* index change

#### itemremoved

An item has been removed from the Array. Callbacks will receive an Object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "itemremoved", denoting the event-type that was triggered |
| **item** | the item removed from the Array |
| **index** | the index at which the item was removed |

**Fires on:** *pop, shift, splice*

#### mutated

The Array value has been reassigned. Callbacks will receive an Object consisting of :
| Property | Value |
| --- | --- |
| **type** | String "mutated", denoting the event-type that was triggered |
| **item** | the new Array value |
| **index** | String "all", denoting all indices will have been affected |

**Fires on:** *Using the value accessor to mutate the Array value*

#### <a name="obj"></a> Objects

**Example:**

```js
const target = {
    name: "La Monte Young",
    genre: "Minimalism"
};

const music = vivisect(target);
```

#### Event Types

#### itemget

An Object property value has been accessed. Callbacks will receive an Object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "itemget", denoting the event-type that was triggered |
| **prop** | The name or Symbol of the property being accessed |
| **target** | The target object |
| **value** | The specific value being accessed |

#### itemset

An Object property value has been set. Callbacks will receive an Object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "itemset", denoting the event-type that was triggered |
| **prop** | The name or Symbol of the property being set |
| **target** | The target object |
| **value** | The new value that has been set on `prop` |

#### itemdeleted

An Object property value has been deleted. Callbacks will receive an Object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "itemdeleted", denoting the event-type that was triggered |
| **prop** | The name or Symbol of the property being deleted |
| **target** | The stringified target object |
| **value** | A Boolean value indicating deletion success |


#### <a name="str"></a> Strings

**Example:**

```js
const hash = vivisect("UmVhZE1vcmVZdWtpb01pc2hpbWEK");
```

#### Unique Methods and Props

#### reassign

Mutates String value, chainable (returns `this`).

**Example:**

```js
const str = vivisect("Hello, world");
str.reassign("Hello, moon").addEventListener(...

console.log(str);
// Hello, moon
```

#### length

Returns String value length; non-configurable.

#### Event Types

#### mutated

The String value has been reassigned. Callbacks will receive an Object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "mutated", denoting the event-type that was triggered |
| **value** | the previous String value |
| **mutant** | the reassigned String value |

#### <a name="all"></a> <u>Ubiquitous Methods and Props</u>

#### Purity

The ``vivisect`` handler copies by value, not by reference. Observables do not modify the original Objects passed to them upon instantiation.

#### value

A non-enumerable accessor for getting and/or setting the core value of a given *Observable*

**Example:**

```js
 const users = vivisect(["Alice", "Bob"]);

 console.log(users.value);
 // ["Alice", "Bob"]

 users.value = ["Alexei", "Quinn"];

 console.log(users.value);
 // ["Alexei", "Quinn"]
 ```

**Note**: *Get/Set on types `String`, `Array`*; *Get on types `Object`*

#### addEventListener

Bind a callback to fire whenever a given event-type has been triggered.

See also: [debounce](#debounce) option.

**Example:**

```js
const logMsg = function (event) {
  // every time an item is added to the array, fire this callback
  console.log(`Added ${event.item} at index ${event.index}.`);
});

const users = vivisect(["Alice","Bob"]).addEventListener("itemadded", logMsg);

users.push("Charlie");
// "Added Charlie at index 2."
```

#### removeEventListener

Remove an existing callback from the respective event-type to which it has been registered.

See also: [debounce](#debounce) option.

**Example:**

```js
const logMsg = function (event) {
  console.log(`Added ${event.item} at index ${event.index}.`);
});

const users = vivisect(["Alice","Bob"])
  .addEventListener("itemadded", logMsg)
  .removeEventListener("itemadded", logMsg);

users.push("Charlie");
// no log - handler was removed ^
```

#### <a name="debounce"></a> debounce (option)

Optionally enforce a debounce on a given event-listener; handler calls will be throttled for a duration of *n* milliseconds.

To `vivisect` with a debounce directive, one need only specify a third and optional argument when calling `addEventListener` - a Number denoting milliseconds to which the debounce timeout will be set.

To unregister a debounced handler via `removeEventListener`, simply pass the handler name as usual.

**Example:**

```js
const logMsg = function (event) {
  console.log(`Added ${event.item} at index ${event.index}.`);
});

const users = vivisect(["Alice","Bob"]).addEventListener("itemadded", logMsg, 2000);

users.push("Charlie");
// two seconds later..."Added Charlie at index 2."

// `vivisect` will find and remove the debounced `logMsg`; no debounce directive needed here
users.removeEventListener("itemadded", logMsg);

users.push("RMS");
// no log - debounced handler was removed ^
```
