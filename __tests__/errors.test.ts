import { vivisect } from '..';
import { VxError } from '../src/utils';

describe('evaluation of error handling', () => {
	it('throws an error when provided a non-function event handler', () => {
		const observable = vivisect({});

		expect(() => {
			// @ts-expect-error
			observable.subscribe('add', 'add');
		}).toThrow();

		expect(() => {
			// @ts-expect-error
			observable.subscribe('add1', () => {});
		}).toThrow();

		try {
			// @ts-expect-error
			observable.subscribe('add', 'add');
		} catch (ex) {
			expect(ex).toBeInstanceOf(VxError);
		}

		try {
			// @ts-expect-error
			observable.subscribe('add1', () => {});
		} catch (ex) {
			expect(ex).toBeInstanceOf(VxError);
		}
	});
});
