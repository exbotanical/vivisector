import type { IDoneFunction } from '../types';

interface IDoneFunctionBuilder {
	(ret: Function): IDoneFunction;
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
