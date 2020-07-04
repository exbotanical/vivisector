const ObservableString = require("../src/datatypes/ObservableString.js");
// should not have identifier, should not have type - these props are enumerably added in module entrypoint

/* Mocks */

const stringMock = "hello, world ";
const handlerMock = () => "fired";
/* Assertions */
describe("evaluation of ObservableString datatype", () => {

    describe("evaluation of extended String prototype methods", () => {
        
        it(`should create a String, ${stringMock}`, () => {
            const user = new ObservableString(stringMock);
            expect(user).toEqual({ "0": stringMock });
           
        });

        it("should expose String prototype methods in the context of the internal value", () => {
            const user = new ObservableString();
            expect(Object.getOwnPropertyNames(user).includes("toUpperCase")).toBe(true);
            expect(Object.getOwnPropertyNames(user).includes("match")).toBe(true);
        });

        it("`length` getter and setter should be operable and the contrary, respectively", () => {
            const user = new ObservableString(stringMock);

             // ensure length setter does not work; this line should be of negligible consequence
             user.length = 9;
             expect(user.length).toBe(13);
        });

        it("`split` should split the internal String primitive contingent on the provided delimiter and return the resulting Array", () => {
            const user = new ObservableString(stringMock);
            expect(user.split("")).toEqual(stringMock.split(""));
        });

        it("String methods should act upon the internal primitive String value and not the ObservableString itself", () => {
            const user = new ObservableString(stringMock);

            const strProtoMethods = ["toUpperCase", "toLowerCase", "trim", "fixed" ];
            const strProtoMethodsArgs = ["charAt", "charCodeAt", "slice", "startsWith", "includes"];

            // iterate through callable String prototype methods
            strProtoMethods.forEach(method => {
                expect(user[method]()).toEqual(stringMock[method]());
            });

            // iterate through callable String prototype methods which require arguments
            strProtoMethodsArgs.forEach(method => {
                expect(user[method](0)).toEqual(stringMock[method](0));
            });
        }); 

        it("ObservableString method `reassign` should be persistent and return `this`", () => {
            const user = new ObservableString(stringMock);
            const testString = "test string";

            // returns `this`
            expect(user.reassign(testString)).toEqual({ "0": testString });
            // persists value
            expect(user.value).toEqual(testString);

        });

    });
    
    describe("evaluation of ObservableString event methods", () => {
        it("should register and fire handlers on `mutated` events", () => {
            let callbackFiredCount = 0;
            const user = new ObservableString(stringMock);

            user.value = "a new string";
            // establish baseline
            expect(callbackFiredCount).toEqual(0);

            // register event handler
            user.addEventListener("mutated", () => callbackFiredCount++);

            // using `reassign`
            user.reassign("another string");
            expect(callbackFiredCount).toEqual(1);

            // using `value` accessor
            user.value = "yet another string";
            expect(callbackFiredCount).toEqual(2);

        });

        it("should successfully unregister named event handlers", () => {
            let callbackFiredCount = 0;
            const cb = () => callbackFiredCount++;

            const user = new ObservableString(stringMock)
                .addEventListener("mutated", cb);

            // trigger event handler via `value` prop/accessor
            user.value = "new value";
            expect(callbackFiredCount).toEqual(1);

            // this should not affect anything
            user.removeEventListener("mutated", handlerMock);
            user.value = "another value";
            expect(callbackFiredCount).toEqual(2);

            // this should remove the afore-registered `mutated` handler
            user.removeEventListener("mutated", cb);
            user.value = "";
            expect(callbackFiredCount).toEqual(2);
            
        });

        it("event methods should be chainable; `this` should be returned", () => {
            let callbackFiredCount = 0;
            const cb = () => callbackFiredCount++;
            // will throw err if misconfigured
            const user = new ObservableString(stringMock).reassign("test string").addEventListener("mutated", cb);
            user.reassign(stringMock);

            expect(callbackFiredCount).toEqual(1);
            expect(user.value).toEqual(stringMock);
            // `addEventListener` should return `this`
            expect(user.addEventListener("mutated", handlerMock)).toEqual({ "0":  stringMock });
            
        });
    });

    describe("evaluation of expected ObservableString exceptions and type-checking", () => {

        it("should throw an Error when an attempting to call `reassign` with a non-String value", () => {
            const user = new ObservableString(stringMock);
            const invalidTypesPool = [{}, 1, handlerMock, [""], undefined, null];

            // iterate through invalid types
            invalidTypesPool.forEach(value => {
                expect(() => user.reassign(value)).toThrow("Invalid type");
            });
        });
            
        it("should only persist values of type String when using the `value` accessor", () => {
            let callbackFiredCount = 0;
            const cb = () => callbackFiredCount++;
            const typesPool = ["", {}, 1, callbackFiredCount, [""], undefined, null];

            // cb count will only be updated if mutation is persistent; ergo, this is our control variable
            const user = new ObservableString(stringMock).addEventListener("mutated", cb);
            expect(callbackFiredCount).toEqual(0);

            // apply all - the handler should only fire once given there is only 1 String in the `typesPool`
            typesPool.forEach(value => user.value = value);
            expect(callbackFiredCount).toEqual(1);

        });
        
    });

});