/*
* jqExt - jQuery framework extensions
*
* Version: 0.0.1a
* Copyright 2011 Alex Tkachev
*
* Dual licensed under MIT or GPLv2 licenses
*   http://en.wikipedia.org/wiki/MIT_License
*   http://en.wikipedia.org/wiki/GNU_General_Public_License
*
* Date: Tue Jul 5 14:47:46 2011 +0300
*/

/**
 * jQuery extensions
 * @project jqExt
 * @description jQuery extensions and javascript native classes extensions
 * @version 0.0.1
 */

/**
 * Define jQuery.ext namespace and extender utility methods
 */
(function($) {

  /**
   * @namespace $.ext
   * a namespace that contains all jqExt custom classes and utility methods. jqExt doesn't pollute global namespace
   * and groups all its code inside $.ext namespace.
   */
  $.ext = {
    /** special variable that is used to break from event fire and enumeration looping */
    $break: {}
  };

  /**
   * @namespace $.ext.mixins
   * a namespace where all mixins are defined and can be included into objects
   */
  $.ext.mixins = {};

  /**
   * @object {public} $.ext.Extender
   * Extender is an object with two static utility functions that allow to easily extend jQuery: to add utility methods
   * on jQuery object and to create plugins (that will be available as wrapped set methods).
   */
  $.ext.Extender = {

    /**
     * @function {public static void} ?
     * Add methods that will be available on jQuery wrapped set instance
     * @param {Hash} methods - hash of methodName: function
     * @param {optional boolean} keepOriginal - if true, original method will be kept under jq_original_[methodName]
     */
    addWrapedSetMethods: function(methods, keepOriginal) {
      for (var m in methods) {
        if (keepOriginal && jQuery.fn[m]) {
          jQuery.fn['jq_original_' + m] = jQuery.fn[m];
        }
        jQuery.fn[m] = methods[m];
      }
    },

    /**
     * @function {public static void} ?
     * Add methods that will be available on jQuery object instance
     * @param {Hash} methods - hash of methodName: function
     */
    addUtilityMethods: function(methods) {
      for (var m in methods) {
        jQuery[m] = methods[m];
      }
    }
  };

})(jQuery);
(function($) {

  /**
   * @namespace Object
   */
  var mixin = {

    keys: function() {
      var results = [];
      for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
          results.push(property);
        }
      }
      return results;
    }

  };

  // use native browser JS 1.6 implementation if available
  if (Object.keys) { delete mixin.keys; }

  $.extend(Object, mixin);

})(jQuery);
/**
 * Add utility method to jQuery object to test for additional parameters types
 */
