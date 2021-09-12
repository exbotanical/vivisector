import { DoneFunction } from '../types';

export const DoneFunctionBuilder = (ret: Function) =>{
	const done: DoneFunction = (commit) => {
		if (commit) return ret();
	}

	return done;
};
