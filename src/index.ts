import { ProxiedObservableFactory } from './core/factory';
import { isObject, VxException } from './utils';

/**
 * @summary 'Vivisect' an object - render the object evented by
 * proxying it through a subscribable interface
 *
 * @param initialState
 *
 * @public
 */
export const vivisect = <S>(initialState: S) => {
	if (isObject(initialState) || Array.isArray(initialState)) {
		return ProxiedObservableFactory.create<S>(initialState);
	}

	throw VxException.create(
		new VxException({
			reason: 'invalid initial state type'
		})
	);
};