jQuery.ext.Extender.addUtilityMethods({

  /**
   * @function {public static boolean} $.?
   * @param obj
   */
  isBoolean: function(obj){
    return jQuery.type(obj) === "boolean";
  },

  /**
   * @function {public static boolean} $.?
   * @param obj
   */
  isNumber: function(obj){
    return jQuery.type(obj) === "number";
  },

  /**
   * @function {public static boolean} $.?
   * @param obj
   */
  isDate: function(obj){
    return jQuery.type(obj) === "date";
  },

  /**
   * @function {public static boolean} $.?
   * @param obj
   */
  isString: function(obj){
    return jQuery.type(obj) === "string";
  },

  /**
   * @function {public static boolean} $.?
   * @param obj
   */
  isUndefined: function(obj){
    return jQuery.type(obj) === "undefined";
  }

});
(function($) {

  /**
   * @namespace $.ext.mixins.Enumerable
   * Enumerable provides a large set of useful methods for enumerations — objects that act as collections of values.
   * Enumerable is a mixin: a set of methods intended not for standaone use, but for incorporation into other objects.
   * jqExt mixes Enumerable into Array class (making all methods of Enumerable available on array instances).
   *
   * The Enumerable module basically makes only one requirement on your object: it must provide a method
   * named `_each` (note the leading underscore) that will accept a function as its unique argument,
   * and will contain the actual "raw iteration" algorithm, invoking its argument with each element in turn.
   * jqExt provides this method for array implementation (adds it to Array.prototype), but if you want to mix enumerable
   * into your own object, you have to implement _each method.
   *
   * <p> @depends $.ext </p>
   */
  var Enumerable = {

    /**
     * <h6>Example:</h6>
     * <pre>
     *  ['one', 'two', 'three'].each(alert);
     *  // Alerts "one", then alerts "two", then alerts "three"
     * </pre>
     *
     * @function {public Enumerable} ?
     * Calls <tt>iterator</tt> for each item in the collection.
     * @param {Function} iterator - A <tt>Function(item, index)</tt> that expects an item in the collection as the first argument and a numerical index as the second.
     * @param {optional Object} context - the scope in which to call <tt>iterator</tt>. Affects what the keyword <tt>this</tt> means inside <tt>iterator</tt>.
     * @returns this enumerable instance
     **/
    each: function(iterator, context) {
      var index = 0;
      try {
        this._each(function(value) {
          iterator.call(context, value, index++);
        });
      } catch (e) {
        if (e != $.ext.$break) throw e;
      }
      return this;
    },

    /**
     * <h6>Examples:</h6>
     * <pre>
     *  ['Hitch', "Hiker's", 'Guide', 'to', 'the', 'Galaxy'].collect(function(s) {
     *    return s.charAt(0).toUpperCase();
     *  });
     *  // -> ['H', 'H', 'G', 'T', 'T', 'G']
     *
     *  [1,2,3,4,5].collect(function(n) {
     *    return n * n;
     *  });
     *  // -> [1, 4, 9, 16, 25]
     * </pre>
     *
     * @function {public Array} ?
     * Returns the result of applying `iterator` to each element. If no `iterator` is provided, the elements are simply copied to the returned array.
     * @param {Function} iterator - The iterator function to apply to each element in the enumeration. The function result is what will be returned for that item.
     * @param {optional Object} context - the scope in which to call <tt>iterator</tt>. Affects what the keyword <tt>this</tt> means inside <tt>iterator</tt>.
     * @returns the result of applying `iterator` to each element
     *
     **/
    collect: function(iterator, context) {
      var results = [];
      this.each(function(value, index) {
        results.push(iterator.call(context, value, index));
      });
      return results;
    },

    /**
     * @function {public int} ?
     * Finds index of the first element for which iterator return truthy value.
     * @param {Function} iterator - The iterator function to apply to each element in the enumeration
     * @param {optional Object} context - the scope in which to call <tt>iterator</tt>. Affects what the keyword <tt>this</tt> means inside <tt>iterator</tt>.
     * @returns index of the first element for which iterator returns true or -1
     */
    findIndex: function(iterator, context) {
      var result = -1;
      this.each(function(value, index) {
        if (iterator.call(context, value, index)) {
          result = index;
          throw $.ext.$break;
        }
      });
      return result;
    },

    /**
     * <h6>Examples:</h6>
     * <pre>
     *  [1,4,10,2,22].include(10);
     *  // -> true
     *
     *  ['hello', 'world'].include('HELLO');
     *  // -> false ('hello' != 'HELLO')
     *
     *  [1, 2, '3', '4', '5'].include(3);
     *  // -> true ('3' == 3)
     * </pre>
     * 
     * @function {public boolean} ?
     * Checks if given object included in this collection. Comparison is based on `==` comparison
     * operator (equality with implicit type conversion)
     * @param {Object} item - the object to check for inclusion in this collection
     * @returns true if given object is included
     **/
    include: function(item) {
      if ($.isFunction(this.indexOf)) return this.indexOf(item) != -1;

      var found = false;
      this.each(function(value) {
        if (value == item) {
          found = true;
          throw $.ext.$break;
        }
      });
      return found;
    },

    /**
     * <h6>Examples:</h6>
     * <pre>
     *  ['hello', 'world'].invoke('toUpperCase');
     *  // -> ['HELLO', 'WORLD']
     *
     *  ['hello', 'world'].invoke('substring', 0, 3);
     *  // -> ['hel', 'wor']
     *
     *  [1, 2, '3', '4', '5'].include(3);
     *  // -> true ('3' == 3)
     * </pre>
     * 
     * @function {public Array} ?
     * Invokes the same method, with the same arguments, for all items in a collection. Returns an array of the results of the method calls.
     * @param {String} method - name of the method to invoke.
     * @param {optional ...} args - optional arguments to pass to the method.
     * @returns array of the results of the method calls.
     **/
    invoke: function(method) {
      var args = $.makeArray(arguments).slice(1);
      return this.map(function(value) {
        return value[method].apply(value, args);
      });
    },

    /**
     * Elements are either compared directly, or by first calling `iterator` and comparing returned values.
     * If multiple "max" elements (or results) are equivalent, the one closest
     * to the end of the enumeration is returned.
     *
     * If provided, `iterator` is called with two arguments: The element being
     * evaluated, and its index in the enumeration; it should return the value
     * `max` should consider (and potentially return).
     *
     * <h6>Examples:</h6>
     * <pre>
     *  ['c', 'b', 'a'].max();
     *  // -> 'c'
     *
     *  [1, 3, '3', 2].max();
     *  // -> '3' (because both 3 and '3' are "max", and '3' was later)
     *
     *  ['zero', 'one', 'two'].max(function(item) { return item.length; });
     *  // -> 4
     * </pre>
     * 
     * @function {public ?} ?
     * Returns the maximum element (or element-based `iterator` result), or `undefined` if the enumeration is empty.
     * @param {optional Function} iterator - An optional function to use to evaluate each element in the enumeration; the function should return the value to test. If this is not provided, the element itself is tested.
     * @param {optional Object} context - the scope in which to call <tt>iterator</tt>. Affects what the keyword <tt>this</tt> means inside <tt>iterator</tt>.
     * @returns maxiumum element of the enumeration
     **/
    max: function(iterator, context) {
      iterator = iterator || Function.identityFn;
      var result;
      this.each(function(value, index) {
        value = iterator.call(context, value, index);
        if (result == null || value >= result)
          result = value;
      });
      return result;
    },

    /**
     * Elements are either compared directly, or by first calling `iterator` and comparing returned values.
     * If multiple "min" elements (or results) are equivalent, the one closest
     * to the beginning of the enumeration is returned.
     *
     * If provided, `iterator` is called with two arguments: The element being
     * evaluated, and its index in the enumeration; it should return the value
     * `min` should consider (and potentially return).
     *
     * <h6>Examples:</h6>
     * <pre>
     *  ['c', 'b', 'a'].min();
     *  // -> 'a'
     *
     *  [3, 1, '1', 2].min();
     *  // -> 1 (because both 1 and '1' are "min", and 1 was earlier)
     *
     *  ['un', 'deux', 'trois'].min(function(item) { return item.length; });
     *  // -> 2
     * </pre>
     *
     * @function {public ?} ?
     * Returns the minimum element (or element-based `iterator` result), or `undefined` if the enumeration is empty.
     * @param {optional Function} iterator - An optional function to use to evaluate each element in the enumeration; the function should return the value to test. If this is not provided, the element itself is tested.
     * @param {optional Object} context - the scope in which to call <tt>iterator</tt>. Affects what the keyword <tt>this</tt> means inside <tt>iterator</tt>.
     * @returns minimum element of the enumeration
     **/
    min: function(iterator, context) {
      iterator = iterator || Function.identityFn;
      var result;
      this.each(function(value, index) {
        value = iterator.call(context, value, index);
        if (result == null || value < result)
          result = value;
      });
      return result;
    },

    /**
     * <h6>Examples:</h6>
     * <pre>
     *  ['hello', 'world', 'this', 'is', 'nice'].property('length');
     *  // -> [5, 5, 4, 2, 4]
     *
     *  ['hello', 'world'].invoke('substring', 0, 3);
     *  // -> ['hel', 'wor']
     *
     *  [1, 2, '3', '4', '5'].include(3);
     *  // -> true ('3' == 3)
     * </pre>
     *
     * @function {public Array} ?
     * Fetches the same property for all items in a collection. Returns an array of the results of the property values.
     * @param {String} property - name of the property to return.
     * @returns array of the values of property on collection items
     **/
    property: function(property) {
      var results = [];
      this.each(function(value) {
        results.push(value[property]);
      });
      return results;
    },

    /**
     * <h6>Example:</h6>
     * <pre>
     *  [1, 'two', 3, 'four', 5].select($.isString);
     *  // -> ['two', 'four']
     * </pre>

     * @function {public Array} ?
     * Returns all the elements for which the iterator returned a truthy value.
     * @param {Function} iterator - An iterator function to use to test the elements.
     * @param {optional Object} context - the scope in which to call <tt>iterator</tt>. Affects what the keyword <tt>this</tt> means inside <tt>iterator</tt>.
     * @returns array of elements for which iterater returned true
     **/
    select: function(iterator, context) {
      var results = [];
      this.each(function(value, index) {
        if (iterator.call(context, value, index))
          results.push(value);
      });
      return results;
    },

    /**
     * @function {public int} ?
     * Returns sum of all collection items (or element-based `iterator` result), or `0` if the enumeration is empty.
     * @param {optional Function} iterator - An optional function to use to evaluate each element in the enumeration; the function should return the value to add to sum. If this is not provided, the element itself is added.
     * @param {optional Object} context - the scope in which to call <tt>iterator</tt>. Affects what the keyword <tt>this</tt> means inside <tt>iterator</tt>.
     * @returns sum of all collection items
     */
    sum: function(iterator, context) {
      iterator = iterator || Function.identityFn;
      var result = 0;
      this.each(function(value, index) {
        value = iterator.call(context, value, index);
        result += value;
      });
      return result;
    }

  };

  //define some aliases
  /** @function {public Array} ? alias for {@link collect} */
  Enumerable.map = Enumerable.collect;

  //add module to jquery ext modules collection
  $.ext.mixins.Enumerable = Enumerable;


})(jQuery);(function($) {

  /**
   * @namespace Array
   * <p>@depends $.ext.mixins.Enumerable</p>
   */
  var mixin = {

    /**
     * <h6>Example:</h6>
     * <pre>
     *  var stuff = ['Apple', 'Orange', 'Juice', 'Blue'];
     *  stuff.clear();
     *  // -> []
     *  stuff
     *  // -> []
     * </pre>
     *
     * @function {public Array} ?
     * Clears the array (makes it empty) and returns the array reference.
     *
     * @returns new string with all whiteshapce removed from the start and end of this string
     */
    clear: function() {
      this.length = 0;
      return this;
    },

    /**
     * @function {public Array} ?
     * Returns a duplicate of the array, leaving the original array intact.
     **/
    clone: function() {
      return Array.prototype.slice.call(this, 0);
    },

    /**
     * @function {public ?} ?
     * Returns array's first item (e.g. <tt>array[0]</tt>).
     **/
    first: function() {
      return this[0];
    },

    /**
     * @function {public ?} ?
     * Returns array's last item (e.g. <tt>array[array.length - 1]</tt>).
     **/
    last: function() {
      return this[this.length - 1];
    },

    /**
     * <h6>Example:</h6>
     * <pre>
     *  [3, 5, 6, 1, 20].indexOf(1)
     *  // -> 3
     *
     *  [3, 5, 6, 1, 20].indexOf(90)
     *  // -> -1 (not found)
     *
     *  ['1', '2', '3'].indexOf(1);
     *  // -> -1 (not found, 1 !== '1')
     * </pre>
     *
     * @function {public int} ?
     * Returns the index of the first occurrence of <tt>item</tt> within the array,
     * or <tt>-1</tt> if <tt>item</tt> doesn't exist in the array. Compares items using *strict equality* (===).
     * @param {?} item - value that may or may not be in the array.
     * @param {optional int} offset - number of initial items to skip before beginning the search.
     * @returns index of first occurence of <tt>item</tt> in the array or <tt>-1</tt> if not found.
     **/
    indexOf: function(item, i) {
      i = i || 0;
      var length = this.length;
      if (i < 0) i = length + i;
      for (; i < length; i++)
        if (this[i] === item) return i;
      return -1;
    },

    /**
     * @function {public int} ?
     * Returns the position of the last occurrence of <tt>item</tt> within the array or <tt>-1</tt> if <tt>item</tt> doesn't exist in the array.
     * @param {?} item - value that may or may not be in the array.
     * @param {optional int} offset - number of items at the end to skip before beginning the search.
     * @returns position of the last occurrence of <tt>item</tt> within the array or <tt>-1</tt> if not found
     * @see indexOf
     **/
    lastIndexOf: function(item, i) {
      i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
      var n = this.slice(0, i).reverse().indexOf(item);
      return (n < 0) ? n : i - n - 1;
    },

    /**
     * @function {public Array} ?
     * Remove item at specified index. Modifies this instance of array.
     * @param {int} index - index to remove item at
     * @return this array instance
     */
    removeAt: function(index) {
      if (index < 0) throw 'index cant be negative';
      var rest = this.slice(index + 1);
      this.length = index;
      this.push.apply(this, rest);
      return this;
    },

    /**
     * @function {public Array} ?
     * Remove given item from this array instance. Note if multiple occurences of this item are present, only the first one is removed.
     * @param {?} item - remove this item from array
     * @returns this array instance
     */
    remove: function(item) {
      var index = this.indexOf(item);
      if (index >= 0) this.removeAt(index);
      return this;
    },

    /**
     * @function {public void} ?
     * This method is required for mixin in the enumerable module. Uses javascript 1.6 native implementation if present.
     * @param iterator
     * @param context
     */
    _each: function(iterator, context) {
      for (var i = 0, length = this.length >>> 0; i < length; i++) {
        if (i in this) iterator.call(context, this[i], i, this);
      }
    }

  };

  // use native browser JS 1.6 implementation if available
  if (Array.prototype.indexOf){ delete mixin.indexOf; }
  if (Array.prototype.lastIndexOf){ delete mixin.lastIndexOf; }
  if (Array.prototype.forEach){ mixin._each = Array.prototype.forEach; }


  $.extend(Array.prototype, mixin);
  $.extend(Array.prototype, $.ext.mixins.Enumerable);


})(jQuery);jQuery.extend(Date.prototype, /** @scope Date */{

  /**
   * @function {public long} ?
   * Returns number of miliseconds between given date and this date. If date is not given, return number of miliseconds elapsed from now
   * @param {optional Date} from - calculate elapsed miliseconds from this date to given from date. Defaults to now date.
   * @returns number of miliseconds between given date and this date. if date is not given, return number of miliseconds elapsed from now
   */
  getElapsed: function(from) {
    return Math.abs((from || new Date()).getTime()-this.getTime());
  }

});(function($) {

  $.extend(Function, {
    /**
     * @property {public static Function} Function.?
     * Empty function that does nothing (can be reused in default options when callback is being expected)
     */
    emptyFn: function() {
    },

    /**
     * @property {public static Function} Function.?
     * Identity function that returns the first passed argument or undefined
     */
    identityFn: function(value) {
      return value;
    }

  });

  $.extend(Function.prototype, {

    /**
     * Whenever the resulting "bound" function is called, it will call the original ensuring that this is set to context.
     * Also optionally curries arguments for the function (meaning you can burn arguments in when binding and they will be passed to the function)
     * @function {public Function} Function.?
     * Binds this function to the given context by wrapping it in another function and returning the wrapper.
     * @param {Object} context - the object in which context this function will be invoked (this variable will be context)
     * @returns wrapped function with context and bind arguments burnt in.
     */
    bind: function(context) {
      if (arguments.length < 2 && $.isUndefined(arguments[0])) {
        return this;
      }

      var self = this;
      var bindArgs = null; //remove context argument
      if (arguments.length > 1) {
        bindArgs = Array.prototype.slice.call(arguments, 1);
      }

      return function() {
        //append method arguments to bind arguments and call the original function in context
        var a = arguments;
        if (bindArgs) {
          a = bindArgs;
          if (arguments.length > 0) {
            var aLength = a.length, argsLength = arguments.length;
            while (argsLength--) {
              a[aLength + argsLength] = arguments[argsLength]; //this is the fastest was of appending elements to array
            }
          }
        }
        return self.apply(context, a);
      };
    }

  });

})(jQuery);jQuery.extend(RegExp, {

    /**
     * @function {public String} RegExp.?
     * Escapes the passed string for use in a regular expression
     * @param {String} str - string in which special regular expression character will be escaped
     * @returns escaped regular expession string
     */
    escape : function(str) {
      return str.replace(/([-.*+?^${}()|[\]\/\\])/g, "\\$1");
    }

  });
