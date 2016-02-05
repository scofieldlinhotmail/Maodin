require('expose?jQuery!jquery');
require('amazeui/dist/css/amazeui.css');
require('amazeui/dist/js/amazeui.js');
require('../../css/phone/base.scss');

jQuery(function () {
   jQuery('body > .page').css('opacity', 1);
});

module.exports = {
    bottomBar: function (active) {
        jQuery(function () {
            jQuery('#navbar').find('li').eq(active).addClass('active');
        });
    }
};