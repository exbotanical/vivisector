import { vivisect } from '../src';

import type { TestArray, TestObject } from './types';

describe('evaluation of vivisected object integrity', () => {
	it('maintains object state as expected', () => {
		const baseState = {
			a: 1,
			b: 2,
			c: 3
		} as TestObject;

		const observable = vivisect<typeof baseState>(baseState)
			.subscribe('add', () => {}, { alwaysCommit: true })
			.subscribe('set', () => {}, { alwaysCommit: true })
			.subscribe('del', () => {}, { alwaysCommit: true })
			.subscribe('batched', () => {}, { alwaysCommit: true });

		expect(observable).toEqual(baseState);

		Object.assign(baseState, { q: 99 });
		Object.assign(observable, { q: 99 });

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

		expect(observable).toHaveProperty('subscribe');
	});

	it('maintains array state as expected', () => {
		const baseState = [1, 2, 3];
		const observable = vivisect<TestArray>(baseState)
			.subscribe('add', () => {}, { alwaysCommit: true })
			.subscribe('set', () => {}, { alwaysCommit: true })
			.subscribe('del', () => {}, { alwaysCommit: true })
			.subscribe('batched', () => {}, { alwaysCommit: true });

		expect(baseState).toEqual(observable);

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

		expect(observable).toHaveProperty('subscribe');
	});

	it('maintains array state and return values as expected', () => {
		const baseState: number[] = [];
		// push
		const observable = vivisect<TestArray>(baseState)
			.subscribe('add', () => {}, { alwaysCommit: true })
			.subscribe('set', () => {}, { alwaysCommit: true })
			.subscribe('del', () => {}, { alwaysCommit: true })
			.subscribe('batched', () => {}, { alwaysCommit: true });

		expect(observable).toEqual(baseState);

		expect(observable.push(1, 2, 3)).toBe(baseState.push(1, 2, 3));
		expect(observable).toEqual(baseState);

		// push no args
		expect(observable.push()).toBe(baseState.push());
		expect(observable).toEqual(baseState);

		// pop
		expect(observable.pop()).toBe(baseState.pop());
		expect(observable).toEqual(baseState);

		// pop w/ unexpected args

		// we need to ignore these errs because we're manually intercepting these methods
		// and edge cases must be tested
		// @ts-ignore
		expect(observable.pop(1, 2, 3)).toBe(baseState.pop(1, 2, 3));
		expect(observable).toEqual(baseState);

		// splice
		expect(observable.splice(0, 1, 1)).toEqual(baseState.splice(0, 1, 1));
		expect(observable).toEqual(baseState);

		// @ts-ignore
		expect(observable.splice()).toEqual(baseState.splice());
		expect(observable).toEqual(baseState);

		expect(observable.splice(0)).toEqual(baseState.splice(0));
		expect(observable).toEqual(baseState);

		// unshift
		expect(observable.unshift(1, 2, 3)).toBe(baseState.unshift(1, 2, 3));
		expect(observable).toEqual(baseState);

		// unshift no args
		expect(observable.unshift()).toBe(baseState.unshift());
		expect(observable).toEqual(baseState);

		// reverse
		expect(observable.reverse()).toEqual(baseState.reverse());
		expect(observable).toEqual(baseState);

		// reverse w/ unexpected args
		// @ts-ignore
		expect(observable.reverse(1, 2, 3)).toEqual(baseState.reverse(1, 2, 3));
		expect(observable).toEqual(baseState);

		// sort
		// @ts-ignore
		expect(observable.sort((a, b) => b - a)).toEqual(
			baseState.sort((a, b) => b - a)
		);
		expect(observable).toEqual(baseState);

		// sort w/ no args
		expect(observable.sort()).toEqual(baseState.sort());
		expect(observable).toEqual(baseState);

		// shift w/ unexpected args
		// @ts-ignore
		expect(observable.shift(1, 2, 3)).toBe(baseState.shift(1, 2, 3));
		expect(observable).toEqual(baseState);

		// shift
		expect(observable.shift()).toBe(baseState.shift());
		expect(observable).toEqual(baseState);
	});
});
