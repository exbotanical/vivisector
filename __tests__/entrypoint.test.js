const Vx = require('../src/index.js');
// should not have identifier, should not have type - these props are enumerably added in module entrypoint

/* Mocks */

const stringMock = 'hello, world ';

const itemsMock = [
  'Alice',
  'Bob'
];

const objItemsMock = {
  1: 'Alice',
  0: 'Bob'
};

const mockInternals = ['type', 'identifier', 'addEventListener', 'removeEventListener'];

/* Assertions */
describe('evaluation of Vivisector entrypoint', () => {

  describe('evaluation of variable instantiation', () => {

    it('should instantiate an Observable of type `Array`', () => {
        const users = Vx('Array', itemsMock);
        expect(users).toEqual( { '0':  itemsMock[0], '1':  itemsMock[1] } );
        expect(users.length).toEqual(itemsMock.length);
        expect(users[0]).toEqual(itemsMock[0]);
        expect(users[1]).toEqual(itemsMock[1]);
        expect(users[2]).toBeUndefined();
    });

    it('should instantiate an Observable of type `String`', () => {
      const user = Vx('String', stringMock);
      expect(user).toEqual({ '0': stringMock });
    });

    it('should instantiate an Observable of type `Object`', () => {
      const users = Vx('Object', objItemsMock);
      expect(users).toEqual( { '0':  objItemsMock[0], '1':  objItemsMock[1] } );
      expect(users[0]).toEqual(objItemsMock[0]);
      expect(users[1]).toEqual(objItemsMock[1]);
      expect(users[2]).toBeUndefined();
    });

  });

  describe('evaluation of custom accessors', () => {

    it('`value`, `type`, and `identifier` props are extant on Observable of type `Array`', () => {
      const users = Vx('Array', itemsMock);
      expect(users.value).toEqual(itemsMock);

      // eval noop assertion: non-configurable props should have negligible consequence 
      mockInternals.forEach(i => {
        expect(() => users[i] = '').toThrow(`Cannot assign to read only property '${i}' of object '#<ObservableArray>'`);
      });
      expect(users.type).toEqual('Array');
      expect(users.identifier).toBe(3);
      
    });

    it('`value`, `type`, and `identifier` props are extant on Observable of type `String`', () => {
      const user = Vx('String', stringMock);
      expect(user.value).toEqual(stringMock);

      // eval noop assertion: non-configurable props should have negligible consequence 
      mockInternals.forEach(i => {
        expect(() => user[i] = '').toThrow(`Cannot assign to read only property '${i}' of object '#<ObservableString>'`);
      });
      expect(user.type).toEqual('String');
      expect(user.identifier).toBe(4);
    });

    it('`type`, and `identifier` props are extant on Observable of type `Object`', () => {
      const user = Vx('Object', itemsMock);

      // eval noop assertion: non-configurable props should have negligible consequence 
      mockInternals.forEach(i => {
        expect(() => user[i] = '').toThrow(`Error: Property '${i}' is non-configurable.`);
      });
      // expect(() => user.identifier = 1).toThrow('Error: Property 'identifier' is non-configurable.');
      expect(user.type).toEqual('Object');
      expect(user.identifier).toBe(5);
    });

    it('should register eligible `identifier`', () => {
      const validOptions = { id: 9 };
      const user = Vx('String', stringMock, validOptions);
      expect(user.identifier).toBe(9);
    });

    it('non-enumerable props on Observable of type `Object` should not trigger traps/events', () => {
      let callbackFiredCount = 0;
      const mockCounter = () => callbackFiredCount++;
      const obj = Vx('Object', objItemsMock)
        .addEventListener('itemget', mockCounter)
        .addEventListener('itemset', mockCounter)
        .addEventListener('itemdeleted', mockCounter);
      // test assertion: second `addEventListener` should not fire `itemget`
      expect(callbackFiredCount).toEqual(0);
      
      expect(obj.identifier).toBe(7);
      expect(obj.type).toBe('Object');

      // test assertion: `removeEventListener` should not fire `itemget`
      obj.removeEventListener('itemset', mockCounter);
      expect(callbackFiredCount).toEqual(0);

      // eval noop assertion: non-configurable props should have negligible consequence 
      mockInternals.forEach(i => {
        expect(() => delete obj[i]).toThrow(`Error: Property '${i}' is non-configurable.`);
      });
      expect(obj.identifier).toBe(7);
    });
  });

  describe('evaluation of expected entrypoint exceptions and type-checking', () => {

    it('should throw an Error if provided an ineligible datatype', () => {
      const invalidType = 'List';
      expect(() => Vx(invalidType, itemsMock)).toThrow(`Error: datatype ${invalidType} is not a supported option.`);
    });

    it('should throw an Error if provided an ineligible identifier', () => {
      const invalidOptions = { id: 1 };
      expect( () => Vx( 'String', stringMock, invalidOptions) ).toThrow(`Error: Identifier ${invalidOptions.id} is currently in use.`);
    });
  });

});
