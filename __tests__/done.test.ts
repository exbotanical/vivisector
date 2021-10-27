import { vivisect } from '../src';

import type { ISubscriptionCallback } from '../src/types';
import type { TestArray, TestObject } from './types';

describe('evaluation of `done` state mutation committal', () => {
	const commitKey = Symbol('commit');
	const spy = jest.fn();

	describe('evaluation of array mutations', () => {
		const callback: ISubscriptionCallback<TestArray> = (
			{ prevState, nextState },
			done
		) => {
			if (nextState.includes(commitKey)) done(true);
			// we'll pass the `prevState` back so we can assert against it
			spy(prevState);
		};

		it('cancels array mutations when `done` is not invoked', () => {
			const observable = vivisect([1, 2, 3])
				.subscribe('add', callback)
				.subscribe('set', callback)
				.subscribe('del', callback)
				.subscribe('batched', callback);

			observable.push(1);

			observable.splice(0, 1, 12);

			observable[2] = 22;

			observable.pop();

			observable.shift();

			observable.unshift(1);

			observable.reverse();

			observable.sort((a, b) => b - a);

			// state should be exactly as it was to begin with
			for (const [call] of spy.mock.calls) {
				expect(call).toEqual(observable);
			}
		});

		it('commits array mutations when `done` is invoked', () => {
			const observable = vivisect<TestArray>([1, 2, 3])
				.subscribe('add', callback)
				.subscribe('set', callback)
				.subscribe('del', callback)
				.subscribe('batched', callback);

			observable.push(commitKey);

			// remember, we're testing against the `prevState`
			expect(spy.mock.calls[0][0]).toEqual([1, 2, 3]);

			observable.splice(0, 1, 12);
			expect(spy.mock.calls[1][0]).toEqual([1, 2, 3, commitKey]);

			observable[2] = 22;
			expect(spy.mock.calls[2][0]).toEqual([12, 2, 3, commitKey]);

			observable.push(99);
			expect(spy.mock.calls[3][0]).toEqual([12, 2, 22, commitKey]);

			observable.pop();
			expect(spy.mock.calls[4][0]).toEqual([12, 2, 22, commitKey, 99]);

			observable.shift();
			expect(spy.mock.calls[5][0]).toEqual([12, 2, 22, commitKey]);

			observable.unshift(1);
			expect(spy.mock.calls[6][0]).toEqual([2, 22, commitKey]);

			observable.reverse();
			expect(spy.mock.calls[7][0]).toEqual([1, 2, 22, commitKey]);

			// @ts-ignore
			// we don't care about the types, only about the event that
			// will be emitted
			observable.sort((a, b) => {
				if (typeof a == 'number' && typeof b == 'number') return a - b;
				return a;
			});

			expect(spy.mock.calls[8][0]).toEqual([commitKey, 22, 2, 1]);

			expect(spy.mock.calls.length).toBe(9);
		});
	});

	describe('evaluation of object mutation', () => {
		const callback: ISubscriptionCallback<TestObject> = (
			{ prevState, nextState },
			done
		) => {
			if (nextState[commitKey as any]) done(true);
			// we'll pass the `prevState` back so we can assert against it
			spy(prevState);
		};

		it('cancels object mutations when `done` is not invoked', () => {
			const initialState = { a: 1, b: 2, c: 3 };

			const observable = vivisect<TestObject>(initialState)
				.subscribe('add', callback)
				.subscribe('set', callback)
				.subscribe('del', callback)
				.subscribe('batched', callback);

			observable.a = 11;

			delete observable.b;

			observable.c = {};

			observable.d = 99;

			observable.alice = 'pharoah';

			Object.assign(observable, { r: 1 });

			observable.q = () => {};
			expect(observable).toEqual(initialState);
		});

		it('commits array mutations when `done` is invoked', () => {
			const initialState = { a: 1, b: 2, c: 3 };

			const observable = vivisect<TestObject>(initialState)
				.subscribe('add', callback)
				.subscribe('set', callback)
				.subscribe('del', callback)
				.subscribe('batched', callback);

			observable[commitKey] = 'a';
			expect(spy.mock.calls[0][0]).toEqual(initialState);

			delete observable.b;
			expect(spy.mock.calls[1][0]).toEqual({
				...initialState,
				[commitKey]: 'a'
			});

			observable.c = {};
			expect(spy.mock.calls[2][0]).toEqual({ a: 1, c: 3, [commitKey]: 'a' });

			observable.d = 99;
			expect(spy.mock.calls[3][0]).toEqual({ a: 1, c: {}, [commitKey]: 'a' });

			observable.alice = 'pharoah';
			expect(spy.mock.calls[4][0]).toEqual({
				a: 1,
				c: {},
				d: 99,
				[commitKey]: 'a'
			});

			Object.assign(observable, { r: 1 });
			expect(spy.mock.calls[5][0]).toEqual({
				a: 1,
				c: {},
				d: 99,
				alice: 'pharoah',
				[commitKey]: 'a'
			});

			observable.q = () => {};
			expect(spy.mock.calls[6][0]).toEqual({
				a: 1,
				c: {},
				d: 99,
				alice: 'pharoah',
				[commitKey]: 'a',
				r: 1
			});

			Object.assign(observable, { a: 12 }, { q: 2 });
			expect(spy.mock.calls[7][0]).toEqual({
				a: 1,
				c: {},
				d: 99,
				alice: 'pharoah',
				[commitKey]: 'a',
				r: 1,
				q: expect.any(Function)
			});

			expect(spy.mock.calls[8][0]).toEqual({
				a: 12,
				c: {},
				d: 99,
				alice: 'pharoah',
				[commitKey]: 'a',
				r: 1,
				q: expect.any(Function)
			});

			expect(spy.mock.calls.length).toBe(9);
		});
	});
});
