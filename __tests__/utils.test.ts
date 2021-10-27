import { shallowCopy } from '../src/utils';

describe('evaluation of utilities', () => {
	describe('evaluation of shallowCopy', () => {
		it('copies a single-depth object', () => {
			const o = {
				a: 1,
				b: 2,
				c: 3
			};

			const cp = shallowCopy(o);

			expect(o).toEqual(cp);
		});

		it('copies a nested-depth object', () => {
			const o = {
				a: 1,
				b: 2,
				c: 3,
				d: {
					e: 4
				}
			};

			const cp = shallowCopy(o);

			expect(o).toEqual(cp);
		});

		it('copies an object with methods', () => {
			const o = {
				a: 1,
				b: 2,
				c: 3,
				d: {
					e: 4,
					f() {}
				}
			};

			const cp = shallowCopy(o);

			expect(o).toEqual(cp);
		});

		it('copies an object with getters and setters', () => {
			const o = {
				a: 1,
				b: 2,
				c: 3,
				d: {
					get e() {
						return 99;
					},
					set e(v) {}
				}
			};

			const cp = shallowCopy(o);

			expect(o).toEqual(cp);
			expect(o.d.e).toBe(99);
			expect(o.d.e).toBe(cp.d.e);
		});

		it('copies an object prototype', () => {
			const o = Object.create({
				thing() {
					return 99;
				}
			});

			const cp = shallowCopy(o);

			expect(cp.thing).toBeInstanceOf(Function);
			expect(o.thing()).toBe(cp.thing());
		});
	});
});
