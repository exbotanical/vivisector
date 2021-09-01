import { forEachKeyValue } from './util';

describe('evaluations of the base vivisector event emission', () => {
  describe('evaluations of default events', () => {
    const callbacks = {
      add: jest.fn(),
      del: jest.fn(),
      set: jest.fn()
    };

    const iterator = forEachKeyValue(callbacks);

    it('vivisected arrays should emit default `add`, `del`, `get`, and `set` events', () => {
      const arr = vivisect([1, 2, 3]);

      iterator((key, value) => {
        arr.addEventListener(key, value);
      });

      // sanity check
      iterator((key, value) => {
        expect(value).toHaveBeenCalledTimes(0);
      });

      arr.push(1);

      iterator((key, value) => {
        if (key == 'add') {
          expect(value).toHaveBeenCalledTimes(1);
        } else {
          expect(value).toHaveBeenCalledTimes(0);
        }
      });

      arr.pop();
      arr.pop();

      iterator((key, value) => {
        if (key == 'del') {
          expect(value).toHaveBeenCalledTimes(2);
        } else if (key == 'add') {
          expect(value).toHaveBeenCalledTimes(1);
        } else {
          expect(value).toHaveBeenCalledTimes(0);
        }
      });

      arr[1] = 9;
      expect(arr[2]).toBeUndefined();

      arr[2] = 99; // add, because arr[2] did not exist prior

      iterator((key, value) => {
        if (key == 'del') {
          expect(value).toHaveBeenCalledTimes(2);
        } else if (key == 'add') {
          expect(value).toHaveBeenCalledTimes(2);
        } else if (key == 'set') {
          expect(value).toHaveBeenCalledTimes(1);
        }
      });
    });

    it('vivisected objects should emit default `add`, `del`, `get`, and `set` events', () => {
      const obj = vivisect({ a: 1, b: 2, c: 3 });

      iterator((key, value) => {
        obj.addEventListener(key, value);
      });

      // sanity check
      iterator((key, value) => {
        expect(value).toHaveBeenCalledTimes(0);
      });

      Object.assign(obj, { d: 4 });

      iterator((key, value) => {
        if (key == 'add') {
          expect(value).toHaveBeenCalledTimes(1);
        } else {
          expect(value).toHaveBeenCalledTimes(0);
        }
      });

      delete obj.d;
      delete obj.c;
      delete obj.x; // no-op

      iterator((key, value) => {
        if (key == 'del') {
          expect(value).toHaveBeenCalledTimes(2);
        } else if (key == 'add') {
          expect(value).toHaveBeenCalledTimes(1);
        } else {
          expect(value).toHaveBeenCalledTimes(0);
        }
      });

      obj.b;

      iterator((key, value) => {
        if (key == 'del') {
          expect(value).toHaveBeenCalledTimes(2);
        } else if (key == 'add') {
          expect(value).toHaveBeenCalledTimes(1);
        } else if (key == 'get') {
          expect(value).toHaveBeenCalledTimes(1);
        } else {
          expect(value).toHaveBeenCalledTimes(0);
        }
      });

      obj.a = 9;
      obj.b = 99;

      iterator((key, value) => {
        if (key == 'del') {
          expect(value).toHaveBeenCalledTimes(2);
        } else if (key == 'add') {
          expect(value).toHaveBeenCalledTimes(1);
        } else if (key == 'get') {
          expect(value).toHaveBeenCalledTimes(1);
        } else {
          expect(value).toHaveBeenCalledTimes(2);
        }
      });
    });

    it('vivisected arrays should emit the (a) event name, (b) original state, (c) updated state', () => {
      const arr = vivisect([1, 2, 3 ]);

      iterator((key, value) => {
        arr.addEventListener(key, value);
      });

      // sanity check
      iterator((key, value) => {
        expect(value).toHaveBeenCalledTimes(0);
      });

      arr.push(4);

      iterator((key, value) => {
        if (key == 'add') {
          expect(value).toHaveBeenCalledWith({
            type: 'add',
            prevState: [1, 2, 3],
            nextState: [1, 2, 3, 4]
          });
        }
      });

      arr.pop();
      arr.slice(0); // no-op

      iterator((key, value) => {
        if (key == 'del') {
          expect(value).toHaveBeenCalledWith({
            type: 'del',
            prevState: [1, 2, 3, 4],
            nextState: [1, 2, 3]
          });
        }
      });

      arr[2];

      iterator((key, value) => {
        if (key == 'get') {
          expect(value).toHaveBeenCalledWith({
            type: 'get',
            prevState: [1, 2, 3],
            nextState: [1, 2, 3]
          });
        }
      });

      arr[2] = 9;

      iterator((key, value) => {
        if (key == 'add') {
          expect(value).toHaveBeenCalledWith({
            type: 'add',
            prevState: [1, 2, 3],
            nextState: [1, 2, 9]
          });
        }
      });
    });

    it('vivisected objects should emit the (a) event name, (b) original state, (c) updated state', () => {
      const obj = vivisect({ a: 1, b: 2, c: 3 });

      iterator((key, value) => {
        obj.addEventListener(key, value);
      });

      // sanity check
      iterator((key, value) => {
        expect(value).toHaveBeenCalledTimes(0);
      });

      Object.assign(obj, { d: 4 });

      iterator((key, value) => {
        if (key == 'add') {
          expect(value).toHaveBeenCalledWith({
            type: 'add',
            prevState: { a: 1, b: 2, c: 3 },
            nextState: { a: 1, b: 2, c: 3, d: 4 }
          });
        }
      });

      delete obj.d;
      delete obj.x; // no-op

      iterator((key, value) => {
        if (key == 'del') {
          expect(value).toHaveBeenCalledWith({
            type: 'del',
            prevState: { a: 1, b: 2, c: 3, d: 4 },
            nextState: { a: 1, b: 2, c: 3 }
          });
        }
      });

      obj.b;

      iterator((key, value) => {
        if (key == 'get') {
          expect(value).toHaveBeenCalledWith({
            type: 'get',
            prevState: { a: 1, b: 2, c: 3 },
            nextState: { a: 1, b: 2, c: 3 }
          });
        }
      });

      obj.a = 9;

      iterator((key, value) => {
        if (key == 'set') {
          expect(value).toHaveBeenCalledWith({
            type: 'set',
            prevState: { a: 1, b: 2, c: 3 },
            nextState: { a: 9, b: 2, c: 3 }
          });
        }
      });
    });
  });
});

describe('evaluation of event handler registration and excisement', () => {
  const callbacks = {
    add: jest.fn(),
    add2: jest.fn(),
    add3: jest.fn(),
    del: jest.fn(),
    set: jest.fn()
  };

  const iterator = forEachKeyValue(callbacks);

  it('should fire event handlers sequentially', () => {
    const observable = vivisect({ });

    observable
      .addEventListener('add', callbacks.add)
      .addEventListener('add', callbacks.add2)
      .addEventListener('add', callbacks.add3);

    Object.assign(observable, { a: 1, b: 2 });

    expect(callbacks.add).toHaveBeenCalledBefore(callbacks.add2);
    expect(callbacks.add2).toHaveBeenCalledBefore(callbacks.add3);
  });

  it('should unregister a given event handler', () => {
    const observable = vivisect({});

    observable
      .addEventListener('add', callbacks.add)
      .addEventListener('add', callbacks.add2)
      .addEventListener('add', callbacks.add3);

    observable
      .removeEventListener('add', callbacks.add);

    observable.k = 1;

    expect(callbacks.add).not.toHaveBeenCalled();
    expect(callbacks.add2).toHaveBeenCalled();
    expect(callbacks.add3).toHaveBeenCalled();
  });
});