jQuery.extend(String.prototype, /** @scope String */{

  /**
   * @function {public String} ?
   * Returns copy of this string when first letter is uppercase and other letters downcased
   * @returns copy of this string when first letter is uppercase and other letters downcased
   */
  capitalize: function() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
  },

  /**
   * <pre>
   * "This is a {0} string using the {1} method".format("formatted", "inline")
   * //will return: "This is a formatted string using the inline method"
   * </pre>
   *
   * @function {public String} ?
   * Replace this string {0},{1},{2}... tokens (variables) with passed arguments.
   * {0} corresponds to first argument, {1} to second, etc.
   * @param  {String...} args - variable number of arguments to act as variables into the string format
   * @returns formatted string as described above
   */
  format: function() {
    var txt = this;
    for (var i = 0; i < arguments.length; i++) {
      var exp = new RegExp('\\{' + (i) + '\\}', 'gm');
      txt = txt.replace(exp, arguments[i]);
    }
    return txt;
  },

  /**
   * @function {public boolean} ?
   * This method checks if this string starts with given string as parameter
   * @param {String} other - string to check if this string starts with
   * @returns true if this string starts with given string
   */
  startsWith: function(other) {
    return this.lastIndexOf(other, 0) === 0;
  },

  /**
   * @function {public boolean} ?
   * This method checks if given string is included in this string
   * @param anotherString {String} - check if it is contained in this string instance
   * @returns true if given string is included in this string
   */
  contains: function(anotherString) {
    return this.indexOf(anotherString) != -1;
  },

  /**
   * @function {public boolean} ?
   * This method checks if this string ends with given string as parameter
   * @param {String} other - string to check if this string ends with
   * @returns true if this string ends with given string
   */
  endsWith: function(other) {
    var d = this.length - other.length;
    return d >= 0 && this.indexOf(other, d) === d;
  },

  /**
   * @function {public String} ?
   * Removes all whitespace from start and end of this string
   * @returns new string with all whiteshapce removed from the start and end of this string
   */
  trim: function() {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
  },

  /**
   * @function {public String} ?
   * Converts a camelized string into a series of words separated by an underscore (_)
   * @returns all camelized letters converted to undercase with _ between them
   */
  underscore: function() {
    return this.replace(/::/g, '/')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
      .replace(/([a-z\d])([A-Z])/g, '$1_$2')
      .replace(/-/g, '_')
      .toLowerCase();
  }

});
(function($) {

  /**
   * @object {public static} $.Event.Keys
   * Defines contants for common keycode mappings
   */
  $.Event.Keys = {
    /** @variable ? backspace key */
    BACKSPACE: 8,
    /** @variable ? tab key */
    TAB: 9,
    /** @variable ? alias for enter key */
    RETURN: 13,
    /** @variable ? enter key */
    ENTER: 13,
    /** @variable ? esc key */
    ESC: 27,
    /** @variable ? left arrow key */
    LEFT: 37,
    /** @variable ? up arrow key */
    UP: 38,
    /** @variable ? right arrow key */
    RIGHT: 39,
    /** @variable ? down arrow key */
    DOWN: 40,
    /** @variable ? backspace key */
    DELETE: 46,
    /** @variable ? home key */
    HOME: 36,
    /** @variable ? end key */
    END: 35,
    /** @variable ? page up key */
    PAGE_UP: 33,
    /** @variable ? page down key */
    PAGE_DOWN: 34,
    /** @variable ? insert key */
    INSERT: 45
  };

  $.extend($.Event.prototype,
    /**
     * @class $.Event
     * jQuery event object extended functionality documentation
     */
    {

    /**
     * @function {public void} ?
     * Stop event propagation and prevent default action
     */
    stopEvent: function() {
      this.preventDefault();
      this.stopPropagation();
    },

    /**
     * @function {public boolean} ?
     */
    isSpecialKey : function() {
      var k = this.which;
      return  (this.ctrlKey) || this.isNavKeyPress() ||
        (k == $.Event.Keys.BACKSPACE) || // Backspace
        (k >= 16 && k <= 20) || // Shift, Ctrl, Alt, Pause, Caps Lock
        (k >= 44 && k <= 46);   // Print Screen, Insert, Delete
    },

    /**
     * @function {public boolean} ?
     * This method checks if key that was pressed was navigation key: tab, enter, esc, arrow keys, pageup/down, home or end
     * @returns true if navigation key was pressed
     */
    isNavKeyPress : function() {
      var k = this.which;
      return (k >= 33 && k <= 40) || // Page Up/Down, End, Home, Left, Up, Right, Down
        k == $.Event.Keys.RETURN || k == $.Event.Keys.TAB || k == $.Event.Keys.ESC;
    },

    /**
     * @function {public boolean} ?
     */
    isBackspaceKey: function() {
      return this.which == $.Event.Keys.BACKSPACE;
    },

    /**
     * @function {public boolean} ?
     */
    isDeleteKey: function() {
      return this.which == $.Event.Keys.DELETE;
    },

    /**
     * @function {public boolean} ?
     */
    isTabKey: function() {
      return this.which == $.Event.Keys.TAB;
    },

    /**
     * @function {public boolean} ?
     */
    isEnterKey: function() {
      return this.which == $.Event.Keys.RETURN;
    },

    /**
     * @function {public boolean} ?
     */
    isEscKey: function() {
      return this.which == $.Event.Keys.ESC;
    },

    /**
     * @function {public boolean} ?
     */
    isUpKey: function() {
      return this.which == $.Event.Keys.UP;
    },

    /**
     * @function {public boolean} ?
     */
    isDownKey: function() {
      return this.which == $.Event.Keys.DOWN;
    }

  });


})(jQuery);jQuery.ext.Extender.addUtilityMethods({

  /**
   * @namespace System information object parsed from browser navigator.userAgent property
   * @memberOf $
   */
  systemInfo: function() {

    var ua = navigator.userAgent.toLowerCase();

    /** @ignore */
    var check = function(r) {
      return r.test(ua);
    };


    var info = {
      browser: { },
      os: {}
    };

    info.browser.isStrict = document.compatMode == "CSS1Compat";
    info.browser.isSecure = /^https/i.test(window.location.protocol);

    info.browser.isOpera = check(/opera/);
    info.browser.isChrome = check(/\bchrome\b/);
    info.browser.isWebKit = check(/webkit/);
    info.browser.isSafari = !info.browser.isChrome && check(/safari/);
    info.browser.isSafari2 = info.browser.isSafari && check(/applewebkit\/4/); // unique to Safari 2
    info.browser.isSafari3 = info.browser.isSafari && check(/version\/3/);
    info.browser.isSafari4 = info.browser.isSafari && check(/version\/4/);
    info.browser.isIE = !info.browser.isOpera && check(/msie/);
    info.browser.isIE7 = info.browser.isIE && check(/msie 7/);
    info.browser.isIE8 = info.browser.isIE && check(/msie 8/);
    info.browser.isIE6 = info.browser.isIE && !info.browser.isIE7 && !info.browser.isIE8;
    info.browser.isGecko = !info.browser.isWebKit && check(/gecko/);
    info.browser.isGecko2 = info.browser.isGecko && check(/rv:1\.8/);
    info.browser.isGecko3 = info.browser.isGecko && check(/rv:1\.9/);
    info.browser.isBorderBox = info.browser.isIE && !info.browser.isStrict;

    info.os.isWindows = check(/windows|win32/);
    info.os.isMac = check(/macintosh|mac os x/);
    info.os.isAir = check(/adobeair/);
    info.os.isLinux = check(/linux/);

    return info;

  }()

}, true);(function($) {

  /**
   * @namespace $.ext.mixins.Observable
   * This is a module (=mixin), that can be included in any object prototype to provide that object instances with
   * event handling capabilities.
   */
  var ObservableModule = {

    __initListeners: function(eventName) {
      this.__listeners = this.__listeners || {};
      this.__listeners[eventName] = this.__listeners[eventName] || [];
    },

    /**
     * There are 3 parameter forms, see below for detailed parameter information. Examples:
     * <pre>
     *   //Bind single event to handler
     *   obj.on('someEvent', handlerFunc, scope, [arg1, arg2, arg3]);
     *
     *   //Bind multiple events to the same handler
     *   obj.on('event1 event2 event3', handlerFunc, scope, [arg1, arg2, arg3]);
     *
     *   //Bind multiple events to different handles with the same scope and bind args:
     *   obj.on({
     *    event1: handlerFunc1,
     *    event2: handlerFunc2,
     *    scope: sameScopeObj,
     *    args: [1,2,3]
     *   });
     *
     *   //Bind multiple events to different handles with various scope and bind args:
     *   obj.on({
     *    event1: { fn: handlerFunc1, scope: otherObj1, args: [1,2,3] },
     *    event2: { fn: handlerFunc2, scope: otherObj2, args: [4,5,6] }
     *   });
     * </pre>
     * 
     * @function {public void} ?
     * Add listener to this object.
     * @paramset Classic
     * @param {String} eventName - name of the event (or multiple events names separated by space)
     * @param {Function} handler - function to invoke when event is fired
     * @param {optional Object} scope - the scope to invoke handler function in. If not specified or null, defaults to the object firing the event
     * @param {optional Object} args - arguments to pass to the handler function as part of the event object (bindArgs property of the event object)
     * <pre>
     *   //<b>Bind single event to handler</b>: <u>someEvent</u> of <u>obj</u> will be bound to <u>handlerFunc</u> which will be
     *   //invoked in scope <u>scope</u>, and event object <u>bindArgs</u> property will be <u>[arg1, arg2, arg3]</u>
     *   obj.on('someEvent', handlerFunc, scope, [arg1, arg2, arg3]);
     *
     *   //Bind multiple events to the same handler
     *   obj.on('event1 event2 event3', handlerFunc, scope, [arg1, arg2, arg3]);
     * </pre>
     *
     * @paramset Config object - type 1
     * @param {Object} options - configuration hash with keys being event names and values handler functions. In addition, scope and args keys can be specified.
     * @... {Function} eventName1 - key is the event name, value is handler function
     * @... {optional Object} scope - the scope to invoke all handler functions in. If not specified or null, defaults to the object firing the event
     * @... {optional Object} args - arguments to pass to all handler functions as part of the event object (bindArgs property of the event object)
     * <pre>
     *   //Bind multiple events to different handles with the same scope and bind args:
     *   obj.on({
     *    event1: handlerFunc1,
     *    event2: handlerFunc2,
     *    scope: sameScopeObj,
     *    args: [1,2,3]
     *   });
     * </pre>
     *
     * @paramset Config object - type 2
     * @param {Object} options - configuration hash with keys being event names and values configuration objects. In addition, scope and args keys can be specified.
     * @... {Function} eventName1 - key is the event name, value is configuration object with the following keys:
     * <ul>
     *   <li><code><span class="type">Function</span> fn</code> - function to invoke when event is fired</li>
     *   <li><code>[ <span class="type">Object</span> scope ]</code> - scope to invoke fn in</li>
     *   <li><code>[ <span class="type">Object</span> args ]</code> - bind args to pass as part of event object</li>
     * </ul>
     * @... {optional Object} scope - the scope to invoke all handler functions in. If not specified or null, defaults to the object firing the event
     * @... {optional Object} args - arguments to pass to all handler functions as part of the event object (bindArgs property of the event object)
     *
     * <pre>
     *   //Bind multiple events to different handles with various scope and bind args:
     *   obj.on({
     *    event1: { fn: handlerFunc1, scope: otherObj1, args: [1,2,3] },
     *    event2: { fn: handlerFunc2, scope: otherObj2, args: [4,5,6] }
     *   });
     * </pre>
     */
    addListener: function(eventName, handler, scope, args) {
      if ($.type(eventName) === "string" && eventName.length > 0) { //event name is string: use form1
        if (eventName.indexOf(' ') == -1) {
          handler = handler || null;
          var listenerObj = {fn: handler, scope: scope || this, args: args || null};
          if (!this.hasListener(eventName, listenerObj.fn, listenerObj.scope, listenerObj.args)) {
            this.__initListeners(eventName);
            this.__listeners[eventName].push(listenerObj);
          }
        } else { //attach multiple events to the same handler, e.g: obj.on('focus blur', function(e){ alert(e) })
          var eventNames = eventName.split(' ');
          for (var i = 0; i < eventNames.length; i++) {
            this.addListener.call(this, eventNames[i], handler, scope, args);
          }
        }
      } else { //event name is object (use form2): attaching multiple listeners to multiple events
        var globalOpts = eventName;
        for (var name in globalOpts) {
          if (name != 'scope' && name != 'args'){ //skip scope and args keys (can't be event names)
            var eventOptsOrHandler = globalOpts[name];
            this.addListener(name, eventOptsOrHandler.fn || eventOptsOrHandler, eventOptsOrHandler.scope || globalOpts.scope, {args: eventOptsOrHandler.args || globalOpts.args});
          }
        }
      }
      return this;
    },

    /**
     * Usages:
     *  - Remove specific listener for event: obj.removeListener('someEvent', eventListener)
     *  - Remove all listeners for event: obj.removeListener('someEvent')
     *  - Remove all events: myObject.un()
     *  - Remove multiple listeners for events (if listener value for event is null - all listeners for this event will be unbound):
     *          obj.un({event1: event1Listener, event2: event2Listener, event3: null, ...});
     *  - Remove all listeners for multiple events: myObject.un('event1 event2 event3');
     * @function {public Object} ?
     * Remove listeners from this object.
     */
    removeListener: function(eventName, handler, options) {
      if ($.type(eventName) === "string" && eventName.length > 0) {
        if (eventName.indexOf(' ') == -1) {
          this.__initListeners(eventName);
          if (arguments.length == 1) { //remove all listeners for this eventName
            this.__listeners[eventName].clear();
          } else {
            options = options || {};
            var l = this.findListener(eventName, handler, options.scope || this, options.args || null);
            if (l !== null) {
              this.__listeners[eventName].remove(l);
            }
          }
        } else { //attach multiple events to the same handler, e.g: obj.on('focus blur', function(e){ alert(e) })
          var eventNames = eventName.split(' ');
          for (var i = 0; i < eventNames.length; i++) {
            this.removeListener.call(this, eventNames[i], handler, options);
          }
        }
      } else { //event name is object, attaching multiple listeners to multiple events
        var globalOpts = eventName;
        for (var name in globalOpts) {
          if (name != 'scope' && name != 'args'){ //skip scope and args keys (can't be event names)
            var eventOptsOrHandler = globalOpts[name];
            this.removeListener(name, eventOptsOrHandler.fn || eventOptsOrHandler, eventOptsOrHandler.scope || globalOpts.scope, {args: eventOptsOrHandler.args || globalOpts.args});
          }
        }
      }
      return this;
    },

    /**
     * @function {public boolean} ?
     * Checks if this object has listener.
     * @param eventName
     * @param fn
     * @param scope
     * @param args
     * @returns true if this object has listener for given eventName, handler function scope and args
     */
    hasListener: function(eventName, fn, scope, args) {
      return this.findListener(eventName, fn, scope, args) !== null;
    },

    /**
     * @function {public Object} ?
     * Find listener metadata object that corresponds to given parameters
     * @param eventName
     * @param fn
     * @param scope
     * @param args
     * @returns listenerObject
     * @... {Function} fn - handler function
     * @... {Object} scope - scope in which to invoke handler function
     * @... {Object} args - arguments to pass as part of event
     */
    findListener: function(eventName, fn, scope, args) {
      this.__initListeners(eventName);
      var listeners = this.__listeners[eventName];
      for (var i = 0; i < listeners.length; i++) {
        var l = listeners[i];
        if (l.fn == fn && l.scope == scope && l.args == args){
          return l;
        }
      }
      return null;
    },

    /**
     * Note if one of the listeners throws an error, other listeners don't get invoked, and error is propagated. If your
     * listener can throw error, but you want to allow normal excecution, wrap your listener code in try/catch.
     * 
     * @function {public Array} ?
     * Fire all registered listeners for given event name.
     * @param {String} eventName - event name to fire listeners for
     * @param args... - arguments to pass to handler functions after the event object
     * @returns array of listeners return values (in the order of invokation) or false if excecution has been terminated by returning $.ext.$break from handler function (listener)
     */
    fireListener: function(eventName) {
      this.__initListeners(eventName);
      var listenersReturnValues = [];
      var args = $.makeArray(arguments).slice(1); //remove eventName (first argument)
      var e = {eventName: eventName, source: this, bindArgs: null}; //event object
      args.unshift(e); //add event object as the first parameter to the arguments list
      for (var i = 0; i < this.__listeners[eventName].length; ++i) {
        var l = this.__listeners[eventName][i];
        e.bindArgs = l.args;

        var res = l.fn.apply(l.scope, args) || null; //apply listener

        if(res == $.ext.$break){
          return false;
        }

        listenersReturnValues.push(res);
      }
      return listenersReturnValues;
    }

  };

  //define some aliases
  /** @function {public void} ? alias for {@link addListener} */
  ObservableModule.on = ObservableModule.addListener;
  /** @function {public void} ? alias for {@link removeListener} */
  ObservableModule.un = ObservableModule.removeListener;
  /** @function {public Array} ? alias for {@link fireListener} */
  ObservableModule.fire = ObservableModule.fireListener;

  //add module to jquery ext modules collection
  $.ext.mixins.Observable = ObservableModule;

})(jQuery);

