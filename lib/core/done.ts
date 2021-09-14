import { DoneFunction, DoneBuilder } from '../types';

const DoneFunctionBuilder: DoneBuilder = (ret) => {
	const done: DoneFunction = (commit) => {
		if (commit) return ret();
	};

	return done;
};

export {
	DoneFunctionBuilder
};
