# Vivisector.js | A Node.js library for Observable JavaScript Datatypes and Informatics
```
Author: Matthew T Zito
License: MIT
```
## Table of Contents

 - [Introduction](#intro) 
    * [Packages](#packages)
    * [Demos](#demo)
 - [Documentation](#docs)
    * [Event-bound Logging](#logger)

## <a name="intro"></a> Introduction
Vivisector.js is a light-weight JavaScript library which exposes an API to the Nodejs runtime's global object, allowing you to instantiate new Observable datatypes on-the-fly. Vivisector recursively points child objects at its own prototype so as to expose myriad useful methods for managing *all* Observables extant in a given code-base. This is a powerful feature that allows you to centralize a singular source-of-truth for managing your Observable Arrays, Strings, *et al* via the core Vivisector API.

Each Vivisector child object - a given Observable - extends its respective types' interface so as to expose custom event-driven methods. As such, one can attach event listeners to datatypes such as Arrays, Strings, *et cetera*.

Vivisector comes equipped with a configurable, polymorphic Logger. The Logger constructor accepts as input a single configuration file (standard Object notation) from which it will define its own methods. This means we can configure *very* specific `stdout` and `stderr` formatting. The primary purpose here is to utilize the Logger as a service which is event-bound, allowing specific log formats to correlate to specific Observables (or groups thereof) and their respective events.

### <a name="packages"></a> Packages and Libraries

#### Observable Datatypes
  - [Observables Module Entrypoint](https://github.com/MatthewZito/vivisector-js/blob/master/packages/datatypes/index.js)
  - [Observable Arrays](https://github.com/MatthewZito/vivisector-js/blob/master/packages/datatypes/ObservableArray.js)

#### Informatics and I/O
  - [Polymorphic Logger](https://github.com/MatthewZito/vivisector-js/blob/master/packages/informatics/PolymorphicLogger.js)

### <a name="demo"></a> Demonstrations and Abstractions
Logger Usage Demo:

![demo](https://github.com/MatthewZito/vivisector-js/blob/master/documentation/polymorphic-logger-demo.gif)

## <a name="docs"></a> Documentation

### <a name="logger"></a> Event-bound Logging

[See Usage Documentation for Logger Module](https://github.com/MatthewZito/vivisector-js/blob/master/documentation/usage-logger.md)