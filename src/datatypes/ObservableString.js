const { 
  defineAddEventListener, 
  defineRemoveEventListener, 
  raiseEvent 
} = require('../utils/ubiquitous-props.js');

/**
 * @override 
 * @readonly
 * @summary Factory for instantiating observable String-like objects.
 * @description Copies given string input into new String object; proceeds to assign props for adding/removing
 *   event-listeners, adds custom `reassign` method and accessors, assimilates extended String prototype props. 
 *   Extended String prototype methods are conformed as computed properties that are called on the primitive String value
 *   contained by the `ObservableString`, and not the `ObservableString` itself.
 *   Registers as events `mutated`.
 * @augments String
 */
function ObservableString (value) {
  const _self = this,
    _handlers = {
      mutated: []
    };

  if (typeof value === 'string') {
    /*
      The actual primitive value is stored in String Object.
      Unlike the `ObservableArray`, we don't need to copy the value to an internal, nested prop given the limited scope of operations
      to be performed on a primitive i.e. the String versus an Object such as an Array
    */
    _self[0] = String(value);
  }


  /**
   * @param {Object} coreObject Given Object to be mutated
   * @param {String} coreValue User-provided value to which the internal/core val will be mutated
   * @summary Supplants core value with that provided by user.
   * @returns {Object} Comprised of the previous core value `value` and the new core value `mutant`.
   */
  const mutateCoreValue = (coreObject, coreValue) => {
    // persist pre-mutated value (note, not the String Object but the value therein)
    const value = coreObject[0].valueOf();
    coreObject[0] = String(coreValue);
    // get current mutated/new String value
    const mutant = coreObject[0].valueOf();
    // execute callback; 
    return { value, mutant };
  };

      
  /**
   * @summary Defines accessor for String primitive / core value.
   */
  Object.defineProperty(_self, 'value', {
    configurable: false,
    enumerable: false,
    get () {
      // if `undefined`, we implicitly return `undefined` and mitigate the exception that would be thrown by calling `valueOf` thereon
      if (_self[0]) {
        return _self[0].valueOf();
      }
      return undefined;
    },
    set (arg) {
      if (typeof arg === 'string') {
        /* 
          By using `Object.assign`, we can create, in-line, a new Object consisting of a key/value pair to denote our desired event type.
          `assign` will 'merge' the in-line Object with that returned from `mutateCoreValue`. 
          Given `raiseEvent` accepts as input an Object, we can pass this expression directly; it will resolve to the necessary values.
        */
        raiseEvent(
          Object.assign({ type: 'mutated' }, mutateCoreValue(_self, arg)),
          _self,
          _handlers
        );

      }
    }
  });

  /**
   * @summary Defines custom method `reassign`.
   */
   Object.defineProperty(_self, 'reassign', {
    configurable: false,
    enumerable: false,
    writable: false, 
    /**
     * @param {String|Any} candidate User provided value to which the Observable will be reassigned (provided it is a String).
     * @summary Supplants internal value with `candidate` and broadcasts 'mutated' event.
     * @returns {Object} The Observable instance, returned so as to allow method chaining.
     */
    value (candidate) {
      // type-check and validations go here
      if (!(typeof candidate === 'string')) {
        throw new Error('Error: Invalid type.');
      }
      /* 
        _self.value = stringInput; 
        
        Mutating the `value` prop here as demonstrated in the above-commented code *would* fire all `mutated` events given the
        execution context of prop `value` is recursively applicable. However, we'd like to maintain as great a degree and 
        granularity of control as possible. As such, we do *not* use the `value` accessor here, instead opting to raise
        the `mutated` event in a discrete context.
      */
       raiseEvent(
         Object.assign({ type: 'mutated' }, mutateCoreValue(_self, candidate)),
         _self,
         _handlers
      );
      
      // return `_self` to allow method to be chainable; see other like-comments
      return _self;
    }
  });
      
  // define props for event-binding
  defineAddEventListener(_self, _handlers);
  defineRemoveEventListener(_self, _handlers);
      
  /**
   * @override
   * @summary Define event-bound `split` method.
   */
  Object.defineProperty(_self, 'split', {
    configurable: false,
    enumerable: false,
    writable: false, 
    value (delimiter) {
      // get current String value
      const currentStringVal = _self[0].valueOf();
      // split current with provided argument `delimiter`
      const splitArr = currentStringVal.split(delimiter);
      // non-mutating, no need to raise event; return
      return splitArr;
    }
  });

  /**
   * @override
   * @summary Define event-bound `length` method / accessor.
   */
  Object.defineProperty(_self, 'length', {
    configurable: false,
    enumerable: false,
    get () {
      return _self[0].length;
    },
    // use noop here lest babel 7 complain
    set () {
      // essentially the 'only' noop in JavaScript (save for an empty function expression)
      // note we do not use an empty arrow func for linting/consistency purposes
      Function.prototype();
    }
  });

      
   /**
   * @override
   * @summary Extend `String` prototype as computed values.
   * @description  Here, we extend onto `ObservableString` all String prototype methods not already extant 
   *   and, for each, conform get/set to the execution context of the primitive value contained therein.
   * @extends String
   */
  Object.getOwnPropertyNames(String.prototype).forEach((name) => {
    // ensure prop isn't already allocated so as to avoid collisions 
    if (!(name in _self)) {
      Object.defineProperty(_self, name, {
        configurable: false,
        enumerable: false,
        writable: false,
        /**
         * @description Here, we intercept the getter/setter conformation of each method on String's prototype
         *   We do this so as to set the execution context to point to the primitive String and *not* its parent Object, 
         *   in this case `ObservableString`
         */
        value (...args) {
          return _self[0][name](...args);
        }
      });
    }
  });
}

module.exports = ObservableString;
