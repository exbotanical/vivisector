#!/usr/bin/env node

/**
 * @param {Object} config A configurations object for method mappings and options thereof.
 * @summary A logger module with a configurable prototype for dynamic output formatting.
 * @description This logger module enables the user to instantiate a customized logging utility 
 *     by passing in a configurations object. This configurations object is processed by the
 *     constructor, wherein values then serve as mappings, the methods and properties of which are dynamically applied.
 *     Ergo, this module allows the extension and augmentation of the `Console` object to create indeterminate, arbitrary
 *     methods.
 * @extends Console This module extends the native `Console` object's `warn`, `info`, `error` and `log` methods,
 *     contingent on those methods which the user provides in the aforementioned configurations object.
 * @author Matthew T Zito (goldmund)
 * @license MIT
 */
class Logger {
    constructor(config) {
        // standard color dict for extended options
        const _colorDict = {
            reset : "\x1b[0m",
            bright : "\x1b[1m",
            dim : "\x1b[2m",
            underscore : "\x1b[4m",
            blink : "\x1b[5m",
            reverse : "\x1b[7m",
            hidden : "\x1b[8m",
        
            fgblack : "\x1b[30m",
            fgred : "\x1b[31m",
            fggreen : "\x1b[32m",
            fgyellow : "\x1b[33m",
            fgblue : "\x1b[34m",
            fgmagenta : "\x1b[35m",
            fgcyan : "\x1b[36m",
            fgwhite : "\x1b[37m",
        
            bgblack : "\x1b[40m",
            bgred : "\x1b[41m",
            bggreen : "\x1b[42m",
            bgyellow : "\x1b[43m",
            bgblue : "\x1b[44m",
            bgmagenta : "\x1b[45m",
            bgcyan : "\x1b[46m",
            bgwhite : "\x1b[47m",
        }
        // store configuration method values here; we'll be reusing them
        const providedMethods = Object.values(config.methods);

        /*
        we can destructure options *and* apply `toLowerCase` in-line by wrapping the entire assignment in an IIFE
        any expressions can be evaluated in this manner and mapped to target destructured val(s) like so: 
        */
        const { bodyColorSanitized, whiteSpace } = (({ bodyColor, whiteSpace }) => ({ bodyColorSanitized: bodyColor.toLowerCase(), whiteSpace }))(config.options);
        
        // loop through each provided method and dynamically assign to class instance (`this`)
        providedMethods.forEach(method => {
            // mutate color val strings to prevent case sensitivity
            const color = method.color.toLowerCase();
            // if provided method is extant in native source, extend props of console obj; else, apply to `log`
            let persistentReference = console[method.name] || console.log;
            this[method.name] = function () {
                // collate all given args into a 'real' array
                let args = Array.prototype.slice.call(arguments);
                // map ea. arg so as to exact type-contingent handling thereon
                let mutatedArg = args.map(function (arg) {
                    // hoist memory reference to store polymorphic arg
                    let str;
                    let argType = typeof arg;
                    // case null, simulate `null`
                    if (arg === null) {
                        str = "null";
                    } 
                    // case undefined, simulate unreturned expression
                    else if (arg === undefined) {
                        str = "";
                    } 
                    // case object
                    else if (!arg.toString || arg.toString() === "[object Object]") {
                        str = JSON.stringify(arg, null, whiteSpace); // OPTIONAL prettify format
                    } 
                    // case string
                    else if (argType === "string") {
                        str = `"${arg.toString()}"`;
                    } 
                    // et al
                    else {
                        str = arg.toString();
                    }
                    return str;
                }).join(", ");
                // if we've arguments, we do want to format them, yes?
                if (args.length) {
                    /* 
                    Now, we structure the actual format of our logs...
                    Note: appending the reset hex is imperative here given we've overridden color outputs
                    */
                    args = [
                        _colorDict[color] + 
                        method.label + 
                        ` ${method.delimiter} ` + 
                        `${bodyColorSanitized ? _colorDict[bodyColorSanitized] : _colorDict.reset}` + 
                        mutatedArg
                    ].concat(" ", _colorDict.reset);
                }
                // extend and invoke with formatted args
                persistentReference.apply(null, args); 
            };
        }, this);
    }
}

module.exports = Logger

// /* Example Config */
// let config = {
//     methods: {
//         info: {
//             name: "info",
//             color: "FgYellow",
//             label: "[INFO]",
//             delimiter: "-"
//         },
//         warn: {
//             name: "warn",
//             color: "FgMagenta",
//             label: "[WARN]",
//             delimiter: "-"
//         },
//         error: {
//             name: "error",
//             color: "FgRed",
//             label: "[ERROR]",
//             delimiter: "-"
//         },
//         success: {
//             name: "success",
//             color: "FgGreen",
//             label: "[ACK]",
//             delimiter: "-"
//         }
//     },
//     options: {
//         bodyColor: "FgYellow",
//         replacer: null,
//         whiteSpace: 0
//     }
// }

// /* Usage */
// const dowork = (work) => work + 5
// let words = ["no", "fail"]
// let wordsAgain = ["yes", "success"]

// let logger = new Logger(config)
// logger.warn({ alert: true, event: "ready" })
// logger.error(words)
// logger.success(wordsAgain)
// logger.info(dowork(17))