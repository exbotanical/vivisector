# Usage: Logger Module, Vivisector.js

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
            delimiter: "-",
            suffix: ""
        },
        warn: {
            name: "warn",
            color: "FgMagenta",
            label: "[WARN]",
            delimiter: "-"
            suffix: ""
        },
        error: {
            name: "error",
            color: "FgRed",
            label: "[ERROR]",
            delimiter: "-"
            suffix: "\n"
        },
        success: {
            name: "success",
            color: "FgGreen",
            label: "[ACK]",
            delimiter: "-"
            suffix: ""
        }
    },
    options: {
        bodyColor: "FgYellow",
        replacer: null,
        whiteSpace: 0
    }
}
```
This is my personal configuration. In addition to extending the native `info`, `warn`, and `error` methods, I have also implemented a custom `success` method. In the config, I have specified certain options for each method which afford a considerably granular control-scope. For instance, here I can set a prefix for the specific logger method, a delimiter with which to separate said prefix from the actual logged data, as well as colors for the prefix-delimiter.
Note that you can set the `label` or `suffix` properties to a string (like I did with the labels here), or you can use an expression e.g. `new Date()`:
```
...
yourMethod: {
            name: "test",
            color: "FgGreen",
            label: new Date(),
            delimiter: "- [+]",
            suffix: "\n"
        }
...

let logger = new Logger(yourConfig);
logger.test("this is a test");
logger.test("this is a second test");
// Fri Jun 26 2020 08:08:15 GMT-0700 (Pacific Daylight Time) - [+] "this is a test" 
//
// Fri Jun 26 2020 08:08:15 GMT-0700 (Pacific Daylight Time) - [+] "this is a second test" 
```

The logger will actually resolve objects using `JSON.stringify`. As such, some of the `options` of the config correlate specifically to the format of object output. To colorize the logged data, specify the desired hex value key as `options.bodyColor`. If you want to prettify/format the output, consider entering as the `options.whiteSpace` value a whole integer greater than 0. Furthermore, the `replacer` can be set to filter the stringified object.

To configure the logger, add a method to the config:
```
const yourConfig = {
    aliasMethodName: {
            name: "yourMethod",
            color: "colorCaseDoesntMatter",
            label: "[method prefix]",
            delimiter: "-->",
            suffix: ""
        },
        ...
}

let logger = new Logger(yourConfig);
logger.yourMethod("hello, world");
// [method prefix] --> "hello, world"
```

  - `aliasMethodName`: Object key, arbitrary label for readability. I recommend matching these to `name`.
  - `name`: String representing allable method name.
  - `color`: Case-insensitive string representing color of prefix + delimiter. Key which maps to hex value. 
  - `label` String or expression value which will resolve as prefix/label for given log method. Null or empty string if none.
  - `delimiter`: String with which to delimit label/prefix from logged data. Null or empty string if none.
  - `suffix`: String or expression value which will be concatenated to the end of each log. This is particularly useful if you want to separate logs with newlines, as demonstrated in the `error` method options in my config. Null or empty string if none.

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
  - `bodyColor`: Color of logged data, applies to all methods. Key which maps to hex value. String, case-insensitive. 
  - `replacer`: Function which alters the behavior of the stringification process, OR an array comprised of elements of types String and/or Number which serves as an 'allowlist' for filtering the properties of the value object to be included in the JSON string. If this value is `null` or not provided, all properties of the object will be included in the resulting string output.
  - `whiteSpace`: String or Number object used to insert white space into the output JSON string for readability purposes.
