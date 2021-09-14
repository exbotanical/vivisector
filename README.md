![Vivisector Logo](/docs/vx.png)

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
  - [Committing Mutations](#commit)
  - [Methods](#methods)
- [Next](#next)

## <a name="intro"></a> Introduction

*Note: this README is a WIP*

*Vivisector* is a compact TypeScript library for hassle-free reactive programming. *Vivisector* allows you to tether actions to specific types of mutation events, rendering your application's state event-bound.

Furthermore, *Vivisector* grants you the ability to declaratively mutate state. Every event is accompanied by a `done` function which can be used to either commit the state change or reject it.

Here's what that looks like:

```js
const { vivisect } = require('vivisector-js');

const state = vivisect({
  firstName: '',
  lastName: '',
  email: ''
})
  .addEventListener('set', ({ prevState, nextState, done }) => {
    if (!isValidEmail(nextState.email)) {
      emitErrorMessage();
      done(false);
    } else {
      sendWelcomeEmail();
      done(true);
    }

    ...
  });
```

### <a name="feat"></a> Features

*Vivisector*...

- has zero dependencies
- is compact at 3kb gzipped
- has a simple, straight-forward API
- supports TypeScript and JavaScript

With it, you can...

- instantly link/unlink actions to a variable's state
- harness the power of reactive programming without the excess boilerplate
- declaratively cancel or commit state changes before they happen

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
- don't mutate state in callbacks - doing this will result in undefined behavior; that's what the `done` function is for
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

Create a new *Observable* - in this example, an array - and register a handler to fire when any *new elements* are added. We'll keep it simple for now by using the `alwaysCommit` option, which means any state changes associated with events of the given type will always be committed.

```js
const logAdditions = ({ type, prevState, nextState }) => console.log(`${type} captured. ${prevState} ==> ${nextState}`);

const users = vivisect(['Alice', 'Bob']);

users.addEventListener('add', logAdditions, { alwaysCommit: true });
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
users.addEventListener(eventType, eventHandler, { alwaysCommit: true });
```

`addEventListener` can listen to the following events...

### <a name="evtypes"></a> Event Types

#### add

A new element or property has been added to the array or object. Callbacks will receive a function, `done`, and an object consisting of:
| Property | Value |
| --- | --- |
| **type** | String 'add', denoting the event-type that was triggered |
| **prevState** | the previous state |
| **nextState** | the next state, after the event we are listening to |

**Fires on:** Additive array functions; adding new properties

**Type (TypeScript only)** `VX_LISTENER_INTERNALS.ADD`

**Note:** Batched operations are individual events e.g. `arr.push(1,2,3)` is three 'add' events

#### set

An existing element or property has changed. Callbacks will receive a function, `done`, and an object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "set", denoting the event-type that was triggered |
| **prevState** | the previous state |
| **nextState** | the next state, after the event we are listening to |

**Fires on:** Setting extant properties; index accessors

**Type (TypeScript only)** `VX_LISTENER_INTERNALS.SET`

#### del

An element or property has been deleted. Callbacks will receive a function, `done`, and an object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "del", denoting the event-type that was triggered |
| **prevState** | the previous state |
| **nextState** | the next state, after the event we are listening to |

**Fires on:** methods such as `pop`; `delete` called on a property

**Type (TypeScript only)** `VX_LISTENER_INTERNALS.DEL`

#### batched

A batched event has occurred. Batched events are those which carry several state changes as the result of a single action. For example, `Array.prototype.unshift` may prepend an element and shifts each element.

Callbacks will receive a function, `done`, and an object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "batched", denoting the event-type that was triggered |
| **prevState** | the previous state |
| **nextState** | the next state, after the event we are listening to |

**Fires on:** methods such as `shift`, `unshift`, `push` when called with multiple elements

**Type (TypeScript only)** `VX_LISTENER_INTERNALS.BATCHED`

### <a name="methods"></a> Methods

Methods bound to all `vivisected` objects:

#### addEventListener (eventName: VX_EVENT_TYPE, handler: VxEventHandler, opts: { alwaysCommit?: boolean }) => VxEventedObject

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

#### removeEventListener (eventName: VX_EVENT_TYPE, handler: VxEventHandler, opts: { alwaysCommit?: boolean }) => VxEventedObject

Remove an existing callback from the respective event-type to which it has been registered.

**Throws when**: provided an invalid event type or non-function handler

**Example:**

```js
const logMsg = function (event) {
  ...
});

const users = vivisect(['Alice','Bob'])
  .addEventListener('add', logMsg, { alwaysCommit: true })
  .removeEventListener('add', logMsg);

users.push('Charlie');
// no log - handler was removed ^
```

## <a name="next"></a> What's Next?

Next up for Vivisector is:

- ~~cancellable state mutations~~
- deferred state mutations
- custom event types (bind specific methods to event handlers)
