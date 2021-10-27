![Vivisector Logo](/docs/vx.png)

# Vivisector | Convert any object into an evented, reactive state machine ✂️

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
  - [Getting Started](#start)
  - [Event Types](#evtypes)
  - [Methods](#methods)
  - [State Commitment](#state)
- [Next](#next)

## <a name="intro"></a> Introduction

**Convert any object into an evented, reactive state machine.**

`Vivisector` is a light-weight building block for pub/sub modeling, state management, and reactive programming.
It works by enabling you to add event listeners to plain objects and arrays, binding *N* actions to their state mutations. Registered actions can then intercept state transitions and decide whether to commit or revert them.

```js
const { vivisect } = require('vivisector-js');

const state = vivisect({
  firstName: '',
  lastName: '',
  email: ''
})
  .subscribe('set', ({ prevState, nextState, done }) => {
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

- 📦 zero dependencies
- 🪶 light-weight and compact at [~ 2kb gzipped](https://bundlephobia.com/package/vivisector@1.5.0)
- 👌 simple and well-documented API
- 🔥 support for (and built with) TypeScript
- ✨ available for ESM, UMD, and CommonJS build targets
- 🚀 bind actions to a variable's state on the fly
- 🔌 harness the power of reactive programming without the excess boilerplate
- ✔️ preview, then declaratively cancel or commit state changes

## <a name="install"></a> Installation

[Install via NPM](https://www.npmjs.com/package/vivisector)

NPM:

```bash
npm install vivisector-js
```

Yarn:

```bash
yarn add vivisector-js
```

## <a name="docs"></a> Documentation

Before we dive in, here's a couple of quick notes that are rather **important**:

- `Vivisected` objects are COPIED by value, not reference
- don't mutate state in callbacks - doing this will result in *undefined behavior*; that's what the `done` function is for
- nested objects become their own proxies

  For example, in the following code

  ```js
  const o = vivisect({ a: {} });

  Object.assign(o.a, someObject);
  ```

  `o.a` will invoke events with a base state of `{}`

### <a name="start"></a> Getting Started

Let's manage some evented state!

First, we'll import the `vivisect` utility:

```js
const { vivisect } = require('vivisector'); // assuming cjs for this tutorial, but Vivisector supports es modules, too
```

This function will take our object or array and return an evented copy.

In this example, we'll `vivisect` an array and register a callback function for the `add` event. Our callback will be invoked whenever *new elements* are added to the array. We'll keep things simple for now by passing along the `alwaysCommit` option, which means any state transitions associated `add` events will always be committed.

```js
const logAdditions = ({ type, prevState, nextState }) => {
    console.log(`${type} event captured. ${prevState} --> ${nextState}`);
};

// instantiate our `users` list - what an interesting bunch!
const users = vivisect(['Damo Suzuki', 'Soren Kierkegaard', 'Donald Knuth']);

// every time an item is added to `users`, we want to invoke `logAdditions`
users.subscribe('add', logAdditions, { alwaysCommit: true });

// let's bring someone fictional into the mix
users.push('Elric of Melnibone');
// 'add event captured. ['Damo Suzuki', 'Soren Kierkegaard', 'Donald Knuth'] ==> ['Damo Suzuki', 'Soren Kierkegaard', 'Donald Knuth', 'Elric of Melnibone']
```

Both arrays and objects can be `vivisected` in this manner:

```js
const albums = vivisect({ krautrock: ['Tago Mago', 'Monster Movie', 'Ege Bamyasi'] });
```

The object's prototype is unaffected, save for the added event registrars (more on these later)
```js
console.log(Object.values(albums)[0].findIndex(i => i.startsWith('T')));; // 0
```

Event handlers are registered by calling `subscribe`. This method will exist on every `vivisected` object:

```js
users.subscribe(eventType, eventHandler, options);
```

And when we're done, we can remove the handler by passing a reference to it into the `unsubscribe` method:

```js
users.unsubscribe(eventType, eventHandlerRef);
```

### <a name="evtypes"></a> Event Types

This section documents all builtin `Vivisector` events and their behaviors.

#### add

A new element or property has been *added* to the target. 'Add' typically constitutes as a new indexed property that previously did not exist.

Callbacks will receive a function, `done`, and an object consisting of:
| Property | Value |
| --- | --- |
| **type** | Enum 'add', denoting the event-type that was triggered |
| **prevState** | the previous state |
| **nextState** | the next state, i.e. the result of the add event that was captured |

**Fires on:** Additive array functions; adding new properties

**Note:** Operations such as `Array.prototype.push` are considered `batched` events if provided more than a single argument

#### set

An existing element or property has changed.

Callbacks will receive a function, `done`, and an object consisting of:
| Property | Value |
| --- | --- |
| **type** | Enum 'set', denoting the event-type that was triggered |
| **prevState** | the previous state |
| **nextState** | the next state, i.e. the result of the add event that was captured |

**Fires on:** Setting existing properties; mutating indexed accessors

#### del

An element or property has been deleted.

Callbacks will receive a function, `done`, and an object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "del", denoting the event-type that was triggered |
| **prevState** | the previous state |
| **nextState** | the next state, i.e. the result of the add event that was captured |

**Fires on:** methods such as `pop`; `delete` called on a property

#### batched

A batched event has occurred. Batched events are those which carry several state changes as the result of a single action. For example, `Array.prototype.unshift` may prepend an element and shifts each element. Similarly, `Array.prototype.push` may be a batched event if provided more than a single argument.

Callbacks will receive a function, `done`, and an object consisting of:
| Property | Value |
| --- | --- |
| **type** | String "batched", denoting the event-type that was triggered |
| **prevState** | the previous state |
| **nextState** | the next state, i.e. the result of the add event that was captured |

**Fires on:** methods such as `shift`, `unshift`, `push` when called with multiple elements

### <a name="methods"></a> Methods

Methods bound to all `vivisected` objects:

#### subscribe (eventName: ISubscriptionEvent, handler: ISubscriptionCallback, opts?: ISubscriptionOpts) => IVivisectorApi

Bind the callback `handler` to fire whenever an event of `eventName` has been triggered.

**Options:**
| Property | Value |
| --- | --- |
| **alwaysCommit?** | a boolean indicating whether this action will always commit its state transitions. defaults to false |

**Throws when**: provided an invalid event type or non-function handler

**Example:**

```js
const logMsg = function (event, done) {
  // every time an item is added to the array, fire this callback
  console.log(`Added item such that ${event.prevState} becomes ${event.nextState}`);
  if (event.nextState.length) done(true);
});

const languages = vivisect(['C', 'Go']).subscribe('add', logMsg);

languages.push('JavaScript');
// "Added item such that ['C','Go'] becomes ['C','Go', 'JavaScript']"
```

#### unsubscribe (eventName: ISubscriptionEvent, handler: ISubscriptionCallback, opts?: ISubscriptionOpts) => IVivisectorApi

Remove an existing callback from the respective event-type to which it has been registered.

**Options:** n/a

**Throws when**: provided an invalid event type or non-function handler

**Example:**

```js
const logMsg = function (event) {
  ...
});

const queens = vivisect(['RuPaul', 'Alaska'])
  .subscribe('add', logMsg, { alwaysCommit: true })
  .unsubscribe('add', logMsg);

queens.push('Bianca Del Rio');
// no log - handler was removed ^
```

### <a name="state"></a> State Commitment
As we've seen throughout the documentation, `Vivisector` events provide the opportunity to commit or revert state mutations. Every event callback is provided a `done` function with the following signature:

`done (commit: boolean)`

You'll have the opportunity to preview what the state transition would be by inspecting the `nextState` property. Then, you may programmatically commit the transition by passing `true` to the `done` function.

Passing `false` or not invoking `done` at all will revert any state changes and `nextState` will not take effect. The exception to this rule is the `alwaysCommit` option, which may be passed when registering the callback.

## <a name="next"></a> What's Next for `Vivisector`?

Here's a short list of upcoming features...

- ~~cancellable state mutations~~
- deferred and 'auto-async' state mutations
- queued events
- custom event types (bind specific and user-defined prototype methods)
- optional batching

Contributions and feature requests are always welcome!
