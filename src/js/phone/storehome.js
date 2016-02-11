/**
 * Created by lxc on 16-1-17.
 */
require('./base.js').bottomBar(2);

require('../../css/phone/storehome.scss');

var $ = jQuery;

var $qrcode = $('.qr-code');
var href = location.href.substr(0, location.href.lastIndexOf('/') + 1) +
    'apply?id=' + $qrcode.data('id');
console.log(href);
$('.qr-code').empty().qrcode(href);
