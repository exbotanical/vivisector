import ObservableArray from '../lib/core/Array.observable';

const itemsMock = [
  'Alice',
  'Bob'
];

const nestedItemsMock = ['hello',['hello'], 'world', ['world', 'hello'], ['world', ['world',['hello']]]];

/* Assertions */
describe('evaluation of ObservableArray datatype', () => {

  describe('evaluation of extended Array prototype methods', () => {

    it(`should create an Array of ${itemsMock.length} items`, () => {
      const users = new ObservableArray(itemsMock);
      expect(users).toEqual( { '0':  itemsMock[0], '1':  itemsMock[1] } );
      expect(users.length).toEqual(itemsMock.length);
      expect(users[0]).toEqual(itemsMock[0]);
      expect(users[1]).toEqual(itemsMock[1]);
      expect(users[2]).toBeUndefined();
    });

    it('should expose Array prototype methods in the context of the internal value', () => {
      const users = new ObservableArray();
      expect(Object.getOwnPropertyNames(users).includes('find')).toBe(true);
      expect(Object.getOwnPropertyNames(users).includes('push')).toBe(true);
    });

    it('`push` adds an item to the internal Array', () => {
      const users = new ObservableArray();
      expect(users.push(itemsMock[0])).toBe(users.length);
      expect(users).toEqual( { '0':  itemsMock[0] });
      expect(users.length).toEqual(1);
      expect(users[0]).toEqual(itemsMock[0]);
      expect(users[1]).toBeUndefined();
    });

    it('`pop` removes and returns the last item from the internal Array', () => {
      const users = new ObservableArray( [ itemsMock[0] ] );
      expect(users.pop()).toBe( 'Alice' );
      expect(users.length).toBe(0);
      expect(users[0]).toBeUndefined();
    });

    it('`unshift` adds given items to beginning of Array and returns the length thereof', () => {
      const users = new ObservableArray(itemsMock);
      expect(users.length).toBe(2);
      expect(users.unshift('Tawanna')).toEqual(3);
      // ensure persistence
      expect(users[0]).toEqual('Tawanna');
    });

    it('`shift` removes the first element from Array and returns it', () => {
      const users = new ObservableArray(itemsMock);
      expect(users.length).toBe(2);
      expect(users.shift()).toEqual('Alice');
      // ensure persistence
      expect(users[0]).toEqual(itemsMock[1]);
    });

    it('`splice` coerces null index to 0', () => {
      const users = new ObservableArray(itemsMock);
      expect(users.splice(null,1)).toEqual([itemsMock[0]]);
    });

    it('`splice` accepts negative index accessors', () => {
      const users = new ObservableArray(itemsMock);
      expect(users.splice(-1,1)).toEqual([itemsMock[1]]);
    });

    it('the `length` accessor setter acts upon the internal Array', () => {
      const users = new ObservableArray(itemsMock);
      users.length = 3;
      expect(users.length).toBe(3);
      expect(users).toEqual({ '0':  'Alice', '1':  'Bob', '2': undefined });
      users.length = 1;
      expect(users[1]).toBeUndefined();
    });
  });

  describe('evaluation of custom ObservableArray prototype methods', () => {

    it('`findIndexAll` should return all indices matching a given value', () => {
      const users = new ObservableArray(itemsMock);
      const matchedIndices = users.findIndexAll('Alice');
      expect(matchedIndices).toEqual([0]);
    });

    it('`findIndexAllDeep` should return all indices - no matter how nested - matching a given value', () => {
      const users = new ObservableArray(nestedItemsMock);
      const matchedIndices = users.findIndexAllDeep('hello');
      expect(matchedIndices).toEqual([ [ 0 ], [ 1, 0 ], [ 3, 1 ], [ 4, 1, 1, 0 ] ]);
    });

  });

  describe('evaluation of ObservableArray event methods', () => {

    it('should register and fire handlers on `itemset` events', () => {
      const mock = jest.fn();

      const users = new ObservableArray(itemsMock);

      expect(mock).toHaveBeenCalledTimes(0);

      users.addEventListener('itemset', mock);

      users[0] = 'new item';

      expect(mock).toHaveBeenCalledTimes(1);
      // unshift will fire 'itemset' for each index changed i.e. the length of the Array
      expect(users.unshift('Alexei')).toBe(itemsMock.length + 1);
      // num fired is num of items in Arr minus 1; sans minus 1 given `mock` will be set to 1 at this point
      expect(mock).toHaveBeenCalledTimes(users.length);
    });

    it('should register and fire handlers on `itemadded` events', () => {
      const mock = jest.fn();

      const users = new ObservableArray(itemsMock);

      users.addEventListener('itemadded', mock);

      users.push('Talbot');

      expect(mock).toHaveBeenCalledTimes(1);

      users.unshift('Amelia');

      expect(mock).toHaveBeenCalledTimes(2);
      // trigger event handler w/`splice`
      users.splice(1, 0, 'Yukio');

      expect(mock).toHaveBeenCalledTimes(3);
    });

    it('should register and fire handlers on `itemremoved` events', () => {
      const mock = jest.fn();
      const users = new ObservableArray(itemsMock);

      // ensure arr of len <= 0 does not fire
      const usersTwo = new ObservableArray().addEventListener('itemremoved', mock);

      expect(usersTwo.shift()).toBeUndefined();
      expect(usersTwo.pop()).toBeUndefined();

      expect(mock).toHaveBeenCalledTimes(0);

      // register event handler
      users.addEventListener('itemremoved', mock);

      // trigger event handler w/`pop` + microtest
      expect(users.pop()).toBe( 'Bob' );

      expect(mock).toHaveBeenCalledTimes(1);

      // trigger event handler w/`splice` + microtest
      expect(users.splice(0, 1, 'Yukio')).toEqual(['Alice']);

      expect(mock).toHaveBeenCalledTimes(2);

      // trigger event handler w/`shift`
      users.shift();
      expect(mock).toHaveBeenCalledTimes(3);
    });

    it('should register and fire handlers on `mutated` events', () => {
      const mock = jest.fn();
      const users = new ObservableArray(itemsMock);

      expect(mock).toHaveBeenCalledTimes(0);

      // register event handler
      users.addEventListener('mutated', mock);

      // trigger event handler via `value` prop/accessor
      users.value = ['new', 'items'];

      expect(mock).toHaveBeenCalledTimes(1);
    });

    it('should successfully unregister named event handlers', () => {
      const mock = jest.fn();
      const mock2 = jest.fn();

      const users = new ObservableArray(itemsMock)
        .addEventListener('mutated', mock);

      expect(mock).toHaveBeenCalledTimes(0);
        
      // trigger event handler via `value` prop/accessor
      users.value = ['new', 'items'];

      expect(mock).toHaveBeenCalledTimes(1);

      // this should not affect anything
      users.removeEventListener('mutated', mock2);
      users.value = ['more', 'new', 'items'];

      expect(mock).toHaveBeenCalledTimes(1);

      // this should remove the afore-registered `mutated` handler
      users.removeEventListener('mutated', mock);
      users.value = [''];

      expect(mock).toHaveBeenCalledTimes(1);
      
    });

    it('event methods should be chainable; `this` should be returned', () => {
      const mock = jest.fn();
      // will throw err if misconfigured
      const users = new ObservableArray(itemsMock)
        .addEventListener('itemadded',  mock)
        .addEventListener('itemremoved',  mock)
        .addEventListener('mutated',  mock)
        .removeEventListener('mutated',  mock);
      
      // `addEventListener` should return `this`
      expect(users.addEventListener('itemset', mock)).toEqual({ '0':  'Alice', '1':  'Bob' });
      // `removeEventListener` should return `this`
      expect(users.removeEventListener('itemset', mock)).toEqual({ '0':  'Alice', '1':  'Bob' });
    });
  });

  describe('evaluation of expected ObservableArray exceptions and type-checking', () => {

    it('should throw an Error when an attempting to register an invalid event name', () => {
      const mock = jest.fn();

      const users = new ObservableArray(itemsMock);
      expect(() => users.addEventListener('invalidevent',  mock)).toThrow('Error: Invalid event name.');
    });

    it('should throw an Error when an attempting to register an invalid handler', () => {
      const mock = jest.fn();

      const users = new ObservableArray(itemsMock);
      expect(() => users.addEventListener('itemadded', 'string').toThrow('Error: Invalid handler.'));
    });

    it('should throw an Error when an attempting to unregister an invalid event name', () => {
      const mock = jest.fn();

      const users = new ObservableArray(itemsMock);
      expect(() => users.removeEventListener('invalidevent', mock)).toThrow('Error: Invalid event name.');
    });

    it('should throw an Error when an attempting to unregister an invalid handler', () => {
      const mock = jest.fn();

      const users = new ObservableArray(itemsMock).addEventListener('itemadded', mock);
      expect(() => users.removeEventListener('itemadded', null).toThrow('Error: Invalid handler.'));
    });

    it('should only persist values of type Array when using the `value` accessor', () => {
      const mock = jest.fn();

      const typesPool = ['', {}, 1, 99, [''], undefined, null];

      // cb count will only be updated if mutation is persistent; ergo, this is our control variable
      const users = new ObservableArray(itemsMock).addEventListener('mutated', mock);

      expect(mock).toHaveBeenCalledTimes(0);

      // apply all - the handler should only fire once given there is only 1 Array in the `typesPool`
      typesPool.forEach(value => users.value = value);
      expect(users.value).toEqual(['']);

      expect(mock).toHaveBeenCalledTimes(1);
    });

    it('the `length` accessor setter should throw an Error when provided non-whole numbers', () => {
      const users = new ObservableArray(itemsMock);
      expect(() => users.length = 1.5).toThrow('Error: Invalid array length.');
    });
  });
});
