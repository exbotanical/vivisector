import type { IDoneFunction } from '../types';

interface IDoneFunctionBuilder {
	(ret: () => void): IDoneFunction;
}

/**
 * @summary Construct a done committal function
 *
 * @internal
 */
export const DoneFunctionBuilder: IDoneFunctionBuilder = (ret) => {
	const done: IDoneFunction = (commit) => {
		if (commit) return ret();
	};

	return done;
};
