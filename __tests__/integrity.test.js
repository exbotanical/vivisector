describe('evaluation of vivisected object integrity', () => {
  it('maintains object state as expected', () => {
    let baseState = {
      a: 1,
      b: 2,
      c: 3
    };

    let observable = vivisect(baseState);

    expect(observable).toEqual(baseState);

    baseState.q = 99;
    observable.q = 99;

    expect(observable).toEqual(baseState);

    Object.assign(baseState, { a: 84, b: 'g', w: { a: 1 } });
    Object.assign(observable, { a: 84, b: 'g', w: { a: 1 } });

    expect(observable).toEqual(baseState);

    baseState.w.a = 78;
    observable.w.a = 78;

    expect(observable).toEqual(baseState);
    expect(observable.w.a).toEqual(78);

    delete baseState.q;
    delete observable.q;

    expect(observable).toEqual(baseState);

    baseState.w.r = [];
    observable.w.r = [];

    baseState.w.r.push(1, 2, 3);
    observable.w.r.push(1, 2, 3);

    expect(observable).toEqual(baseState);

    expect(observable.w.r).toEqual(baseState.w.r);

    expect(observable).toHaveProperty('addEventListener');
  });

  it('maintains array state as expected', () => {
    let baseState = [1, 2, 3];
    let observable = vivisect(baseState);

    expect(baseState).toEqual(observable);``

    baseState.splice(0, 1);
    observable.splice(0, 1);

    expect(observable).toEqual(baseState);

    baseState.push(11);
    observable.push(11);

    expect(observable).toEqual(baseState);

    expect(baseState.pop()).toBe(observable.pop());

    expect(observable).toEqual(baseState);

    baseState.shift();
    observable.shift();

    expect(observable).toEqual(baseState);

    expect(baseState.unshift(1)).toBe(observable.unshift(1));

    expect(observable).toEqual(baseState);

    expect(observable.length).toBe(baseState.length);

    baseState.length = 0;
    observable.length = 0;

    baseState.push(9);
    observable.push(9);

    expect(observable).toEqual(baseState);
    expect(observable[0]).toEqual(baseState[0]);
    expect(observable.length).toBe(baseState.length);

    expect(observable).toHaveProperty('addEventListener');
  });
});
