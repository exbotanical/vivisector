import { vivisect } from '../src';

describe('evaluation of error handling', () => {
	it('throws an error when provided a non-function event handler', () => {
		const observable = vivisect({});

		expect(() => {
			// @ts-expect-error
			observable.subscribe('add', 'add');
		}).toThrow('The provided event handler must be a function');

		expect(() => {
			// @ts-expect-error
			observable.subscribe('add1', () => {});
		}).toThrow(
			"An unknown event name 'add1' was provided; there are no subscribable events matching this identifier"
		);
	});
});
