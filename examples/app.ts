import { vivisect } from '../lib';
import { VX_EVENT_TYPE, VxEventHandler } from '../lib/types';

const logger: VxEventHandler = ({ type, prevState, nextState }) => {
	console.log(`${type} fired; ${prevState} -> ${nextState}`);
};

function routine (observable) {
	observable.push(1);
	observable[3] = 4;

	console.log(4 === observable.pop());
}

(function main () {
	const arr = [1, 2, 3];

	const observable = vivisect(arr)
		.addEventListener(VX_EVENT_TYPE.ADD, logger)
		.addEventListener(VX_EVENT_TYPE.SET, logger)
		.addEventListener(VX_EVENT_TYPE.DEL, logger);

	routine(observable);

	observable
		.removeEventListener(VX_EVENT_TYPE.ADD, logger);

	routine(observable);
})();
