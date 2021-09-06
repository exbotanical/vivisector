import { VxError } from '../src/utils/exceptions';

describe('evaluation of error handling', () => {
	it('throws an error when provided a non-function event handler', () => {
		const observable = vivisect({});

		expect(() => {
			observable.addEventListener('add', 'add');
		}).toThrow();

		expect(() => {
			observable.addEventListener('add1', () => {});
		}).toThrow();

		try {
			observable.addEventListener('add', 'add');
		} catch (ex) {
			expect(ex).toBeInstanceOf(VxError);
		}

		try {
			observable.addEventListener('add1', () => {});
		} catch (ex) {
			expect(ex).toBeInstanceOf(VxError);
		}
	});
});
