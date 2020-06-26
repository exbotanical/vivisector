#!/usr/bin/env node

/*
Author: Matthew T Zito (goldmund)
License: GPL 3.0
*/
class Logger {
    constructor(config) {
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
        // destructure and apply `toLowerCase` in-line
        const { bodyColorSanitized } = (({bodyColor}) => ({bodyColorSanitized: bodyColor.toLowerCase() }))(config.options);
        providedMethods.forEach(method => {
            // mutate color val strings to prevent case sensitivity
            const color = method.color.toLowerCase();
            // if provided method is extant in native source, extend props of console obj; else, apply to `log`
            let persistentReference = console[method.name] || console.log;
            this[method.name] = function () {
                var args = Array.prototype.slice.call(arguments);
                var logToWrite = args.map(function (arg) {
                    var str;
                    var argType = typeof arg;
                    // 
                    if (arg === null) {
                        str = "null";
                    } else if (arg === undefined) {
                        str = "";
                    } else if (!arg.toString || arg.toString() === "[object Object]") {
                        str = JSON.stringify(arg, null, "  ");
                    } else if (argType === "string") {
                        str = `"${arg.toString()}"`;
                    } else {
                        str = arg.toString();
                    }
                    return str;
                }).join(", ");
                // args provided?
                if (args.length) {
                    // appending the reset hex is imperative here given we've overriden color outputs
                    args = [
                        _colorDict[color] + 
                        method.label + 
                        ` ${method.delimiter} ` + 
                        `${bodyColorSanitized ? _colorDict[bodyColorSanitized] : _colorDict.reset}` + 
                        logToWrite
                    ].concat(" ", _colorDict.reset);
                }
                persistentReference.apply(null, args); // extend and invoke with formatted args
            };
        }, this);
    }
}

module.exports = Logger

/* Example Config */
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
//         bodyColor: "FgYellow"
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



