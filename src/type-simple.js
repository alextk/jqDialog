(function($) {

  var SimpleDialogClass = function(){
    this.initialize.apply(this, arguments);
  };
  SimpleDialogClass.defaults = {
    clsType: 'simple',
    buttons: {close: {keyCode: $.Event.Keys.ESC}},
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