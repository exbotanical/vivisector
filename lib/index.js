import { isObject, isString, isArray, not } from 'js-heuristics';

import ObservableArray from './core/Array.observable';
import ObservableString from './core/String.observable';
import ObservableObject from './core/Object.observable';

export { vivisect };

function vivisect (subject) {
  if (
    not(isObject(subject)) &&
    not(isArray(subject)) &&
    not(isString(subject))
  ) {
    throw new Error('The provided type must be an object, array, or string');
  }

  switch (true) {
    case isObject(subject):
      return new ObservableObject(subject);
    case isArray(subject):
      return new ObservableArray(subject);
    case isString(subject):
      return new ObservableString(subject);
    default:
      return subject;
  }
}
