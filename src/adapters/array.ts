import { DoneFunctionBuilder } from '../core/done';
import { shallowCopy } from '../utils';

import type { BaseObservableFactory } from '../core/factory';

/**
 * Define evented analogs on a proxied array prototype
 * @param target
 * @param prop
 *
 * @internal
 */
export function eventedArrayPrototypeResolver<S extends any[]>(
	context: BaseObservableFactory<S>,
	target: S,
	prop: PropertyKey
) {
	const ogMethod = target[prop as any];

	return (...args: any[]) => {
		const nextState = shallowCopy(target);
		let prevState = shallowCopy(target);

		if (prop == 'shift') {
			const ret = nextState.shift();
			const done = DoneFunctionBuilder(() =>
				Array.prototype.shift.call(target)
			);

			context.raiseEvent(
				{
					nextState,
					prevState,
					type: 'batched'
				},
				done
			);

			return ret;
		}

		if (prop == 'pop') {
			const ret = nextState.pop();
			const done = DoneFunctionBuilder(() => {
				target.length -= 1;
			});

			context.raiseEvent(
				{
					nextState,
					prevState,
					type: 'del'
				},
				done
			);

			return ret;
		}

		if (prop == 'unshift') {
			let ret = target.length;

			if (args.length) {
				const done = DoneFunctionBuilder(() =>
					Array.prototype.unshift.call(target, ...args)
				);
				ret = nextState.unshift(...args);

				context.raiseEvent(
					{
						nextState,
						prevState,
						type: 'batched'
					},
					done
				);
			}

			return ret;
		}

		if (prop == 'reverse') {
			const done = DoneFunctionBuilder(() => target.reverse());

			nextState.reverse();

			context.raiseEvent(
				{
					nextState,
					prevState,
					type: 'batched'
				},
				done
			);

			return nextState;
		}

		if (prop == 'push') {
			const done = DoneFunctionBuilder(() => target.push(...args));

			nextState.push(...args);

			context.raiseEvent(
				{
					nextState,
					prevState,
					type: args.length > 1 ? 'batched' : 'add'
				},
				done
			);

			return nextState.length;
		}

		if (args.length) {
			// raise the event for each argument
			for (const arg of args) {
				const done = DoneFunctionBuilder(() => ogMethod.apply(target, [arg]));

				ogMethod.apply(nextState, [arg]);

				context.raiseEvent(
					{
						nextState,
						prevState,
						type: 'add'
					},
					done
				);

				prevState = shallowCopy(target);
			}

			return nextState;
		}

		return ogMethod.apply(target, args);
	};
}
