/* eslint-disable no-console */
import { vivisect } from '../src';

import type { ISubscriptionCallback } from '../src/types';

const logger: ISubscriptionCallback<number[]> = (
	{ type, prevState, nextState },
	done
) => {
	console.log(`${type} fired; ${prevState} -> ${nextState}`);

	// so long as the first el is not 99, we allow the mutation
	// to be committed
	if (nextState[0] !== 99) done(true);
};

function routine(observable: number[]) {
	observable.push(1);
	observable[3] = 4;

	console.log(observable.pop() === 4);
}

(function main() {
	const arr = [1, 2, 3];

	const observable = vivisect(arr)
		.subscribe('add', logger, { alwaysCommit: true })
		.subscribe('set', logger)
		.subscribe('batched', logger)
		.subscribe('del', logger);

	routine(observable);

	observable.unsubscribe('add', logger);

	routine(observable);

	observable.unshift(99);

	console.log(observable[0] === 99); // false
	console.log(observable); // [1, 2]
})();
