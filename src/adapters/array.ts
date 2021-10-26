import { BaseObservableFactory } from '../core/BaseObservableFactory';
import { DoneFunctionBuilder } from '../core/done';
import { shallowCopy } from '../utils';

/**
 * @summary Define evented analogs on a proxied array prototype
 * @param target
 * @param prop
 *
 * @internal
 */
export function eventedArrayPrototypeResolver(
	this: BaseObservableFactory,
	target: any[],
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

			this.raiseEvent(
				{
					type: 'batched',
					prevState,
					nextState
				},
				done
			);

			return ret;
		}

		if (prop == 'pop') {
			const ret = nextState.pop();
			const done = DoneFunctionBuilder(() => {
				target.length = target.length - 1;
			});

			this.raiseEvent(
				{
					type: 'del',
					prevState,
					nextState
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

				this.raiseEvent(
					{
						type: 'batched',
						prevState,
						nextState
					},
					done
				);
			}

			return ret;
		}

		if (prop == 'reverse') {
			const done = DoneFunctionBuilder(() => target.reverse());

			nextState.reverse();

			this.raiseEvent(
				{
					type: 'batched',
					prevState,
					nextState
				},
				done
			);

			return nextState;
		}

		if (prop == 'push') {
			const done = DoneFunctionBuilder(() => target.push(...args));

			nextState.push(...args);

			this.raiseEvent(
				{
					type: args.length > 1 ? 'batched' : 'add',
					prevState,
					nextState
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

				this.raiseEvent(
					{
						type: 'add',
						prevState,
						nextState
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
