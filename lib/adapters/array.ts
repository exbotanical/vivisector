import { BaseObservableFactory } from '../core/BaseObservableFactory';
import { DoneFunctionBuilder } from '../core/done';
import { VxState, VX_EVENT_TYPE } from '../types';
import { shallowCopy } from '../utils';

interface EventedArrayPrototypeResolver {
	(this: BaseObservableFactory, target: any[], prop: keyof VxState): void;
}

export const eventedArrayPrototypeResolver: EventedArrayPrototypeResolver = function (target, prop) {
	const ogMethod = target[prop];

	return (...args: any[]) => {
		const nextState = shallowCopy(target);
		let prevState = shallowCopy(target);

		if (prop == 'shift') {
			const ret = nextState.shift();
			const done = DoneFunctionBuilder(
				() => Array.prototype.shift.call(target)
			);

			this.raiseEvent({
				type: VX_EVENT_TYPE.BATCHED,
				prevState,
				nextState
			}, this, done);

			return ret;
		}

		if (prop == 'pop') {
			const ret = nextState.pop();
			const done = DoneFunctionBuilder(() => {
				target.length = target.length - 1;
			});

			this.raiseEvent({
				type: VX_EVENT_TYPE.DEL,
				prevState,
				nextState
			}, this, done);

			return ret;
		}

		if (prop == 'unshift') {
			let ret = target.length;

			if (args.length) {
				const done = DoneFunctionBuilder(
					() => Array.prototype.unshift.call(target, ...args)
				);
				ret = nextState.unshift(...args);

				this.raiseEvent({
					type: VX_EVENT_TYPE.BATCHED,
					prevState,
					nextState
				}, this, done);
			}

			return ret;
		}

		if (prop == 'reverse') {
			const done = DoneFunctionBuilder(
				() => target.reverse()
			);

			nextState.reverse();

			this.raiseEvent({
				type: VX_EVENT_TYPE.BATCHED,
				prevState,
				nextState
			}, this, done);

			return nextState;
		}

		if (prop == 'push') {
			const done = DoneFunctionBuilder(
				() => target.push(...args)
			);

			nextState.push(...args);

			this.raiseEvent({
				type: args.length > 1 ? VX_EVENT_TYPE.BATCHED : VX_EVENT_TYPE.ADD,
				prevState,
				nextState
			}, this, done);

			return nextState.length;
		}

		if (args.length) {
			// raise the event for each argument
			for (const arg of args) {
				const done = DoneFunctionBuilder(
					() => ogMethod.apply(target, [arg])
				);

				ogMethod.apply(nextState, [arg]);

				this.raiseEvent({
					type: VX_EVENT_TYPE.ADD,
					prevState,
					nextState
				}, this, done);

				prevState = shallowCopy(target);
			}

			return nextState;
		}

		return ogMethod.apply(target, args);
	};
};
