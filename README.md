# vivisector.js | A Collection of JavaScript Micro-Libraries for Custom Datatypes and Informatics

```
Author: Matthew T Zito
License: MIT
```
## Table of Contents

 - [Introduction](#intro) 
    * [Packages](#packages)
    * [Demos](#demo)
 - [Documentation](#docs)
    * [Polymorphic Logger](#logger)

## <a name="intro"></a> Introduction

### <a name="packages"></a> Packages and Libraries

#### Observable Primitives
  - [Observable Arrays](https://github.com/MatthewZito/vivisector-js/blob/master/packages/datatypes/ObservableArray.js)

#### Informatics and I/O
  - [Polymorphic Logger](https://github.com/MatthewZito/vivisector-js/blob/master/packages/informatics/PolymorphicLogger.js)

### <a name="demo"></a> Demonstrations and Abstractions
Logger Usage Demo:

![demo]((https://github.com/MatthewZito/vivisector-js/blob/master/documentation/polymorphic-logger-demo.gif))

## <a name="docs"></a> Documentation

### <a name="logger"></a> Polymorphic Logging

This module allows the creation of a customized logger that can be utilized in lieu of Node's native `Console` methods. In fact, this module - in part - extends them. 

The Logger accepts as input a configurations object. It expects the config to have such a structure:
```
* Example Config */
let config = {
    methods: {
        info: {
            name: "info",
            color: "FgYellow",
            label: "[INFO]",
            delimiter: "-"
        },
        warn: {
            name: "warn",
            color: "FgMagenta",
            label: "[WARN]",
            delimiter: "-"
        },
        error: {
            name: "error",
            color: "FgRed",
            label: "[ERROR]",
            delimiter: "-"
        },
        success: {
            name: "success",
            color: "FgGreen",
            label: "[ACK]",
            delimiter: "-"
        }
    },
    options: {
        bodyColor: "FgYellow",
        replacer: null,
        whiteSpace: 0
    }
}
```
This is my personal configuration. In addition to extending the native `info`, `warn`, and `error` methods, I have also implemented a custom `success` method. In the config, I have specified certain options for each method which afford a considerably granular control-scope. For instance, here I can set a prefix for the specific logger method, a delimiter with which to separate said prefix from the actual logged data, as well as colors for each the prefix with delimiter and logged data. 

The logger will actually resolve objects using `JSON.stringify`. As such, some of the `options` of the config correlate specifically to the format of object output. If you want to prettify/format the output, consider entering as the `options.whiteSpace` value a whole integer greater than 0. Furthermore, the `replacer` can be set to filter the stringified object.

To configure the logger, add a method to the config:
```
const yourConfig = {
    aliasMethodName: {
            name: "yourMethod",
            color: "colorCaseDoesntMatter",
            label: "[method prefix]",
            delimiter: "-->"
        },
        ...
}

let logger = new Logger(yourConfig);
logger.yourMethod("hello, world");
// [method prefix] --> "hello, world"
```

`aliasMethodName`: Object key, arbitrary label for readability. I recommend matching these to `name`.
`name`: String representing allable method name.
`color`: Case-insensitive string representing color of prefix + delimiter. Key which maps to hex value. 
`delimiter`: String with which to delimit label/prefix from logged data. 

Now, for the options:
```
const yourConfig = {
    ...
    options: {
        bodyColor: "FgYellow",
        replacer: null,
        whiteSpace: 0
    }
}
```
`bodyColor`: Color of logged data, applies to all methods. Key which maps to hex value. String, case-insensitive. 
`replacer`: Function which alters the behavior of the stringification process, OR an array comprised of elements of types String and/or Number which serves as an 'allowlist' for filtering the properties of the value object to be included in the JSON string. If this value is `null` or not provided, all properties of the object will be included in the resulting string output.
`whiteSpace`: String or Number object used to insert white space into the output JSON string for readability purposes.



