export function forEachKeyValue (obj, fn) {
  const kv = Object.entries(obj);

  if (fn == null) {
    return function (fn) {
      kv.forEach(([k, v]) => fn(k, v));
    }
  }

  kv.forEach(([k, v]) => fn(k, v));
}
