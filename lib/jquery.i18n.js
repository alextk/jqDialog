(function($) {

  /**
   *
   */
  var I18nClass = function() {
    this.initialize.apply(this, arguments);
  };

  $.extend(I18nClass.prototype, {

    initialize: function() {
      this._locale = 'en-US';
      this._regional = {};
      this._regional[this._locale] = {};
    },

    locale: function(newValue) {
      if (arguments.length === 0) return this._locale; // getter
      else { //setter
        if (!this._regional[newValue]) throw "Locale " + newValue + " is not registered";
        this._locale = newValue;
      }
      return this;
    },

    translate: function(key, params) {
      var object = this._regional[this._locale];

      var path = key.split('.');
      var result = object;
      for (var i = 0; i < path.length - 1; i++) {
        result = result[path[i]];
        if ($.type(result) != 'object') return key;
      }
      result = result[path[path.length - 1]];

      if (typeof result == 'undefined'){ //no translation has been found --> return key
        return key;
      }

      //do params substitution
      if (arguments.length == 2 && $.type(params) == 'object') {
        for (var p in params) {
          if (params.hasOwnProperty(p)) {
            var exp = new RegExp('%\\{' + (p) + '\\}', 'gm');
            result = result.replace(exp, params[p]);
          }
        }
      } else if (arguments.length > 1) {
        for (var j = 1; j < arguments.length; j++) {
          var expr = new RegExp('\\{' + (j-1) + '\\}', 'gm');
          result = result.replace(expr, arguments[j]);
        }
      }

      return result;
    },

    register: function(locale, tranlsations) {
      this._regional[locale] = tranlsations;
    }

  });

  //define some aliases
  I18nClass.prototype.t = I18nClass.prototype.translate;


  $.i18n = function() {
    return new I18nClass();
  };


})(jQuery);