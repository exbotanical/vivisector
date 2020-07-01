<img src="https://github.com/MatthewZito/vivisector-js/blob/master/documentation/vx.png" width="390" height="390">

# Vivisector.js | A Node.js library for observable JavaScript datatypes and informatics
```
Author: Matthew T Zito
License: MIT
```
## Table of Contents

 - [Introduction](#intro) 
    * [Packages](#packages)
 - [Documentation](#docs)
    * [Usage](#use)
    * [Demos](#demo)

## <a name="intro"></a> Introduction
*Vivisector.js* is a light-weight JavaScript library that enables one to instantiate observable datatypes - that is, Arrays, Strings, et cetera that can have event listeners attached to them. 

*Vivisector* recursively points child objects at its own prototype so as to expose myriad useful methods for managing *all* Observables extant in a given code-base. This is a powerful feature that allows you to centralize a singular source-of-truth for managing your Observable Arrays, Strings, *et al* via the core *Vivisector* API.

Each *Vivisector* child object - a given `Observable` - extends its respective type's interface so as to expose custom event-driven methods. As such, one can attach event listeners to datatypes such as Arrays, Strings, *et cetera*.

*Vivisector* also comes equipped with a configurable, polymorphic Logger. The Logger constructor accepts as input a single configuration file (standard Object notation) from which it will define and set its own methods and properties. This means we can configure *very* specific `stdout` and `stderr` formatting. The primary purpose here is to utilize the Logger as a service which is event-bound, allowing specific log formats to correlate to specific Observables (or groups thereof) and *their* respective events. 

This means that in addition to 'listening' to data types, the library itself exposes a portable listener for managing *all* active Observables.

### <a name="packages"></a> Packages and Libraries

#### Observable Datatypes
  - [Observables Module Entrypoint](https://github.com/MatthewZito/vivisector-js/blob/master/packages/datatypes/index.js)
  - [Observable Arrays](https://github.com/MatthewZito/vivisector-js/blob/master/packages/datatypes/ObservableArray.js)
  - [Observable Strings](https://github.com/MatthewZito/vivisector-js/blob/master/packages/datatypes/ObservableString.js)

#### Informatics and I/O
  - [Polymorphic Logger](https://github.com/MatthewZito/vivisector-js/blob/master/packages/informatics/PolymorphicLogger.js)

## <a name="docs"></a> Documentation
*Vivisector's* entrypoint architecture is inspired by jQuery - to this day, in my estimation, an exemplar of creative JavaScript programming. However, among the greatest criticisms of jQuery was that it "abstracted away" too much of the logic intrinsic to running JS in a browser runtime environment *e.g. V8*. 

In the stead of such abstractions, *Vivisector* is all about "cutting open" (hence the name) JavaScript Objects and providing the programmer a safe and secure means to inject prototype logic therein without worrying about misaligning execution contexts. 

The core of the *Vivisector* library is the ability to instantiate "Observable" JavaScript Objects; the *Vivisector* API exposes the `Observable` factory constructor on the global object. 

For example, we can instantiate a new `ObservableArray` and we will have available to us an Array-like object which extends native Array methods and properties, but is also equipped with the capacity to become event-bound. That is, *Vivisector* gives you an Array onto which you can bind (and chain) events. *Note: You won't have to use the `new` keyword, as this logic is handled for you by the `Observable` prototype*

The global `Vivisector` Object also exposes several helper methods and recursively extends all `Observable` objects such that they inherit these properties. This is the architectural feature which enables method-chaining without the need to explicitly pipe `this`. 

It works because each `Observable` instance prototype ultimately points to the `Observable` meta-prototype prescribed by *Vivisector*; the methods therein always return `this`, enabling method-chaining with an implicitly stable execution context *i.e. `this` gets passed automatically*.

### <a name="use"></a> Usage
  - [See Usage Documentation for ObservableArray](https://github.com/MatthewZito/vivisector-js/blob/master/documentation/usage-observable-array.md)
  - [See Usage Documentation for Logger Module](https://github.com/MatthewZito/vivisector-js/blob/master/documentation/usage-logger.md)

### <a name="demo"></a> Demonstrations and Abstractions
Logger Usage Demo:

![demo](https://github.com/MatthewZito/vivisector-js/blob/master/documentation/polymorphic-logger-demo.gif)



// Imminent Todos

  - build out `transmogrify` method on base prototype for handling observable transfers
  - error handling
  - config jest + travis CI for automated testing