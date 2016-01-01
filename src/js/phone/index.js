require('./base.js').bottomBar(0);

require('../../css/phone/index.scss');
//require('Swiper');
require('Swiper/dist/css/swiper.css');

require('Swiper/dist/js/swiper.js');
require('angular');
require('ngInfiniteScroll');

var $ = jQuery;

var $header = $('.fixed-header');
var $form = $('form', $header);

var app = angular.module('app', ['infinite-scroll']);

var mySwiper;

var ajaxError = function () {
    alert('操作失败，请刷新重试');
};

app.controller('AppCtrl', ['$scope', '$http', function (scope, $http) {

    var typesStr = angular.element('#types').html();
    scope.types = typesStr ? JSON.parse(typesStr) : [];
    scope.activeLTypeIndex = 0;
    scope.activeSTypeIndex = 0;
    scope.goodsData = [];
    scope.goodsCache = {};
    scope.pageData = {};
    scope.shoppingCart = undefined;
    scope.loadStatus = 0;
    scope.searchMode = false;
    scope.searchCache = {};

    angular.element('#search').on('keydown', function (e) {
        if (e.keyCode != 13) {
            return;
        }
        scope.searchMode = true;
        getGoodsData();
    });

    $http
        .get('/user/shoppingcart')
        .success(function (data) {
            scope.shoppingCart = data;
            if(scope.goodsData.length !== 0) {
                updateShoppingNum();
            }
        }).error(ajaxError);

    function updateShoppingNum(start, end) {
        if (typeof start === 'undefined') {
            start = 0;
        }
        if (typeof end === 'undefined') {
            end = scope.goodsData.length -1;
        }
        for(var j in scope.goodsData) {
            if (j < start || j > end ) {
                continue;
            }
            var data = scope.goodsData[j];
            for(var i in scope.shoppingCart) {
                var item = scope.shoppingCart[i];
                if (item.GoodId == data.id) {
                    data.num = item.num;
                    break;
                }
            }
            if(!data.num) {
                data.num = 0;
            }
        }
        scope.$applyAsync();
    }

    scope.loadMore = function () {
        var id = dataIndex(scope.searchMode);
        scope.pageData[id] ++;
        var updateStartIndex = scope.goodsData.length -1;
        getGoodsData();
        updateShoppingNum(updateStartIndex);
    };

    function stypeId() {
        return scope.types[scope.activeLTypeIndex].GoodsTypes[scope.activeSTypeIndex].id;
    }

    function dataIndex(mode){
        return mode ? 'search/' + scope.search:
            stypeId();
    }

    function handleData (data, id, page) {
        if (!scope.goodsCache[id]) {
            scope.goodsCache[id] = [];
        }
        scope.goodsCache[id] = scope.goodsCache[id].concat(data);
        if (data.length < 3) {
            scope.loadStatus = 2;
        } else {
            scope.loadStatus = 0;
        }
        var updateStartIndex = 0;
        if (page != 1) {
            updateStartIndex = scope.goodsData.length;
        }
        scope.goodsData = scope.goodsCache[id];
        updateShoppingNum(updateStartIndex);
        scope.$applyAsync();
    }

    function getGoodsData () {
        console.log('get');
        var searchMode = scope.searchMode;
        var id = dataIndex(searchMode);
        scope.pageData[id] = scope.pageData[id] || 1;
        scope.loadStatus = 1;
        var params = {};
        params.page = scope.pageData[id];
        if (searchMode) {
            params.txt = scope.search;
        } else {
            params.stype = stypeId();
        }
        $http
            .post('/get-goods', params)
            .success(function (data) {
                handleData(data, id, params.page);
            });
    }

    scope.$watch('[activeLTypeIndex,activeSTypeIndex]', function (newVals, oldvals) {
        if (typeof newVals[0] === 'undefined' || typeof newVals[1] === 'undefined'){
            return;
        }
        scope.searchMode = false;
        var id = scope.activeLTypeIndex != -1 ? dataIndex(scope.searchMode): 'collection';
        var cached = scope.goodsCache[id];
        if (cached) {
            scope.goodsData = cached;
            scope.$applyAsync();
        } else {
            scope.pageData[id] = 1;
            var page = 1;
            if (scope.activeLTypeIndex != -1) {
                getGoodsData();
            } else {
                $http
                    .get('/user/goods-collection')
                    .success(function (data) {
                        handleData(data, id, 1);
                    })
                    .error(ajaxError);
            }
        }
    });

}]);

app.controller('LTypeCtrl', ['$scope', '$http', function (scope, $http)  {

    angular.forEach(['next', 'prev'], function (action) {
        var func = 'slide' + action.substr(0, 1).toUpperCase() + action.substr(1);
        scope[action] = function () {
            mySwiper[func]();
        };
    });

    setTimeout(function () {
        mySwiper =  new Swiper('.swiper-container', {
            freeMode : true,
            width: 120
        });

    }, 0);

    scope.setLType = function (index) {
        scope.$parent.activeLTypeIndex = index;
        scope.$parent.seachMode = false;
        scope.$parent.$applyAsync();
    };
}]);

app.controller('STypeCtrl', ['$scope', function (scope)  {
    scope.setSType = function (index) {
        scope.$parent.activeSTypeIndex = index;
    };
}]);

app.controller('GoodsCtrl', ['$scope', '$http', function (scope, $http)  {

}]);

app.controller('GoodsItemCtrl', ['$scope', '$http', function (scope, $http)  {

    var timer;

    scope.$watch('goods.num', function (newVal, oldVal) {
        if (newVal === oldVal || typeof newVal === 'undefined') {
            return;
        }
        if (scope.goods.num < 0) {
            scope.goods.num = 0;
        }
        if (timer) {
            clearInterval(timer);
        }
        timer = setInterval(function () {
            clearInterval(timer);
            $http.get('/user/shoppingcart/' + scope.goods.id + '/' + scope.goods.num);
        },  1000);

    })
}]);

//app.controller('MsgCtrl', ['$scope', '$http', function (scope, $http) {
//    scope.msgCount = 0;
//
//    $http
//        .get('/user/msgCount')
//        .success(function (data) {
//            scope.msgCount = data;
//            scope.$applyAsync();
//        }).error(ajaxError);
//}]);

angular.bootstrap(document.documentElement, ['app']);