(function($) {

  $.ext = $.ext || {};

  /**
   * @namespace $.ext.Class
   * This module defines methods for handling class creation and inheritance.
   */
  $.ext.Class = (function() {
    var __extending = {};

    var ClassMetaDataMixin = {

      getSuperClassMetaData: function() {
        return this.getClassMetaData().superClassMetaData;
      },

      getClassMetaData: function() {
        return this.__clsMetaData;
      },

      /**
       * @return reference to class constructor function (like Horizon.ui.components.Component)
       */
      getClassConstructor: function() {
        return this.getClassMetaData().classConstructor;
      },

      /**
       *
       * @param full (boolean) - if return full name including namespace
       * @return (string) name of the class. if full parameter is true, full name including namespace will be returned
       */
      getClassName: function(full) {
        var cmd = this.getClassMetaData();
        return full ? cmd.fullClassName : cmd.className;
      },

      /**
       * @return (string) namespace this class resides in (if the class is global object, empty string will be returned)
       */
      getNamespace: function() {
        return this.getClassMetaData().namespace;
      },

      /**
       * Check if this class is instance of given class (including inheritance)
       * @param fullClassNameOrConstructor (String | Function) - string with full class name or construction function reference
       * @return (boolean) return true if this class is instance of given full class name (string) or class reference (constructor function)
       */
      instanceOf: function(fullClassNameOrConstructor) {
        return typeof(fullClassNameOrConstructor) == 'string' ? this.__instanceOfByString(fullClassNameOrConstructor) : this.__instanceOfByClass(fullClassNameOrConstructor);
      },

      __instanceOfByString: function(fullClassName) {
        if (this.getClassName(true) == fullClassName) return true;
        var superClassMetaData = this.getSuperClassMetaData();
        while (superClassMetaData) {
          if (superClassMetaData.fullClassName == fullClassName) return true;
          superClassMetaData = superClassMetaData.superClassMetaData;
        }
        return false;
      },

      __instanceOfByClass: function(classConstructor) {
        if (this.getClassConstructor() == classConstructor) return true;
        var superClassMetaData = this.getSuperClassMetaData();
        while (superClassMetaData) {
          if (superClassMetaData.classConstructor == classConstructor) return true;
          superClassMetaData = superClassMetaData.superClassMetaData;
        }
        return false;
      }
    };

    var Inheritance =
      /** @scope $.ext.Class */
      {

      /**
       * @function {public static Class} ?
       * @param {String} fullClassName
       * @param {Class} classParent
       * @param {Object} classDefinition
       */
      create: function(fullClassName, classParent, classDefinition) {
        if (arguments.length == 1) { //no inheritance and no className
          classDefinition = fullClassName;
          classParent = null;
          fullClassName = 'Object';
        } else if (arguments.length == 2) {
          if (typeof(fullClassName) == 'function') { //no className, inheritance only
            classDefinition = classParent;
            classParent = fullClassName;
            fullClassName = 'Object';
          } else if (typeof(fullClassName) == 'string') { //no inheritance, with class name
            classDefinition = classParent;
            classParent = null;
          }
        }

        //this is the class constructor (which in js is simply a function) that will be returned
        var func = function() {
          if (arguments[0] == __extending) {
            return;
          }
          this.initialize.apply(this, arguments);
        };

        //add basic class names handling functions
        func.prototype.initialize = function() {
          //do nothing
        };

        //if there is inheritance
        if (typeof(classParent) == 'function') {
          func.prototype = new classParent(__extending);
          func.prototype.superClass = classParent.prototype;
        }

        //generate className info
        func.prototype.__clsMetaData = {
          classConstructor: func,
          superClassMetaData: func.prototype.__clsMetaData || null,
          fullClassName: fullClassName,
          className: function() {
            var dotIndex = fullClassName.lastIndexOf('.');
            return dotIndex == -1 ? fullClassName : fullClassName.substring(dotIndex + 1);
          }(),
          namespace: function() {
            var dotIndex = fullClassName.lastIndexOf('.');
            return dotIndex == -1 ? "" : fullClassName.substring(0, dotIndex);
          }()
        };

        //apply mixings
        var mixins = [];

        if (!func.prototype.getClassName) mixins.push(ClassMetaDataMixin);

        if (classDefinition && classDefinition.include) {
          if (classDefinition.include.reverse) {
            // methods defined in later mixins should override prior
            mixins = mixins.concat(classDefinition.include.reverse());
          } else {
            mixins.push(classDefinition.include);
          }
          delete classDefinition.include; // clean syntax sugar
        }
        if (classDefinition) Inheritance.inherit(func.prototype, classDefinition);
        for (var i = 0; (mixin = mixins[i]); i++) {
          Inheritance.mixin(func.prototype, mixin);
        }

        //set namespace
        if (func.prototype.__clsMetaData.namespace.length > 0) {
          var ns = Inheritance.namespace(func.prototype.__clsMetaData.namespace);
          ns[func.prototype.__clsMetaData.className] = func;
        }
        return func;
      },

      mixin: function (dest, src, clobber) {
        clobber = clobber || false;
        if (typeof(src) != 'undefined' && src !== null) {
          for (var prop in src) {
            if (clobber || (!dest[prop] && typeof(src[prop]) == 'function')) {
              dest[prop] = src[prop];
            }
          }
        }
        return dest;
      },

      inherit: function(dest, src, fname) {
        if (arguments.length == 3) {
          var ancestor = dest[fname], descendent = src[fname], method = descendent;
          descendent = function() {
            var ref = this.superMethod;
            this.superMethod = ancestor;
            var result = method.apply(this, arguments);
            ref ? this.superMethod = ref : delete this.superMethod;
            return result;
          };
          // mask the underlying method
          descendent.valueOf = function() {
            return method;
          };
          descendent.toString = function() {
            return method.toString();
          };
          dest[fname] = descendent;
        } else {
          for (var prop in src) {
            if (dest[prop] && typeof(src[prop]) == 'function') {
              Inheritance.inherit(dest, src, prop);
            } else {
              dest[prop] = src[prop];
            }
          }
        }
        return dest;
      },

      /**
       * @function {public static Class} ?
       */
      singleton: function() {
        var args = arguments;
        if (args.length == 2 && args[0].getInstance) {
          var klass = args[0].getInstance(__extending);
          // we're extending a singleton swap it out for it's class
          if (klass) {
            args[0] = klass;
          }
        }

        return (function(args) {
          // store instance and class in private variables
          var instance = false;
          var klass = Inheritance.create.apply(args.callee, args);
          return {
            getInstance: function () {
              if (arguments[0] == __extending) return klass;
              if (instance) return instance;
              return (instance = new klass());
            }
          };
        })(args);
      },

      /**
       * Specifying the last node of a namespace implicitly creates all other nodes. Usage:
       * <pre>
       *  //will make sure global (window) variable org with property myorg with property utils is present
       *  $.ext.Class.namespace('org.myorg.utils');
       *  org.myorg.utils.Widget = function() { ... }
       *  org.myorg.MyClass = function(config) { ... }
       * </pre>
       * @function {public static Object} ?
       * Creates namespaces to be used for scoping variables and classes so that they are not global.
       * @param {String} ns - namespace string
       * @returns The namespace object. (the last namespace created)
       */
      namespace: function(ns) {
        ns = ns || "";
        var nsArray = ns.split(".");
        var globalVar = nsArray[0];
        var obj = window[globalVar] = window[globalVar] || {};
        var arr = nsArray.slice(1);
        for (var j = 0; j < arr.length; j++) {
          var v2 = arr[j];
          obj = obj[v2] = obj[v2] || {};
        }
        return obj;
      }
    };

    return Inheritance;

  })();

})(jQuery);

