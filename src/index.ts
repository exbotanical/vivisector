import { VxEventedObject, VxState } from './types/base.types';
import { ProxiedObservable } from './core/ProxiedObservable';

// such that we can use `Array.prototype.includes` with types that
// may not be that of the array's elements
declare global {
	interface Array<T> {
		includes<U extends (T extends U ? unknown : never)>(el: U, idx?: number): boolean;
	}
}

export const vivisect = (initialState: VxState): VxEventedObject => new ProxiedObservable()
  .create(initialState);
