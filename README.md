![Vivisector Logo](/documentation/vx.png)

# Vivisector | Compact observables

[![Build Status](https://travis-ci.com/MatthewZito/vivisector.svg?branch=master)](https://travis-ci.com/MatthewZito/vivisector)
[![Coverage Status](https://coveralls.io/repos/github/MatthewZito/vivisector/badge.svg?branch=master)](https://coveralls.io/github/MatthewZito/vivisector?branch=master)
[![npm version](https://badge.fury.io/js/vivisector.svg)](https://badge.fury.io/js/vivisector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## API and Documentation

## Table of Contents

- [Introduction](#intro)
  - [Features](#feat)
- [Install](#install)
- [Documentation](#docs)
  - [Quick Start](#quick)
  - [Event Types](#evtypes)
  - [Methods](#methods)
- [Next](#next)

## <a name="intro"></a> Introduction

For those moments when RXjs is overkill...

*Vivisector* is a compact JavaScript library designed to support hassle-free reactive programming. *Vivisector* allows you to tether actions to specific types of mutation events, rendering your application's state event-bound.

Here's what that looks like:

```js
const { vivisect } = require('vivisector-js');

const state = vivisect({
  firstName: '',
  lastName: '',
  email: ''
})
  .addEventListener('set', ({ prevState, nextState }) => {
    if (nextState.email) {
      sendWelcomeEmail();
    }

    ...
  });


state.email = '...'; // `sendWelcomeEmail` invoked
```

*Vivisector* is flexible, compact, and straight-forward; it affords you fine-grained control by allowing you to decide when and what happens when state changes.

### <a name="feat"></a> Features

*Vivisector*...

- has zero dependencies
- is compact at 3kb gzipped
- has a simple, straight-forward API
- supports TypeScript and JavaScript

With it, you can...

- instantly link/unlink actions to a variable's state
- harness the power of reactive programming without the excess boilerplate

## <a name="install"></a> Installation

[Install via NPM](https://www.npmjs.com/package/vivisector)

```bash
npm install vivisector-js
```

or

```bash
yarn add vivisector-js
```

## <a name="docs"></a> Documentation

Before we begin, here's a few quick notes that are rather *important*:

- `Vivisected` objects are COPIED by value, not reference
- don't mutate state in callbacks - doing this will result in undefined behavior
- nested objects become their own proxies

  For example, in the following code

  ```js
  const o = vivisect({ a: {} });

  Object.assign(o.a, someObject);
  ```

  `o.a` will invoke events with a base state of `{}`

### <a name="quick"></a> Quick Start

Import *Vivisector's* `vivisect` utility:

```js
const { vivisect } = require('vivisector'); // assuming cjs - Vivisector supports esm, too
```

Create a new *Observable* - in this example, an array - and register a handler to fire when any *new elements* are added:

```js
const logAdditions = ({ type, prevState, nextState }) => console.log(`${type} captured. ${prevState} ==> ${nextState}`);

const users = vivisect(['Alice', 'Bob']);

users.addEventListener('add', logAdditions);
// every time an item is added to the array, fire `logAdditions`

users.push('Charlie');
// 'add captured. ['Alice', 'Bob'] ==> ['Alice', 'Bob', 'Charlie']
```

Arrays and Objects can be `vivisected` in this manner:

```js
const albums = vivisect(['Tago Mago', 'Monster Movie', 'Ege Bamyasi']);
```

```js
// the array prototype is unaffected, save for the added event registrars
console.log(albums.find(i => i === 'Tago Mago')); // 'Tago Mago'
```

Event handlers are added by calling `addEventListener`. This function will exist on any `vivisected` object:

```js
users.addEventListener(eventType, eventHandler);
```

`addEventHandler` can listen to any of three events.

### <a name="evtypes"></a> Event Types

#### add

A new element or property has been added to the array or object. Callbacks will receive an object consisting of:
| Property | Value |
| --- | --- |
| **type** | String 'add', denoting the event-type that was triggered |
| **prevState** | the previous state |
| **nextState** | the next state, after the event we are listening to |

**Fires on:** Additive array functions; adding new properties

**Type (TypeScript only)** `VX_LISTENER_INTERNALS.ADD`

**Note:** Batched operations are individual events e.g. `arr.push(1,2,3)` is three 'add' events

#### set

An existing element or property has changed. Callbacks will receive an object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "set", denoting the event-type that was triggered |
| **prevState** | the previous state |
| **nextState** | the next state, after the event we are listening to |

**Fires on:** Setting extant properties; index accessors

**Type (TypeScript only)** `VX_LISTENER_INTERNALS.SET`

#### del

An element or property has been deleted. Callbacks will receive an object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "itemremoved", denoting the event-type that was triggered |
| **prevState** | the previous state |
| **nextState** | the next state, after the event we are listening to |

**Fires on:** methods such as *`pop`, `shift`, `splice`*; `delete` called on a property

**Type (TypeScript only)** `VX_LISTENER_INTERNALS.DEL`

### <a name="methods"></a> Methods

Methods bound to all `vivisected` objects:

#### addEventListener (eventName: VX_EVENT_TYPE, handler: VxEventHandler) => VxEventedObject

Bind a callback to fire whenever a given event-type has been triggered.

**Throws when**: provided an invalid event type or non-function handler

**Example:**

```js
const logMsg = function (event) {
  // every time an item is added to the array, fire this callback
  console.log(`Added item such that ${event.prevState} becomes ${event.nextState}`);
});

const users = vivisect(['Alice','Bob']).addEventListener('add', logMsg);

users.push('Charlie');
// "Added item such that ['Alice','Bob'] becomes ['Alice','Bob', 'Charlie']"
```

#### removeEventListener (eventName: VX_EVENT_TYPE, handler: VxEventHandler) => VxEventedObject

Remove an existing callback from the respective event-type to which it has been registered.

**Throws when**: provided an invalid event type or non-function handler

**Example:**

```js
const logMsg = function (event) {
  ...
});

const users = vivisect(['Alice','Bob'])
  .addEventListener('add', logMsg)
  .removeEventListener('add', logMsg);

users.push('Charlie');
// no log - handler was removed ^
```

## <a name="next"></a> What's Next?

Next up for Vivisector is:

- cancellable state mutations
- deferred state mutations
- custom event types (bind specific methods to event handlers)
