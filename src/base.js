(function($) {

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
        $('a.yes', el).html(content.yes.text).addClass(content.yes.cls);
        $('a.no', el).html(content.no.text).addClass(content.no.cls);
        $('div.message', el).html(content.message);
        return el;
      }

      var func = function(dialog) {
        var options = dialog.options;
        var el = createUI(options.content);
        $('a.no', el).click(function() {
          $.dialog.hide();
          dialog.invokeCallback('no');
        });
        $('a.yes', el).click(function() {
          $.dialog.hide();
          dialog.invokeCallback('yes');
        });
        return el;
      };

      func.defaults = {
        content: {
          message: $.dialog.i18n.t('confirm.message'), //'are you sure?',
          yes: {text: $.dialog.i18n.t('confirm.yes'), cls: 'button'},
          no: {text: $.dialog.i18n.t('confirm.no'), cls: 'button'}
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

      options = $.extend(true, {}, $.dialog.defaults, dialogType.defaults || {}, options);
      instance.show(options);
    },

    hide: function() {
      instance.hide();
    }
  });


})(jQuery);