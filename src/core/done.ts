import type { IDoneFunction } from '../types';

interface IDoneFunctionBuilder {
	(ret: () => void): IDoneFunction;
}

/**
 * Construct a done committal function
 *
 * @internal
 */
export const DoneFunctionBuilder: IDoneFunctionBuilder = (ret) => {
	const done: IDoneFunction = (commit) => {
		if (commit) {
			ret();
		}
	};

	return done;
};
