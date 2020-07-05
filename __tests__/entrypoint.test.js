const Vx = require("../src/index.js");
// should not have identifier, should not have type - these props are enumerably added in module entrypoint

/* Mocks */

const stringMock = "hello, world ";

const itemsMock = [
    "Alice",
    "Bob"
];

/* Assertions */
describe("evaluation of Vivisector entrypoint", () => {

    describe("evaluation of variable instantiation", () => {

        it("should instantiate an Observable of type `Array`", () => {
                const users = Vx("Array", itemsMock);
                expect(users).toEqual( { "0":  itemsMock[0], "1":  itemsMock[1] } );
                expect(users.length).toEqual(itemsMock.length);
                expect(users[0]).toEqual(itemsMock[0]);
                expect(users[1]).toEqual(itemsMock[1]);
                expect(users[2]).toBeUndefined();
        });

        it("should instantiate an Observable of type `String`", () => {
            const user = Vx("String", stringMock);
            expect(user).toEqual({ "0": stringMock });
        });

    });

    describe("evaluation of custom accessors", () => {

        it("`value`, `type`, and `identifier` props are extant on Observable of type `Array`", () => {
            const users = Vx("Array", itemsMock);
            expect(users.value).toEqual(itemsMock);
            expect(users.type).toEqual("Array");
            expect(users.identifier).toBe(2);
            
        });

        it("`value`, `type`, and `identifier` props are extant on Observable of type `Array`", () => {
            const user = Vx("String", stringMock);
            expect(user.value).toEqual(stringMock);
            expect(user.type).toEqual("String");
            expect(user.identifier).toBe(3);
        });

        it("should register eligible `identifier`", () => {
            const validOptions = { id: 9 };
            const user = Vx("String", stringMock, validOptions);
            expect(user.identifier).toBe(9);
        });
    });

    describe("evaluation of expected entrypoint exceptions and type-checking", () => {

        it("should throw an Error if provided an ineligible datatype", () => {
            const invalidType = "List";
            expect(() => Vx(invalidType, itemsMock)).toThrow(`Error: datatype ${invalidType} is not available as an Observable.`);
        });

        it("should throw an Error if provided an ineligible identifier", () => {
            const invalidOptions = { id: 1 };
            expect( () => Vx( "String", stringMock, invalidOptions) ).toThrow(`Error: Identifier ${invalidOptions.id} is currently in use.`);
        });
    });

});