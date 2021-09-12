import { shallowCopy } from '../lib/utils';

 describe('evaluation of utilities', () => {
	it('shallow copies an array', () => {
		const o = {
			a: 1,
			b: 2,
			c: 3
		};

		const cp = shallowCopy(o);

		// observable
		// 	.addEventListener('add', ({ type, prevState, nextState }, done) => {
		// 		if (nextState.d == 's') done(true)
		// 		else done(false);
		// 	});

		// observable.a = 'done:function';
		// console.log({ observable });
		// observable.s = 'd';
		// console.log({ observable });
		// observable.d = 's';
		// console.log({ observable })
	});
});
