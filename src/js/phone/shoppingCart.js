require('./base.js').bottomBar(1);
require('../../css/phone/shoppingCart.scss');

require('angular');

var $ = jQuery;

var app = angular.module('app', []);

app.controller('AppCtrl', ['$scope', '$http', function (scope, $http) {

    scope.shoppingCart = [];
    var src = JSON.parse(angular.element('#shoppingCart').html());

    (function () {
        var fromSaler = src[1];
        var groupByStoreObj = {};
        for(var i = 0; i < fromSaler.length; i ++) {
            var item = fromSaler[i];
            item.Good = item.SalerGood.Good;
            item.GoodId = item.SalerGood.id;
            item.selected = false;
            var key = item.SalerGood.StoreId;
            if (!groupByStoreObj[key]) {
                groupByStoreObj[key] = [];
            }
            groupByStoreObj[key].push(item);
        }
        var groupByStoreArr = [];
        for(var i in groupByStoreObj) {
            if (groupByStoreObj.hasOwnProperty(i)) {
                var item = groupByStoreObj[i];
                groupByStoreArr.push({
                    shopName: item[0].SalerGood.Store.name,
                    data: item,
                    selected: false
                });
            }
        }
        scope.shoppingCart = [{
            shopName: '夷沃农特微商',
            data: src[0],
            selected: false
        }].concat(groupByStoreArr);
    }());

    scope.all = false;
    //scope.selectAll = function (selected) {
    //    scope.all = selected;
    //    for(var i in scope.shoppingCart) {
    //        scope.shoppingCart[i].selected  = selected;
    //    }
    //    scope.totalPrice = cal();
    //};

    scope.totalPrice = cal();

    scope.$on('price-change', function () {
        scope.totalPrice = cal();
    });

    function cal() {
        var fee = 0;
        for(var shopIndex in scope.shoppingCart) {
            var shop = scope.shoppingCart[shopIndex];
            for(var goodsIndex in shop) {
                var goods = shop[goodsIndex];
                if (goods.selected) {
                    fee += goods.Good.price * goods.num ;
                }
            }
        }
        return fee;
    }

    var submit = false;
    scope.buy = function () {
        if (submit) {
            return;
        }

        var selectedIds = [];
        for(var i in scope.shoppingCart) {
            var goods = scope.shoppingCart[i];
            if (goods.selected) {
                selectedIds.push(goods.id);
            }
        }
        if (selectedIds.length === 0){
            return;
        }
        submit = true;
        var form = angular.element('<form></form>');
        form.attr('action', '/user/order-comfirm');
        form.attr('method', 'post');
        var input = angular.element('<input />');
        input.attr('name', 'ids');
        input.val(JSON.stringify(selectedIds));
        form.append(input);
        form.submit();
    };

    window.s = scope;

}]);

app.controller('ShopCtrl', ['$scope', '$http', function (scope, $http) {


    scope.$watch('shop.selected', function (newVal, oldVal) {
        if (newVal === oldVal) {
            return;
        }
        for(var i = 0; i < scope.shop.data.length; i ++) {
            scope.shop.data[i].selected =  newVal;
        }
        //scope.$emit('price-change');
    });

    scope.$on('item-remove', function () {
        if (scope.shop.data.length === 0 ){
            scope.$parent.shoppingCart.splice(scope.shopIndex, 1)[0];
        }
    });
}]);

app.controller('GoodsCtrl', ['$scope', '$http', function (scope, $http) {

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
            $http.get('/user/shoppingcart/' + goods.type + '/'  + scope.goods.GoodId + '/' + scope.goods.num);
        },  800);
        scope.$emit('price-change');
    });

    scope.remove = function () {
        var goods = scope.$parent.$parent.shoppingCart[scope.shopIndex].splice(scope.goodsIndex, 1)[0];
        scope.$emit('price-change');
        $http.get('/user/shoppingcart/' + goods.type + '/' + goods.GoodId + '/-1');
        scope.emit('item-remove');
    };

    scope.$watch('goods.selected', function (newVal, oldVal) {
        if (newVal === oldVal) {
            return;
        }
        if (scope.goods.selected && scope.goods.num === 0) {
            scope.goods.num = 1;
        }
        scope.$emit('price-change');
    });
}]);

angular.bootstrap(document.documentElement, ['app']);