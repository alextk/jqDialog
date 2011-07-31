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