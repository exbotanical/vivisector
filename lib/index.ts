import { VxEventedObject, VxState } from './types';
import { ProxiedObservableFactory } from './core/ProxiedObservableFactory';

// such that we can use `Array.prototype.includes` with types that
// may not be that of the array's elements

// TODO restrict namespace
declare global {
	interface Array<T> {
		includes<U extends (T extends U ? unknown : never)>(el: U, idx?: number): boolean;
	}
}

interface Vivisector {
	(initialState: VxState): VxEventedObject
}

export const vivisect: Vivisector =
	(initialState) => new ProxiedObservableFactory()
		.create(initialState);
