import { 
  defineAddEventListener, 
  defineRemoveEventListener, 
  debounce, 
  computeNamedFunction 
} from '../lib/utils.js';

const mockObject = {
  0: 'item'
};

const mockHandler = jest.fn();

const mockHandlers = {
  mockevent: [
    mockHandler,
    'mockHandler'
  ]
};

const itemsMock = [
  'Alice',
  'Bob'
];

/* Assertions */

describe('enforce coverage on higher-order functions', () => {

  describe('evaluation of event handler registry system', () => {

    it('should throw an exception when provided an invalid handler', () => {

      defineAddEventListener(mockObject, mockHandlers);
      defineRemoveEventListener(mockObject, mockHandlers);

      expect(() => mockObject.addEventListener('mockevent', 'mockHandler')).toThrow();
      expect(() => mockObject.removeEventListener('mockevent', 'mockHandler')).toThrow();

    });

    it('debounced handlers should properly incur delay', () => {
      const mock = jest.fn();

      const arr = vivisect(itemsMock).addEventListener('itemadded', mock, 2000);

      arr.push(1);

      expect(mock).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(2000);

      expect(mock).toHaveBeenCalledTimes(1);
    });

    it('a debounced handler should retain its user-provided name as a computed property', () => {
      const mock = jest.fn();

      const arr = vivisect(itemsMock)
        .addEventListener('itemadded', mock, 2000)
        .removeEventListener('itemadded', mock);

      arr.push(1);

      expect(mock).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(2000);

      expect(mock).toHaveBeenCalledTimes(0);
    });
  });

  describe('evaluation of internal method `debounce`', () => {

    it('should adhere to given timeout', () => {
      const mock = jest.fn();
      
      const fn = debounce(mock, 2000);
      
      fn();
      
      expect(mock).toHaveBeenCalledTimes(0);

      jest.advanceTimersByTime(2000);

      expect(mock).toHaveBeenCalledTimes(1);
    });

    it('programmatically cancels in-progress calls until the timeout has been reached', () => {
      const mock = jest.fn();

      const doWork = debounce(mock, 100);

      doWork(); // increment call count
      doWork(); // negligible consequence; 100ms has yet to elapse

      jest.advanceTimersByTime(101);

      doWork(); // increment call count once more

      jest.advanceTimersByTime(101);  // advance timers once more

      expect(mock).toHaveBeenCalledTimes(2); 
    });

  });

  describe('evaluation of internal method `computeNamedFunction`', () => {

    it('should dynamically assign a given name to a given function', () => {
      const mock = () => {};

      const dynamicName = '_func';
      
      computeNamedFunction(mock, dynamicName);
      expect(mock.name).toBe(dynamicName);
    });
  });
});
