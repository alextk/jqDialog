/*
* jqDialog - jQuery plugin for creating dialog hovering div
*
* Version: 0.0.1
* Build: 25
* Copyright 2011 Alex Tkachev
*
* Dual licensed under MIT or GPLv2 licenses
*   http://en.wikipedia.org/wiki/MIT_License
*   http://en.wikipedia.org/wiki/GNU_General_Public_License
*
* Date: 12 Dec 2011 20:21:04
*/

(function($) {

  $.dialog = {};
  $.dialog.i18n = $.i18n();

  $.dialog.defaults = {
    type: 'simple',
    content: '',
    position: {my: 'left top', at: 'left bottom'},
    events: {},
    buttons: {},
    toolbar: []
  };

  $.dialog.types = { };

})(jQuery);
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

    _createButtons: function(options){
      var self = this;
      var toolbar = $('div.toolbar', this.el).html(''); //clear toolbar

      for(var i=0; i<options.toolbar.length; i++){
        var buttonName = options.toolbar[i];
        var cfg = options.buttons[buttonName];
        cfg.name = buttonName;
        var btn = $('<a href="javascript:;"/>').addClass(cfg.cls).html(cfg.text || $.dialog.i18n.t('buttons.'+cfg.name));
        toolbar.append(btn);
        btn.click({cfg: cfg}, function(event){
          var btnConfig = event.data.cfg;
          if(!btnConfig.keepVisible) $.dialog.hide();
          var returnData = self._dialogReturnData(btnConfig.name, event);
          if(btnConfig.action) btnConfig.action(returnData);
          self._invokeCallback(btnConfig.name, event, returnData);
          self._invokeCallback('buttonClick', btnConfig.name, event, returnData);
        });
      }
    },

    show: function(options) {
      this.options = options;
      if (!this.el) this.el = this._createUI();

      //create buttons
      this._createButtons(options);

      this.el.show();

      $('div.content', this.el).html(options.type.render(this));
      $('div.container', this.el).attr('class', 'container ' + options.clsType);

      if(options.position.of.css('direction') == 'rtl'){ //swap left/right positions
        options.position.my = options.position.my.replace('right', '_l').replace('left', '_r').replace('_l', 'left').replace('_r', 'right');
        options.position.at = options.position.at.replace('right', '_l').replace('left', '_r').replace('_l', 'left').replace('_r', 'right');
      }

      //calculate dialog offset
      var tip = $('div.tip', this.el);
      var aboveTarget = options.position.my.indexOf('bottom') >= 0; //if dialog position is below target element (my contains top)
      tip.toggleClass('above', aboveTarget).toggleClass('below', !aboveTarget);

      var rightTarget = options.position.at.indexOf('right') >= 0;

      options.position.offset = '0 ' + (aboveTarget ? -tip.height() : tip.height());

      this.el.position(options.position);
      tip.position({my: options.position.at, at: options.position.my, of: $('div.container', this.el), offset: (rightTarget ? -tip.width() : tip.width()) + ' 0'});

      $(document).bind('mousedown', {dialog: this}, this._onDocumntMouseDown);

      this._invokeCallback('show');
      if(this.options.type.onShow) this.options.type.onShow();
    },

    hide: function() {
      $(document).unbind('mousedown', this._onDocumntMouseDown);
      this.el.hide();
      this._invokeCallback('hide');
      if(this.options.type.onHide) this.options.type.onHide();
    },

    _createUI: function() {
      return $(
        '<div class="dialog-container">' +
          '<div class="tip"/>' +
          '<div class="container">' +
            '<div class="content"/>' +
            '<div class="toolbar"/>' +
          '</div>' +
        '</div>'
      ).appendTo('body').hide();
    },

    _invokeCallback: function(callbackName) {
      var callback = this.options.events[callbackName];
      if ($.isFunction(callback)){
        callback.apply(this.options.events.context || this, Array.prototype.slice.call(arguments, 1));
      }
      if($.isFunction(this.options.events.callback)){
        this.options.events.callback.apply(this.options.events.context || this, Array.prototype.slice.call(arguments, 1));
      }
    },

    _dialogReturnData: function(buttonName){ //return data that will be passed to button callbacks and actions
      return this.options.type.returnData ? this.options.type.returnData(buttonName) : undefined;
    },

    _onDocumntMouseDown: function(event) {
      var target = $(event.target);
      if (target.closest('div.dialog-container').length === 0) {
        event.data.dialog.hide();
      }
    }

  });

  var instance = new DialogClass();

  $.extend($.dialog, {
    el: function(){
      return instance.el;
    },

    show: function(options) {
      options = $.extend({type: $.dialog.defaults.type}, options || {});

      var dialogTypeClass = $.dialog.types[options.type];
      if (!$.isFunction(dialogTypeClass)) throw 'unknown dialog type ' + dialogTypeClass;

      options = $.extend(true, {}, $.dialog.defaults, dialogTypeClass.defaults || {}, options, {type: new dialogTypeClass(instance)});
      instance.show(options);
    },

    hide: function() {
      instance.hide();
    }
  });


})(jQuery);
(function($) {

  var SimpleDialogClass = function(){
    this.initialize.apply(this, arguments);
  };
  SimpleDialogClass.defaults = {
    clsType: 'simple',
    buttons: {close: {}},
    toolbar: ['close']
  };

  $.extend(SimpleDialogClass.prototype, {

    initialize: function() { },

    render: function(dialog){
      return dialog.options.content;
    }
  });

  $.dialog.types.simple = SimpleDialogClass;


})(jQuery);
(function($) {

  var ConfirmDialogClass = function(){
    this.initialize.apply(this, arguments);
  };
  ConfirmDialogClass.defaults = {
    clsType: 'confirm',
    buttons: {yes: {}, no: {}},
    toolbar: ['yes', 'no']
  };

  $.extend(ConfirmDialogClass.prototype, {

    initialize: function() { },

    render: function(dialog){
      return dialog.options.content || $.dialog.i18n.t('confirm.message');
    }
  });

  $.dialog.types.confirm = ConfirmDialogClass;


})(jQuery);
