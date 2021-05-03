const stringMock = 'hello, world ';

const itemsMock = [
  'Alice',
  'Bob'
];

const objItemsMock = {
  1: 'Alice',
  0: 'Bob'
};

const mockInternals = ['addEventListener', 'removeEventListener'];

/* Assertions */
describe('evaluation of Vivisector entrypoint', () => {

  describe('evaluation of variable instantiation', () => {

    it('should instantiate an Observable of type `Array`', () => {
        const users = vivisect(itemsMock);
        expect(users).toEqual( { '0':  itemsMock[0], '1':  itemsMock[1] } );
        expect(users.length).toEqual(itemsMock.length);
        expect(users[0]).toEqual(itemsMock[0]);
        expect(users[1]).toEqual(itemsMock[1]);
        expect(users[2]).toBeUndefined();
    });

    it('should instantiate an Observable of type `String`', () => {
      const user = vivisect(stringMock);
      expect(user).toEqual({ '0': stringMock });
    });

    it('should instantiate an Observable of type `Object`', () => {
      const users = vivisect(objItemsMock);
      expect(users).toEqual( { '0':  objItemsMock[0], '1':  objItemsMock[1] } );
      expect(users[0]).toEqual(objItemsMock[0]);
      expect(users[1]).toEqual(objItemsMock[1]);
      expect(users[2]).toBeUndefined();
    });

  });

  describe('evaluation of custom accessors', () => {

    it('`value` props is extant on Observable of type `Array`', () => {
      const users = vivisect(itemsMock);
      expect(users.value).toEqual(itemsMock);

      // eval noop assertion: non-configurable props should have negligible consequence 
      mockInternals.forEach(i => {
        expect(() => users[i] = '').toThrow();
      });
      
    });

    it('`value` props is extant on Observable of type `String`', () => {
      const user = vivisect(stringMock);
      expect(user.value).toEqual(stringMock);

      // eval noop assertion: non-configurable props should have negligible consequence 
      mockInternals.forEach(i => {
        expect(() => user[i] = '').toThrow();
      });
    });

    it('non-enumerable props on Observable of type `Object` should not trigger traps/events', () => {
      const mock = jest.fn();

      const obj = vivisect(objItemsMock)
        .addEventListener('itemget', mock)
        .addEventListener('itemset', mock)
        .addEventListener('itemdeleted', mock);
        
      expect(mock).toHaveBeenCalledTimes(0);

      obj.removeEventListener('itemset', mock);

      expect(mock).toHaveBeenCalledTimes(0);

      // eval noop assertion: non-configurable props should have negligible consequence 
      mockInternals.forEach(i => {
        expect(() => delete obj[i]).toThrow();
      });
    });
  });

  describe('evaluation of expected entrypoint exceptions and type-checking', () => {

    it('should throw an Error if provided an ineligible datatype', () => {
      const invalidType = 99;
      expect(() => vivisect(invalidType)).toThrow();
    });
  });
});
