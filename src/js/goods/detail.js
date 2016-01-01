/**
 * Created by lxc on 15-12-20.
 */
require('../admin-base/common.js');

require('Swiper/dist/css/swiper.css');

require('Swiper/dist/js/swiper.js');

var $ = jQuery;
var windowWidth = $(window).width();
var mySwiper =  new Swiper('.swiper-container', {
    freeMode : true,
    width: windowWidth,
    height: windowWidth * 310 / 130.0,
    pagination: '.swiper-pagination',
});

//
//var mySwiper = new Swiper ('.swiper-container', {
//        direction: 'vertical',
//        loop: true,
//
//        // 如果需要分页器
//        pagination: '.swiper-pagination',
//
//        // 如果需要前进后退按钮
//        nextButton: '.swiper-button-next',
//        prevButton: '.swiper-button-prev',
//
//        // 如果需要滚动条
//        scrollbar: '.swiper-scrollbar',
//    })





