require('../admin-base/common.js');
require('../../css/admin/index.scss');

var $ = jQuery;

$(function () {

    var $iframe = $('iframe');

    $iframe.load(function () {


        var iframeContentDom = $iframe.contents()[0];

        iframeContentDom.onload = resize;

        iframeContentDom.onresize = resize;

        function resize(e) {
            var iframeBody = iframeContentDom.body;

            var height = Math.max(iframeBody.scrollHeight, iframeBody.offsetHeight, iframeBody.clientHeight);

            if (height) {
                $iframe.height( height + 'px');
            }
        }

        setInterval(resize, 800);
    });


});


