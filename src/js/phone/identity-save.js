/**
 * Created by bian on 15-12-6.
 */

require('./base.js');

var $ = jQuery;
$(function () {

    $('form').validator({
        onValid: function(validity) {
            $(validity.field).closest('.am-form-group').find('.am-alert').addClass('am-hide');
        },
        onInValid: function(validity) {
            $(validity.field).closest('.am-form-group').find('.am-alert').removeClass('am-hide');
        }
    });
});