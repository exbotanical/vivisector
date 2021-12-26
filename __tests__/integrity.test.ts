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

		expect(observable).toStrictEqual(baseState);

		Object.assign(baseState, { q: 99 });
		Object.assign(observable, { q: 99 });

		expect(observable).toStrictEqual(baseState);

		Object.assign(baseState, { a: 84, b: 'g', w: { a: 1 } });
		Object.assign(observable, { a: 84, b: 'g', w: { a: 1 } });

		expect(observable).toStrictEqual(baseState);

		baseState.w.a = 78;
		observable.w.a = 78;

		expect(observable).toStrictEqual(baseState);
		expect(observable.w.a).toBe(78);

		delete baseState.q;
		delete observable.q;

		expect(observable).toStrictEqual(baseState);
		baseState.w.r = [];
		observable.w.r = [];
		baseState.w.r.push(1, 2, 3);
		observable.w.r.push(1, 2, 3);

		expect(observable).toStrictEqual(baseState);

		expect(observable.w.r).toStrictEqual(baseState.w.r);

		expect(observable).toHaveProperty('subscribe');
	});

	it('maintains array state as expected', () => {
		const baseState = [1, 2, 3];
		const observable = vivisect<TestArray>(baseState)
			.subscribe('add', () => {}, { alwaysCommit: true })
			.subscribe('set', () => {}, { alwaysCommit: true })
			.subscribe('del', () => {}, { alwaysCommit: true })
			.subscribe('batched', () => {}, { alwaysCommit: true });

		expect(baseState).toStrictEqual(observable);

		baseState.splice(0, 1);
		observable.splice(0, 1);

		expect(observable).toStrictEqual(baseState);

		baseState.push(11);
		observable.push(11);

		expect(observable).toStrictEqual(baseState);

		expect(baseState.pop()).toBe(observable.pop());

		expect(observable).toStrictEqual(baseState);

		baseState.shift();
		observable.shift();

		expect(observable).toStrictEqual(baseState);

		expect(baseState.unshift(1)).toBe(observable.unshift(1));

		expect(observable).toStrictEqual(baseState);

		expect(observable).toHaveLength(baseState.length);

		baseState.length = 0;
		observable.length = 0;

		baseState.push(9);
		observable.push(9);

		expect(observable).toStrictEqual(baseState);
		expect(observable[0]).toStrictEqual(baseState[0]);
		expect(observable).toHaveLength(baseState.length);

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

		expect(observable).toStrictEqual(baseState);

		expect(observable.push(1, 2, 3)).toBe(baseState.push(1, 2, 3));
		expect(observable).toStrictEqual(baseState);

		// push no args
		expect(observable.push()).toBe(baseState.push());
		expect(observable).toStrictEqual(baseState);

		// pop
		expect(observable.pop()).toBe(baseState.pop());
		expect(observable).toStrictEqual(baseState);

		// pop w/ unexpected args

		// we need to ignore these errs because we're manually intercepting these methods
		// and edge cases must be tested
		// @ts-expect-error
		expect(observable.pop(1, 2, 3)).toBe(baseState.pop(1, 2, 3));
		expect(observable).toStrictEqual(baseState);

		// splice
		expect(observable.splice(0, 1, 1)).toStrictEqual(baseState.splice(0, 1, 1));
		expect(observable).toStrictEqual(baseState);

		// @ts-expect-error
		expect(observable.splice()).toStrictEqual(baseState.splice());
		expect(observable).toStrictEqual(baseState);

		expect(observable.splice(0)).toStrictEqual(baseState.splice(0));
		expect(observable).toStrictEqual(baseState);

		// unshift
		expect(observable.unshift(1, 2, 3)).toBe(baseState.unshift(1, 2, 3));
		expect(observable).toStrictEqual(baseState);

		// unshift no args
		expect(observable.unshift()).toBe(baseState.unshift());
		expect(observable).toStrictEqual(baseState);

		// reverse
		expect(observable.reverse()).toStrictEqual(baseState.reverse());
		expect(observable).toStrictEqual(baseState);

		// reverse w/ unexpected args
		// @ts-expect-error
		expect(observable.reverse(1, 2, 3)).toStrictEqual(
			// @ts-expect-error
			baseState.reverse(1, 2, 3)
		);
		expect(observable).toStrictEqual(baseState);

		// sort
		// @ts-expect-error
		expect(observable.sort((a, b) => b - a)).toStrictEqual(
			baseState.sort((a, b) => b - a)
		);
		expect(observable).toStrictEqual(baseState);

		// sort w/ no args
		expect(observable.sort()).toStrictEqual(baseState.sort()); // eslint-disable-line @typescript-eslint/require-array-sort-compare
		expect(observable).toStrictEqual(baseState);

		// shift w/ unexpected args
		// @ts-expect-error
		expect(observable.shift(1, 2, 3)).toBe(baseState.shift(1, 2, 3));
		expect(observable).toStrictEqual(baseState);

		// shift
		expect(observable.shift()).toBe(baseState.shift());
		expect(observable).toStrictEqual(baseState);
	});
});