jQuery.ext.Extender.addWrapedSetMethods({

  bindLater: function(type, data, fn, when) {
    var timeout = 200;
    if (arguments.length == 4){
      timeout = Array.prototype.pop.call(arguments); //full form: $().bind('click', {arg1: 2, arg2: 'asdf'}, function(){ //do stuff}, 4000);
    }
    else if (arguments.length == 3 && jQuery.isFunction(data) && jQuery.isNumber(fn)) {
      timeout = Array.prototype.pop.call(arguments);
    }
    else if (arguments.length == 2 && typeof type === "object" && jQuery.isNumber(data)) {
      timeout = Array.prototype.pop.call(arguments);
    }

    var self = this;
    var args = arguments;
    window.setTimeout(function() {
      self.bind.apply(self, args);
    }, timeout);
    return this;
  }

}, true);jQuery.ext.Extender.addWrapedSetMethods(
  /**
   * @namespace $()
   * jQuery wrapped set methods
   */
  {

    /**
     * Return object that contains this element top,left,bottom,right coordinates relative to the document
     * @param outer (default true) - outerWidth/outerHeight (including padding and borders) coordinates are returned.
     */
    region: function(outer) {
      var self = jQuery(this);
      
      var offset = self.offset();
      var top = Math.ceil(offset.top);
      var left = Math.ceil(offset.left);
      var w, h;
      if (outer === false) {
        w = self.width();
        h = self.height();
      } else {
        w = self.outerWidth();
        h = self.outerHeight();
      }
      return {top: top, left: left, right: left + w, bottom: top + h};
    },

    outerHeight: function(outerOrHeight, includeMargins) {
      if (!this[0]) return null;

      if (jQuery.isNumber(outerOrHeight)) { //set outerHeight of component
        var delta = this.jq_original_outerHeight(includeMargins) - this.height();
        return this.height(outerOrHeight - delta);
      } else { //invoke original jquery getter
        return this.jq_original_outerHeight.apply(this, arguments);
      }
    },

    outerWidth: function(outerOrWidth, includeMargins) {
      if (!this[0]) return null;

      if (jQuery.isNumber(outerOrWidth)) {
        var delta = this.jq_original_outerWidth(includeMargins) - this.width();
        return this.width(outerOrWidth - delta);
      } else { //invoke original jquery getter
        return this.jq_original_outerWidth.apply(this, arguments);
      }
    },

    /**
     * @function {public boolean} ?
     * Return true if this element is contained inside one of the given parents.
     * @param {Array} possibleParents - array of jQuery wrapped sets or plain elements which are the parents to search for containment of this element
     * @returns true if first element of the wrapped set is contained in at least one of the given parents
     */
    containedIn: function(possibleParents) {
      if (!this[0]) return null;
      if (!jQuery.isArray(possibleParents)) possibleParents = [possibleParents];

      var el = this[0];
      for (var i = 0; i < possibleParents.length; i++) {
        var p = possibleParents[i];
        if (p instanceof jQuery) p = possibleParents[i].get(0);
        if (jQuery.contains(p, el)) return true; //clicked element is inside this component, so no blur is needed
      }
      return false;
    }

  }, true);
