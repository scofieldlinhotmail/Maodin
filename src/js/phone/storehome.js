/**
 * Created by lxc on 16-1-17.
 */
require('./base.js').bottomBar(2);

require('../../css/phone/storehome.scss');

var $ = jQuery;



$(function() {
    var $qrcode = $('.qr-code');
    var href = location.href.substr(0, location.href.lastIndexOf('/') +
            1) +
        'apply?id=' + $qrcode.data('id');
    console.log(href);
    $('.qr-code').empty().qrcode(href);

    try {
        var wechatJsConfig = $('#wechat-js-config').html().trim();
        wechatJsConfig = JSON.parse(wechatJsConfig);

        wx.config(wechatJsConfig);

        wx.ready(function() {

        });

        wx.onMenuShareTimeLine({
            title: '加入隊伍',
            link: href,
            imgUrl: '',
            success: function() {
                console.log('share success');
            },
            cancel: function() {
                console.log('cancel');
            }
        });

        wx.onMenuShareAppMessage({
            title: '加入隊伍',
            desc: '',
            link: href,
            imgUrl: '',
            success: function() {
                console.log('share success');
            },
            cancel: function() {
                console.log('cancel');
            }
        });

        wx.error(function(res) {
            console.log(res);
        });
    } catch (ex) {

    }
});
