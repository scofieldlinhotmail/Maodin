var phoneBase = require('./base.js');
require('../../css/phone/goods-page.scss');

require('Swiper/dist/css/swiper.css');
require('Swiper/dist/js/swiper.js');

require('angular');

var $ = jQuery;

var ajaxError = function () {
    alert('操作失败，请刷新重试');
};

var app =  angular.module('app', []);

app.controller('MainCtrl', ['$scope', '$http', function (scope, $http) {

    var modal = angular.element('#goods-select-num');
    scope.toggleCollect = function () {
        $http.get('/user/goods-collect/' + scope.type + '/' + scope.id)
            .success(function () {
                scope.isCollected = ! scope.isCollected;
                scope.$applyAsync();
            })
            .error(ajaxError);
    };

    var modalMode;
    scope.toShoppingCart = function () {
        modalMode = 'shopping-cart';
        modal.modal('open');
    };

    scope.toBuy = function () {
        modalMode = 'buy';
        modal.modal('open');
    };

    scope.num = 1;

    scope.add = function (num){
        if (scope.num + num > 0) {
            scope.num = scope.num + num;
        }
    };

    scope.sale = function () {
        $http.get('/user/sale/' + scope.id)
            .success(function (data) {
                if (data == 'ok') {
                    scope.isSaled = ! scope.isSaled;
                    scope.$applyAsync();
                } else {
                    alert('错误操作');
                }
            })
            .error(ajaxError);
    };

    scope.submit = function () {
        if (modalMode == 'shopping-cart') {
            $http.get('/user/shoppingcart/' + scope.type + '/' + scope.id + '/' + scope.num)
                .success(function () {
                    scope.isInShoppingCart = ! scope.isInShoppingCart;
                    modal.modal('close');
                    scope.$applyAsync();
                })
                .error(ajaxError);
        } else {
            var form = angular.element('<form action="/user/order-comfirm" method="post"> </form>');
            form.append('<input name="ids" value="' + scope.id + '" >');
            form.append('<input name="num" value="' + scope.num + '" >');
            form.submit();
        }
    };

}]);


angular.bootstrap(document.documentElement, ['app']);

$(function () {
    var windowWidth = $(window).width();
    var mySwiper =  new Swiper('.swiper-container', {
        freeMode : true,
        width: windowWidth,
        height: windowWidth,
        pagination: '.swiper-pagination'
    });



});