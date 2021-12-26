/* eslint-disable jest/no-conditional-expect,jest/prefer-called-with */
import { vivisect } from '../src';

import { forEachKeyValue } from './util';

import type { TestArray, TestObject } from './types';

describe('evaluations of the base vivisector event emission', () => {
	describe('evaluations of default events', () => {
		const callbacks = {
			add: jest.fn(),
			set: jest.fn(),
			del: jest.fn(),
			batched: jest.fn()
		};

		const iterator = forEachKeyValue(callbacks);

		it('vivisected arrays should emit default `add`, `del`, `get`, and `set` events', () => {
			const arr = vivisect<TestArray>([1, 2, 3]);

			iterator((key, value) => {
				arr.subscribe(key, value, { alwaysCommit: true });
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
			const obj = vivisect<TestObject>({ a: 1, b: 2, c: 3 });

			iterator((key, value) => {
				obj.subscribe(key, value, { alwaysCommit: true });
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
				} else if (key == 'set') {
					expect(value).toHaveBeenCalledTimes(2);
				} else {
					expect(value).toHaveBeenCalledTimes(0);
				}
			});
		});

		it('vivisected arrays should emit the (a) event name, (b) original state, (c) updated state', () => {
			const arr = vivisect<TestArray>([1, 2, 3]);

			iterator((key, value) => {
				arr.subscribe(key, value, { alwaysCommit: true });
			});

			// sanity check
			iterator((key, value) => {
				expect(value).toHaveBeenCalledTimes(0);
			});

			arr.push(4, 5, 6);

			iterator((key, value) => {
				if (key == 'batched') {
					expect(value).toHaveBeenCalledWith(
						{
							type: 'batched',
							prevState: [1, 2, 3],
							nextState: [1, 2, 3, 4, 5, 6]
						},
						expect.any(Function)
					);
				}
			});

			arr.pop();
			arr.slice(0); // no-op

			iterator((key, value) => {
				if (key == 'del') {
					expect(value).toHaveBeenCalledWith(
						{
							type: 'del',
							prevState: [1, 2, 3, 4, 5, 6],
							nextState: [1, 2, 3, 4, 5]
						},
						expect.any(Function)
					);
				}
			});

			arr[2];

			arr[3] = 9;

			iterator((key, value) => {
				if (key == 'set') {
					expect(value).toHaveBeenCalledWith(
						{
							type: 'set',
							prevState: [1, 2, 3, 4, 5],
							nextState: [1, 2, 3, 9, 5]
						},
						expect.any(Function)
					);
				}
			});
		});

		it('vivisected objects should emit the (a) event name, (b) original state, (c) updated state', () => {
			const obj = vivisect<TestObject>({ a: 1, b: 2, c: 3 });

			iterator((key, value) => {
				obj.subscribe(key, value, { alwaysCommit: true });
			});

			// sanity check
			iterator((key, value) => {
				expect(value).toHaveBeenCalledTimes(0);
			});

			Object.assign(obj, { d: 4 });

			iterator((key, value) => {
				if (key == 'add') {
					expect(value).toHaveBeenCalledWith(
						{
							type: 'add',
							prevState: { a: 1, b: 2, c: 3 },
							nextState: { a: 1, b: 2, c: 3, d: 4 }
						},
						expect.any(Function)
					);
				}
			});

			delete obj.d;
			delete obj.x; // no-op

			iterator((key, value) => {
				if (key == 'del') {
					expect(value).toHaveBeenCalledWith(
						{
							type: 'del',
							prevState: { a: 1, b: 2, c: 3, d: 4 },
							nextState: { a: 1, b: 2, c: 3 }
						},
						expect.any(Function)
					);
				}
			});

			obj.b;

			obj.a = 9;

			iterator((key, value) => {
				if (key == 'set') {
					expect(value).toHaveBeenCalledWith(
						{
							type: 'set',
							prevState: { a: 1, b: 2, c: 3 },
							nextState: { a: 9, b: 2, c: 3 }
						},
						expect.any(Function)
					);
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
		set: jest.fn(),
		del: jest.fn()
	};

	it('should fire event handlers sequentially', () => {
		const observable = vivisect<TestObject>({});

		observable
			.subscribe('add', callbacks.add)
			.subscribe('add', callbacks.add2)
			.subscribe('add', callbacks.add3);

		Object.assign(observable, { a: 1, b: 2 });

		expect(callbacks.add).toHaveBeenCalledBefore(callbacks.add2);
		expect(callbacks.add2).toHaveBeenCalledBefore(callbacks.add3);
	});

	it('should unregister a given event handler', () => {
		const observable = vivisect<TestObject>({});

		observable
			.subscribe('add', callbacks.add)
			.subscribe('add', callbacks.add2)
			.subscribe('add', callbacks.add3);

		observable.unsubscribe('add', callbacks.add);

		observable.k = 1;

		expect(callbacks.add).not.toHaveBeenCalled();
		expect(callbacks.add2).toHaveBeenCalled();
		expect(callbacks.add3).toHaveBeenCalled();
	});
});
