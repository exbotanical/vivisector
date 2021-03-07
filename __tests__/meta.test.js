const { defineAddEventListener, defineRemoveEventListener, debounce, computeNamedFunction } = require('../src/utils/ubiquitous-props.js');
const Vx = require('../src/index.js');

// bypass Jest-specific behaviors incurred by way of higher-order functions
/* Mocks */

const mockObject = {
  0: 'item'
};
const mockHandler = () => 'fired';

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
      expect(() => mockObject.addEventListener('mockevent', 'mockHandler')).toThrow('Error: Invalid handler.');
      expect(() => mockObject.removeEventListener('mockevent', 'mockHandler')).toThrow('Error: Invalid handler.');

    });

    it('debounced handlers should properly incur delay', () => {
      let callbackFiredCount = 0;
      const mockEventHandler = () => callbackFiredCount++;
      const arr = Vx('Array', itemsMock).addEventListener('itemadded', mockEventHandler, 2000);
      arr.push(1);
      expect(callbackFiredCount).toBe(0);
      setTimeout(() => {
        expect(callbackFiredCount).toBe(1);
      }, 2000);
    });

    it('a debounced handler should retain its user-provided name as a computed property', () => {
      let callbackFiredCount = 0;
      const mockEventHandler = () => callbackFiredCount++;
      const arr = Vx('Array', itemsMock)
        .addEventListener('itemadded', mockEventHandler, 2000)
        .removeEventListener('itemadded', mockEventHandler);

      arr.push(1);
      expect(callbackFiredCount).toBe(0);
      setTimeout(() => {
        expect(callbackFiredCount).toBe(0);
      }, 2000);
    });
  });

  describe('evaluation of internal method `debounce`', () => {

    it('should adhere to given timeout', () => {
      let callbackFiredCount = 0;
      const mockEventHandler = () => callbackFiredCount++;
      expect(callbackFiredCount).toBe(0);
      debounce(mockEventHandler, 2000);
      setTimeout(() => {
        expect(callbackFiredCount).toBe(1);
      }, 2000);
      expect(callbackFiredCount).toBe(0);

    });

    it('programmatically cancels in-progress calls until the timeout has been reached', () => {
      jest.useFakeTimers();
      const spy = jest.fn();
      const doWork = debounce(spy, 100);
      doWork(); // increment call count
      doWork(); // negligible consequence; 100ms has yet to elapse
      jest.advanceTimersByTime(101);
      doWork(); // increment call count once more
      jest.advanceTimersByTime(101);  // advance timers once more
      expect(spy).toHaveBeenCalledTimes(2); 
    });

  });

  describe('evaluation of internal method `computeNamedFunction`', () => {

    it('should dynamically assign a given name to a given function', () => {
      let callbackFiredCount = 0;
      const dynamicName = '_func';
      const func = () => callbackFiredCount++;
      computeNamedFunction(func,dynamicName);
      expect(func.name).toBe(dynamicName);

    });
  });
   

});
