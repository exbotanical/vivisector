import ObservableString from '../lib/core/String.observable';

const stringMock = 'hello, world ';

const invalidTypesPool = [{}, 1, () => {}, [''], undefined, null];

/* Assertions */
describe('evaluation of ObservableString datatype', () => {

  describe('evaluation of extended String prototype methods', () => {
    
    it(`should create a String, ${stringMock}`, () => {
      const user = new ObservableString(stringMock);
      expect(user).toEqual({ '0': stringMock });
       
    });

    it('should only accept String values', () => {
       // iterate through invalid types
       invalidTypesPool.forEach(value => {
        expect(new ObservableString(value).value).toBeUndefined();
      });
       
    });

    it('should expose String prototype methods in the context of the internal value', () => {
      const user = new ObservableString();
      expect(Object.getOwnPropertyNames(user).includes('toUpperCase')).toBe(true);
      expect(Object.getOwnPropertyNames(user).includes('match')).toBe(true);
    });

    it('`length` getter and setter should be operable and the contrary, respectively', () => {
      const user = new ObservableString(stringMock);

       // ensure length setter does not work; this line should be of negligible consequence
       user.length = 9;
       expect(user.length).toBe(13);
    });

    it('`split` should split the internal String primitive contingent on the provided delimiter and return the resulting Array', () => {
      const user = new ObservableString(stringMock);
      expect(user.split('')).toEqual(stringMock.split(''));
    });

    it('String methods should act upon the internal primitive String value and not the ObservableString itself', () => {
      const user = new ObservableString(stringMock);

      const strProtoMethods = ['toUpperCase', 'toLowerCase', 'trim', 'fixed' ];
      const strProtoMethodsArgs = ['charAt', 'charCodeAt', 'slice', 'startsWith', 'includes'];

      // iterate through callable String prototype methods
      strProtoMethods.forEach(method => {
        expect(user[method]()).toEqual(stringMock[method]());
      });

      // iterate through callable String prototype methods which require arguments
      strProtoMethodsArgs.forEach(method => {
        expect(user[method](0)).toEqual(stringMock[method](0));
      });
    }); 

    it('ObservableString method `reassign` should be persistent and return `this`', () => {
      const user = new ObservableString(stringMock);
      const testString = 'test string';

      // returns `this`
      expect(user.reassign(testString)).toEqual({ '0': testString });
      // persists value
      expect(user.value).toEqual(testString);

    });

  });
      
  describe('evaluation of ObservableString event methods', () => {
    it('should register and fire handlers on `mutated` events', () => {
      const mock = jest.fn();

      const user = new ObservableString(stringMock);

      user.value = 'a new string';

      expect(mock).toHaveBeenCalledTimes(0);

      user.addEventListener('mutated', mock);

      // using `reassign`
      user.reassign('another string');

      expect(mock).toHaveBeenCalledTimes(1);

      // using `value` accessor
      user.value = 'yet another string';

      expect(mock).toHaveBeenCalledTimes(2);
    });

    it('should successfully unregister named event handlers', () => {
      const mock = jest.fn();

      const user = new ObservableString(stringMock)
        .addEventListener('mutated', mock);

      expect(mock).toHaveBeenCalledTimes(0);

      // trigger event handler via `value` prop/accessor
      user.value = 'new value';
      expect(mock).toHaveBeenCalledTimes(1);

      // this should not affect anything
      user.removeEventListener('mutated', () => {});
      user.value = 'another value';

      expect(mock).toHaveBeenCalledTimes(2);

      // this should remove the afore-registered `mutated` handler
      user.removeEventListener('mutated', mock);
      user.value = '';

      expect(mock).toHaveBeenCalledTimes(2);
      
    });

    it('event methods should be chainable; `this` should be returned', () => {
      const mock = jest.fn();

      // will throw err if misconfigured
      const user = new ObservableString(stringMock).reassign('test string').addEventListener('mutated', mock);
      user.reassign(stringMock);

      expect(mock).toHaveBeenCalledTimes(1);

      expect(user.value).toEqual(stringMock);

      // `addEventListener` should return `this`
      expect(user.addEventListener('mutated', () => {})).toEqual({ '0':  stringMock });
    });
  });

  describe('evaluation of expected ObservableString exceptions and type-checking', () => {

    it('should throw an Error when an attempting to call `reassign` with a non-String value', () => {
      const user = new ObservableString(stringMock);
      // iterate through invalid types
      invalidTypesPool.forEach(value => {
        expect(() => user.reassign(value)).toThrow('Error: Invalid type');
      });
    });

    it('should throw an Error when an attempting to register an invalid event name', () => {
      const user = new ObservableString(stringMock);
      expect(() => user.addEventListener('invalidevent', () => {})).toThrow('Error: Invalid event name.');
    });

    it('should throw an Error when an attempting to register an invalid handler', () => {
      const user = new ObservableString(stringMock);
      expect(() => user.addEventListener('mutated', 'string').toThrow('Error: Invalid handler.'));
    });

    it('should throw an Error when an attempting to unregister an invalid event name', () => {
      const user = new ObservableString(stringMock);
      expect(() => user.removeEventListener('invalidevent', () => {})).toThrow('Error: Invalid event name.');
    });

    it('should throw an Error when an attempting to unregister an invalid handler', () => {
      const user = new ObservableString(stringMock).addEventListener('mutated', () => {});
      expect(() => user.removeEventListener('mutated', null).toThrow('Error: Invalid handler.'));
    });
      
    it('should only persist values of type String when using the `value` accessor', () => {
      const mock = jest.fn();

      const typesPool = ['', {}, 1, mock, [''], undefined, null];

      // called count will only be updated if mutation is persistent; ergo, this is our control variable
      const user = new ObservableString(stringMock).addEventListener('mutated', mock);
      expect(mock).toHaveBeenCalledTimes(0);

      // apply all - the handler should only fire once given there is only 1 String in the `typesPool`
      typesPool.forEach(value => user.value = value);
      expect(mock).toHaveBeenCalledTimes(1);
    });
  });
});
