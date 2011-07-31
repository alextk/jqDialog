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
