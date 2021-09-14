/* eslint-disable no-console */
import { vivisect } from '../lib';
import { VX_EVENT_TYPE, VxEventHandler } from '../lib/types';

const logger: VxEventHandler = ({ type, prevState, nextState }, done) => {
	console.log(`${type} fired; ${prevState} -> ${nextState}`);

	// so long as the first el is not 99, we allow the mutation
	// to be committed
	if (nextState[0] !== 99) done(true);
};

function routine (observable) {
	observable.push(1);
	observable[3] = 4;

	console.log(observable.pop() === 4);
}

(function main () {
	const arr = [1, 2, 3];

	const observable = vivisect(arr)
		.addEventListener(VX_EVENT_TYPE.ADD, logger, { alwaysCommit: true })
		.addEventListener(VX_EVENT_TYPE.SET, logger)
		.addEventListener(VX_EVENT_TYPE.BATCHED, logger)
		.addEventListener(VX_EVENT_TYPE.DEL, logger);

	routine(observable);

	observable
		.removeEventListener(VX_EVENT_TYPE.ADD, logger);

	routine(observable);

	observable.unshift(99);

	console.log(observable[0] === 99); // false
	console.log(observable); // [1, 2]
})();
