import { ProxiedObservableFactory } from './core/factory';
import { isObject, VxException } from './utils';

import type { IVivisectorApi } from './types';

interface Vivisector {
	(initialState: unknown): IVivisectorApi;
}

/**
 * @summary TODO
 * @param initialState
 *
 * @public
 */
export const vivisect: Vivisector = (initialState) => {
	if (isObject(initialState) || Array.isArray(initialState)) {
		return new ProxiedObservableFactory().create(initialState);
	}

	throw VxException.create(
		new VxException({
			reason: 'invalid initial state type'
		})
	);
};
