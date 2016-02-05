/**
 * Created by bian on 15-12-6.
 */

require('./base.js');
require('../../css/phone/base.scss');

require('imports?$=jquery, define=>false, exports=>false, ChineseDistricts=distpicker/dist/distpicker.data.js!distpicker/dist/distpicker.js');


var $ = jQuery;
$(function () {

    var $dist = $("#distpicker");
    $dist.distpicker();
    $('form').validator({
        onValid: function(validity) {
            $(validity.field).closest('.am-form-group').find('.am-alert').addClass('am-hide');
        },
        onInValid: function(validity) {
            $(validity.field).closest('.am-form-group').find('.am-alert').removeClass('am-hide');
        }
    });
});