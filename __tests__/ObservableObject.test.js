const ObservableObject = require("../src/datatypes/ObservableObject.js");
// should not have identifier, should not have type - these props are enumerably added in module entrypoint

/* Mocks */

const itemsMock = {
    1: "Alice",
    0: "Bob"
};

const nestedItemsMock = {
    users : {
        1: "Alice",
        0: "Bob"
    },
    passwords: {
        1: "abc",
        0: "123"
    }
};

const handlerMock = () => "fired";
const isProxy = Symbol.for("_isProxy");
const typesPool = ["string", {}, 1, [""], undefined, null];

/* Assertions */

describe("evaluation of ObservableObject datatype", () => {

    describe("evaluation of extended Object prototype methods", () => {

        it(`should create a Proxy of the given Object `, () => {
            const users = new ObservableObject(itemsMock);
            expect(users[isProxy]).toBe(true);
            expect(users).toEqual( { "0":  itemsMock[0], "1":  itemsMock[1] } );
            expect(users.length).toEqual(itemsMock.length);
            expect(users[0]).toEqual(itemsMock[0]);
            expect(users[1]).toEqual(itemsMock[1]);
            expect(users[2]).toBeUndefined();
        });

        it("should return a new Proxy when and Object is being accessed", () => {
            const users = new ObservableObject(nestedItemsMock);
            expect(users.passwords[isProxy]).toBe(true);
        });
    });


    describe("evaluation of ObservableObject event methods", () => {

        it("should register and fire handlers on `itemset` events", () => {
            let callbackFiredCount = 0;
            const users = new ObservableObject(itemsMock);

            // establish baseline
            expect(callbackFiredCount).toEqual(0);
            const mockCounter = () => callbackFiredCount++;
            // register event handler
            users.addEventListener("itemset", mockCounter);
            // trigger event handler
            users[0] = "new item";
            expect(callbackFiredCount).toBe(1);
            
        });

        it("should register and fire handlers on `itemdeleted` events", () => {
            let callbackFiredCount = 0;
            const users = new ObservableObject(nestedItemsMock);

            expect(callbackFiredCount).toEqual(0);
            const mockCounter = () => callbackFiredCount++;
            // register event handler
            users.addEventListener("itemdeleted", () => callbackFiredCount++);
            // null, raises `itemget` and should not be counted
            expect(users.users).toEqual(nestedItemsMock.users);
            // trigger event handler - delete should return true
            expect(delete users.users[0]).toEqual(true);
            expect(callbackFiredCount).toEqual(1);

            expect(users.users[0]).toBeUndefined();
        });

        it("should register and fire handlers on `itemget` events", () => {
            let callbackFiredCount = 0;
            const users = new ObservableObject(nestedItemsMock);

            expect(callbackFiredCount).toEqual(0);

            // register event handler
            users.addEventListener("itemget", () => callbackFiredCount++);
            expect(users.users[1]).toBe("Alice");
            expect(callbackFiredCount).toEqual(1);

            // will fire twice - a current limitation/side-effect of how we're using Proxies plus behaviors
            // of Jest's `expect` call. 
            // Note, executing `toBe` would call the `get` trap again, resulting in a final count of 5
            expect(users.users).toEqual(nestedItemsMock.users);
            expect(callbackFiredCount).toEqual(5);

        });


        it("event methods should be chainable; `this` should be returned", () => {
            // will throw err if misconfigured
            const users = new ObservableObject(itemsMock)
                .addEventListener("itemset",  handlerMock)
                .addEventListener("itemdeleted",  handlerMock);
            
            // `addEventListener` should return `this`
            expect(users.addEventListener("itemset", handlerMock)).toEqual(itemsMock);
            // `removeEventListener` should return `this`
            expect(users.removeEventListener("itemset", handlerMock)).toEqual(itemsMock);
        });
    });

    describe("evaluation of expected ObservableObject exceptions and type-checking", () => {

        it("should throw an Error when an attempting to register an invalid event name", () => {
            const users = new ObservableObject(itemsMock);
            expect(() => users.addEventListener("invalidevent",  handlerMock)).toThrow("Error: Invalid event name.");
        });

        it("should throw an Error when an attempting to register an invalid handler", () => {
            const users = new ObservableObject(itemsMock);
            expect(() => users.addEventListener("itemset", "string").toThrow("Error: Invalid handler."));
        });

        it("should throw an Error when an attempting to unregister an invalid event name", () => {
            const users = new ObservableObject(itemsMock);
            expect(() => users.removeEventListener("invalidevent", handlerMock)).toThrow("Error: Invalid event name.");
        });

        it("should throw an Error when an attempting to unregister an invalid handler", () => {
            const users = new ObservableObject(itemsMock).addEventListener("itemset", handlerMock);
            expect(() => users.removeEventListener("itemadded", null).toThrow("Error: Invalid handler."));
        });

        it("should only accept Objects as input", () => {
            typesPool.filter(item => !(item instanceof Object)).forEach(type => {
                expect(new ObservableObject(type)).toEqual({});
            });
            
        });

    });

    describe("evaluation of custom pre-factory ObservableObject accessors", () => {

        it("the `value` accessor should be decoupled from reference", () => {
            const users = new ObservableObject(itemsMock);
            const copy = users.value;
            copy[itemsMock[0]] = "";
            expect(users.value).toEqual(itemsMock);
        });

        it("the `value` prop setter should be inactive", () => {
            const users = new ObservableObject(itemsMock);
            expect(users.value = "").toBe("");
            expect(users.value).toEqual(itemsMock);
        });

    });
});
