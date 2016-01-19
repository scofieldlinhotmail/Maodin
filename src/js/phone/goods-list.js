require('./base.js').bottomBar(1);
require('../../css/phone/goods-list.scss');


require('angular');

var $ = jQuery;

var app = angular.module('app', []);

var perPageNum = 10;

var ajaxError = function () {
    alert('操作失败，请刷新重试');
};

app.controller('AppCtrl', ['$scope', '$http', function (scope, $http) {

    var typeNav = angular.element('#type-nav');

    scope.orderMode = {
        time: 'createdAt DESC',
        price: 'price',
        priceDesc: 'price DESC',
        soldNum: 'compoundSoldNum DESC'
    };

    scope.loadStatus = 0;
    scope.searchMode = false;

    scope.list = [];

    scope.currentOrderMode = scope.orderMode.time;

    scope.searchKey = null;
    scope.typeId = null;
    scope.page = 1;

    scope.type = function (id) {
        scope.searchKey = null;
        scope.currentOrderMode = scope.orderMode.time;
        scope.typeId = id;
        scope.page = 1;
        scope.update();
        typeNav.find('.am-in').each(function () {
            $(this).collapse('close');
        });
    };

    scope.update = function ()  {
        getGoodsData(scope.typeId, scope.searchKey, scope.currentOrderMode, scope.page);
    };

    scope.order = function (mode) {
        scope.currentOrderMode = mode;
        console.log(mode);
        scope.page = 1;
        scope.update();
    };

    scope.loadmore = function () {
        scope.page ++;
        scope.update();
    };

    scope.search = function () {
        if (!scope.searchKey) {
            return;
        }
        scope.typeId = null;
        scope.page = 1;
        scope.update();
    };


    function getGoodsData (typeId, searchKey, orderMode, page) {
        scope.loadStatus = 1;
        var params = {
            orderMode: orderMode,
            page: page
        };
        if (typeof typeId !== 'undefined') {
            params.typeId = typeId;
        }
        if (typeof searchKey !== 'undefined') {
            params.searchKey = searchKey;
        }
        if (scope.storeId) {
            params.storeId = scope.storeId;
        }
        $http
            .post('/get-goods', params)
            .success(function (data) {
                if (data.length < perPageNum) {
                    scope.loadStatus = 2;
                } else {
                    scope.loadStatus = 0;
                }
                if (page != 1) {
                    scope.list = scope.list.concat(data);
                } else {
                    scope.list = data;
                }
                scope.$applyAsync();
            });
    }


    scope.$applyAsync(function () {
        getGoodsData(null, null, scope.orderMode.time, 1);
    });

}]);

angular.bootstrap(document.documentElement, ['app']);