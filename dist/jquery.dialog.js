/*
* jqDialog - jQuery plugin for rendering dialog
*
* Version: 0.0.1a
* Copyright 2011 Alex Tkachev
*
* Dual licensed under MIT or GPLv2 licenses
*   http://en.wikipedia.org/wiki/MIT_License
*   http://en.wikipedia.org/wiki/GNU_General_Public_License
*
* Date: Wed Jul 20 15:47:16 2011 +0300
*/

(function($) {

  /**
   *
   */
  var DialogClass = function() {
    this.initialize.apply(this, arguments);
  };

  $.extend(DialogClass.prototype, {

    initialize: function() {

    },

    show: function(options) {
      this.options = options;
      if (!this.el) this.el = this._createUI();

      $('div.content', this.el).html(options.type(this));

      this.el.show();

      //calculate dialog offset
      var tip = $('div.tip', this.el);
      var aboveTarget = options.position.my.indexOf('bottom') >= 0; //if dialog position is below target element (my contains top)
      tip.toggleClass('above', aboveTarget).toggleClass('below', !aboveTarget);

      var rightTarget = options.position.at.indexOf('right') >= 0;

      options.position.offset = '0 ' + (aboveTarget ? -tip.height() : tip.height());

      this.el.position(options.position);
      tip.position({my: options.position.at, at: options.position.my, of: $('div.content', this.el), offset: (rightTarget ? -tip.width() : tip.width()) + ' 0'});

      $(document).bind('mousedown', {dialog: this}, this._onDocumntMouseDown);

      this._invokeCallback('show');
    },

    hide: function() {
      $(document).unbind('mousedown', this._onDocumntMouseDown);
      this.el.hide();
      this._invokeCallback('hide');
    },

    _createUI: function() {
      return $(
        '<div class="dialog-container">' +
          '<div class="tip"/>' +
          '<div class="content"/>' +
          '</div>'
      ).appendTo('body').hide();
    },

    _invokeCallback: function(callbackName) {
      var callback = this.options.events[callbackName];
      if ($.isFunction(callback)) callback.apply(this.options.events.context || callback);
    },

    _onDocumntMouseDown: function(event) {
      var target = $(event.target);
      if (target.closest('div.dialog-container').length === 0) {
        event.data.dialog.hide();
      }
    }

  });

  var instance = new DialogClass();

  $.dialog = {};
  $.dialog.i18n = $.i18n();

  $.dialog.defaults = {
    type: 'simple',
    content: '',
    position: {my: 'left top', at: 'left bottom'},
    events: {}
  };

  $.dialog.types = {
    simple: function(dialog) {
      return dialog.options.content;
    },
    confirm: (function() {

      function createUI(content) {
        var el = $('<div class="confirmation-dialog-content">' +
          '<div class="message"/>' +
          '<div class="toolbar">' +
          '<a href="javascript:;" class="yes"/>' +
          '<a href="javascript:;" class="no"/>' +
          '</div>' +
          '</div>');
        $('a.yes', el).html(content.yes.text || $.dialog.i18n.t('confirm.yes')).addClass(content.yes.cls);
        $('a.no', el).html(content.no.text || $.dialog.i18n.t('confirm.no')).addClass(content.no.cls);
        $('div.message', el).html(content.message || $.dialog.i18n.t('confirm.message'));
        return el;
      }

      var func = function(dialog) {
        var options = dialog.options;
        var el = createUI(options.content);
        $('a.no', el).click(function() {
          $.dialog.hide();
          dialog._invokeCallback('no');
        });
        $('a.yes', el).click(function() {
          $.dialog.hide();
          dialog._invokeCallback('yes');
        });
        return el;
      };

      func.defaults = {
        content: {
          yes: {cls: 'button'},
          no: {cls: 'button'}
        }
      };

      return func;

    })()
  };

  $.extend($.dialog, {

    show: function(options) {
      options = $.extend({type: $.dialog.defaults.type}, options || {});

      var dialogType = options.type = $.dialog.types[options.type];
      if (!$.isFunction(dialogType)) throw 'unknown dialog type ' + options.type;

      if ($.isFunction(dialogType.defaults)) dialogType.defaults = dialogType.defaults(); //invoke function so if i18n translation is used for messages or text, the translations already has been loaded
      options = $.extend(true, {}, $.dialog.defaults, dialogType.defaults || {}, options);
      instance.show(options);
    },

    hide: function() {
      instance.hide();
    }
  });


})(jQuery);