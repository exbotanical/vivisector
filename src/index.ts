import { VxEventedObject, VxState } from './types/base.types';
import { ProxiedObservable } from './core/ProxiedObservable';

export const vivisect = (initialState: VxState): VxEventedObject => new ProxiedObservable()
  .create(initialState);
