/**
 * Created by lxc on 16-1-18.
 */
require('./base.js').bottomBar(0);

require('../../css/phone/storeindex.scss');

var $ = jQuery;



var $slider = $('#demo-slider-0');
var counter = 0;
var getSlide = function() {
    counter++;
    return '<li><img src="http://s.amazeui.org/media/i/demos/bing-' +
        (Math.floor(Math.random() * 4) + 1) + '.jpg" />' +
        '<div class="am-slider-desc">动态插入的 slide ' + counter +
        '</div></li>';
};

$('.js-demo-slider-btn').on('click', function() {
    var action = this.getAttribute('data-action');
    if (action === 'add') {
        $slider.flexslider('addSlide', getSlide());
    } else {
        var count = $slider.flexslider('count');
        count > 1 && $slider.flexslider('removeSlide', $slider.flexslider(
            'count') - 1);
    }
});

var $collectBtn = $('.collect');
$collectBtn.each(function() {
    var $ele = $(this);
    if ($ele.data('status') == $ele.data('show')) {
        $ele.removeClass('am-hide');
    }
});

$collectBtn.click(function() {
    var $this = $(this);
    $.ajax({
        url: '/user-favorite/toggle',
        data: {
            storeid: $this.parent().data('id'),
            action: $this.data('action')
        },
        success: function() {
            $this.addClass('am-hide');
            $this.siblings('.collect').removeClass(
                'am-hide');
        },
        error: function() {
            alert('操作失败,请刷星重试!');
        }
    });

});

$('.qr-code').empty().qrcode(window.location.href);
