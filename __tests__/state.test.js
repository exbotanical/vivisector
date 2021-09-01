import { forEachKeyValue } from './util';

describe('evaluation of state management, tracking', () => {
  const callbacks = {
    add: jest.fn(),
    del: jest.fn(),
    set: jest.fn()
  };

  const iterator = forEachKeyValue(callbacks);

  it('should track array `prevState`, `nextState` as expected', () => {
    const initialState = [1, 2, 3];
    const observable = vivisect(initialState);

    iterator((key, value) => {
      observable.addEventListener(key, value);
    });

    // sanity check
    iterator((key, value) => {
      expect(value).toHaveBeenCalledTimes(0);
    });

    observable.push(9);

    expect(callbacks.add).toHaveBeenNthCalledWith(1, {
      prevState: initialState,
      nextState: [...initialState, 9],
      type: 'add'
    });

    observable.pop();

    expect(callbacks.del).toHaveBeenNthCalledWith(1, {
      prevState: [...initialState, 9],
      nextState: initialState,
      type: 'del'
    });

    observable.splice(2);

    expect(callbacks.del).toHaveBeenNthCalledWith(2, {
      prevState: initialState,
      nextState: [1, 2],
      type: 'del'
    });

    observable.splice(1);

    expect(callbacks.del).toHaveBeenNthCalledWith(3, {
      prevState: [1, 2],
      nextState: [1],
      type: 'del'
    });

    observable.push(1, 2, 3);

    expect(callbacks.add).toHaveBeenNthCalledWith(2, {
      prevState: [1],
      nextState: [1, ...initialState],
      type: 'add'
    });

    // we expect to have received an 'add' event for each element that was pushed
    expect(callbacks.add.mock.calls[2][0].prevState).toEqual([1, 1]);
    expect(callbacks.add.mock.calls[3][0].prevState).toEqual([1, 1, 2]);

    observable.shift();

    expect(callbacks.del).toHaveBeenNthCalledWith(4, {
      prevState: [1, 1, 2, 3],
      nextState: [1, 2, 3],
      type: 'del'
    });

    observable.unshift(0);

    expect(callbacks.add).toHaveBeenNthCalledWith(5, {
      prevState: initialState,
      nextState: [0, ...initialState],
      type: 'add'
    });

    observable[0] = 1;

    expect(callbacks.set).toHaveBeenNthCalledWith(1, {
      prevState: [0, ...initialState],
      nextState: [1, ...initialState],
      type: 'set'
    });

    observable.unshift(1, 2, 3);

    // again, we expect to have received an 'add' event for each element that was shifted onto the array
    expect(callbacks.add.mock.calls[5][0].prevState).toEqual([1, ...initialState]);
    expect(callbacks.add.mock.calls[6][0].prevState).toEqual([3, 1, ...initialState]);
    expect(callbacks.add.mock.calls[7][0].prevState).toEqual([2, 3, 1, ...initialState]);
    expect(callbacks.add.mock.calls[7][0].nextState).toEqual([1, 2, 3, 1, ...initialState]);

    observable.reverse('args');

    // once prior, then once for each element save for the center one
    expect(callbacks.set.mock.calls.length).toBe(observable.length);
  });

  it('should track object `prevState`, `nextState` as expected', () => {
    const initialState = { a: 1, b: 2, c: 3 };
    const observable = vivisect(initialState);

    iterator((key, value) => {
      observable.addEventListener(key, value);
    });

    // sanity check
    iterator((key, value) => {
      expect(value).toHaveBeenCalledTimes(0);
    });

    observable.a = 11;

    expect(callbacks.set).toHaveBeenNthCalledWith(1, {
      type: 'set',
      prevState: initialState,
      nextState: { a: 11, b: 2, c: 3 }
    });

    observable.k = 99;

    expect(callbacks.add).toHaveBeenNthCalledWith(1, {
      type: 'add',
      prevState: { a: 11, b: 2, c: 3 },
      nextState: { a: 11, b: 2, c: 3, k: 99 }
    });

    observable.k = {};

    expect(callbacks.set).toHaveBeenNthCalledWith(2, {
      type: 'set',
      prevState: { a: 11, b: 2, c: 3, k: 99 },
      nextState: { a: 11, b: 2, c: 3, k: {} }
    });

    observable.k.l = 77;

    // caveat - nested objects will emit their own state
    expect(callbacks.add).toHaveBeenNthCalledWith(2, {
      type: 'add',
      prevState: {},
      nextState: { l: 77 }
    });

    Object.assign(observable, { p: 110 });

    expect(callbacks.add).toHaveBeenNthCalledWith(3, {
      type: 'add',
      prevState: { a: 11, b: 2, c: 3, k: { l: 77 } },
      nextState: { a: 11, b: 2, c: 3, k: { l: 77 }, p: 110  }
    });

    delete observable.a;

    expect(callbacks.del).toHaveBeenNthCalledWith(1, {
      type: 'del',
      prevState: { a: 11, b: 2, c: 3, k: { l: 77 }, p: 110 },
      nextState: {  b: 2, c: 3, k: { l: 77 }, p: 110 }
    });

    delete observable.k.l;

    // again, caveat
    expect(callbacks.del).toHaveBeenNthCalledWith(2, {
      type: 'del',
      prevState: { l: 77 },
      nextState:  {}
    });

    observable.b = undefined;

    expect(callbacks.set).toHaveBeenNthCalledWith(3, {
      type: 'set',
      prevState: { b: 2, c: 3, k: {}, p: 110 },
      nextState: { b: undefined, c: 3, k: {}, p: 110 }
    });

    delete observable.p;

    expect(callbacks.del).toHaveBeenNthCalledWith(3, {
      type: 'del',
      prevState: { b: undefined, c: 3, k: {}, p: 110 },
      nextState: { b: undefined, c: 3, k: {} }
    });

    expect(callbacks.del.mock.calls.length).toBe(3);
    expect(callbacks.add.mock.calls.length).toBe(3);
    expect(callbacks.set.mock.calls.length).toBe(3)
  });
});
