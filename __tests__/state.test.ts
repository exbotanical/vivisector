/* eslint-disable no-undefined */
import { vivisect } from '../src';

import { forEachKeyValue } from './util';

import type { TestArray, TestObject } from './types';

describe('evaluation of state management, tracking', () => {
	const callbacks = {
		add: jest.fn(),
		set: jest.fn(),
		del: jest.fn(),
		batched: jest.fn()
	};

	const iterator = forEachKeyValue(callbacks);

	it('should track array `prevState`, `nextState` as expected', () => {
		const initialState = [1, 2, 3];
		const observable = vivisect<TestArray>(initialState);

		iterator((key, value) => {
			observable.subscribe(key, value, { alwaysCommit: true });
		});

		// sanity check
		iterator((key, value) => {
			expect(value).toHaveBeenCalledTimes(0);
		});

		observable.push(9);

		expect(callbacks.add).toHaveBeenNthCalledWith(
			1,
			{
				prevState: initialState,
				nextState: [...initialState, 9],
				type: 'add'
			},
			expect.any(Function)
		);

		observable.pop();

		expect(callbacks.del).toHaveBeenNthCalledWith(
			1,
			{
				prevState: [...initialState, 9],
				nextState: initialState,
				type: 'del'
			},
			expect.any(Function)
		);

		observable.splice(2);

		expect(callbacks.del).toHaveBeenNthCalledWith(
			2,
			{
				prevState: initialState,
				nextState: [1, 2],
				type: 'del'
			},
			expect.any(Function)
		);

		observable.splice(1);

		expect(callbacks.del).toHaveBeenNthCalledWith(
			3,
			{
				prevState: [1, 2],
				nextState: [1],
				type: 'del'
			},
			expect.any(Function)
		);

		observable.push(1, 2, 3);

		expect(callbacks.batched).toHaveBeenNthCalledWith(
			1,
			{
				prevState: [1],
				nextState: [1, ...initialState],
				type: 'batched'
			},
			expect.any(Function)
		);

		observable.shift();

		expect(callbacks.batched).toHaveBeenNthCalledWith(
			2,
			{
				prevState: [1, 1, 2, 3],
				nextState: [1, 2, 3],
				type: 'batched'
			},
			expect.any(Function)
		);

		observable.unshift(0);

		expect(callbacks.batched).toHaveBeenNthCalledWith(
			3,
			{
				prevState: initialState,
				nextState: [0, ...initialState],
				type: 'batched'
			},
			expect.any(Function)
		);

		observable[0] = 1;

		expect(callbacks.set).toHaveBeenNthCalledWith(
			1,
			{
				prevState: [0, ...initialState],
				nextState: [1, ...initialState],
				type: 'set'
			},
			expect.any(Function)
		);

		observable.unshift(1, 2, 3);

		expect(callbacks.batched).toHaveBeenNthCalledWith(
			4,
			{
				prevState: [1, ...initialState],
				nextState: [1, 2, 3, 1, ...initialState],
				type: 'batched'
			},
			expect.any(Function)
		);

		observable.reverse();

		expect(callbacks.batched).toHaveBeenNthCalledWith(
			5,
			{
				prevState: [1, 2, 3, 1, ...initialState],
				nextState: [1, 2, 3, 1, ...initialState].reverse(),
				type: 'batched'
			},
			expect.any(Function)
		);

		expect(callbacks.add.mock.calls).toHaveLength(1);
		expect(callbacks.set.mock.calls).toHaveLength(1);
		expect(callbacks.del.mock.calls).toHaveLength(3);
		expect(callbacks.batched.mock.calls).toHaveLength(5);
	});

	it('should track object `prevState`, `nextState` as expected', () => {
		const initialState = { a: 1, b: 2, c: 3 };
		const observable = vivisect<TestObject>(initialState);

		iterator((key, value) => {
			observable.subscribe(key, value, { alwaysCommit: true });
		});

		// sanity check
		iterator((key, value) => {
			expect(value).toHaveBeenCalledTimes(0);
		});

		observable.a = 11;

		expect(callbacks.set).toHaveBeenNthCalledWith(
			1,
			{
				type: 'set',
				prevState: initialState,
				nextState: { a: 11, b: 2, c: 3 }
			},
			expect.any(Function)
		);

		observable.k = 99;

		expect(callbacks.add).toHaveBeenNthCalledWith(
			1,
			{
				type: 'add',
				prevState: { a: 11, b: 2, c: 3 },
				nextState: { a: 11, b: 2, c: 3, k: 99 }
			},
			expect.any(Function)
		);

		observable.k = {};

		expect(callbacks.set).toHaveBeenNthCalledWith(
			2,
			{
				type: 'set',
				prevState: { a: 11, b: 2, c: 3, k: 99 },
				nextState: { a: 11, b: 2, c: 3, k: {} }
			},
			expect.any(Function)
		);

		observable.k.l = 77;

		// caveat - nested objects will emit their own state
		expect(callbacks.add).toHaveBeenNthCalledWith(
			2,
			{
				type: 'add',
				prevState: {},
				nextState: { l: 77 }
			},
			expect.any(Function)
		);

		Object.assign(observable, { p: 110 });

		expect(callbacks.add).toHaveBeenNthCalledWith(
			3,
			{
				type: 'add',
				prevState: { a: 11, b: 2, c: 3, k: { l: 77 } },
				nextState: { a: 11, b: 2, c: 3, k: { l: 77 }, p: 110 }
			},
			expect.any(Function)
		);

		delete observable.a;

		expect(callbacks.del).toHaveBeenNthCalledWith(
			1,
			{
				type: 'del',
				prevState: { a: 11, b: 2, c: 3, k: { l: 77 }, p: 110 },
				nextState: { b: 2, c: 3, k: { l: 77 }, p: 110 }
			},
			expect.any(Function)
		);

		delete observable.k.l;

		// again, caveat
		expect(callbacks.del).toHaveBeenNthCalledWith(
			2,
			{
				type: 'del',
				prevState: { l: 77 },
				nextState: {}
			},
			expect.any(Function)
		);

		observable.b = undefined;

		expect(callbacks.set).toHaveBeenNthCalledWith(
			3,
			{
				type: 'set',
				prevState: { b: 2, c: 3, k: {}, p: 110 },
				nextState: { b: undefined, c: 3, k: {}, p: 110 }
			},
			expect.any(Function)
		);

		delete observable.p;

		expect(callbacks.del).toHaveBeenNthCalledWith(
			3,
			{
				type: 'del',
				prevState: { b: undefined, c: 3, k: {}, p: 110 },
				nextState: { b: undefined, c: 3, k: {} }
			},
			expect.any(Function)
		);

		expect(callbacks.del.mock.calls).toHaveLength(3);
		expect(callbacks.add.mock.calls).toHaveLength(3);
		expect(callbacks.set.mock.calls).toHaveLength(3);
	});
});
