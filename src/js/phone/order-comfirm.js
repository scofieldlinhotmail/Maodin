require('./base.js');

require('../../css/phone/order-comfirm.scss');

require('angular');
var Decimal = require('decimal.js');

var $ = jQuery;

var app = angular.module('app', []);

app.controller('AppCtrl', ['$scope', function (scope) {

    scope.msg = '';

    scope.shoppingCart = [];
    var src = JSON.parse(angular.element('#shoppingCart').html());

    (function () {
        var fromSaler = src[1];
        var groupByStoreObj = {};
        var i, item;
        for(i = 0; i < fromSaler.length; i ++) {
            item = fromSaler[i];
            item.Good = item.SalerGood.Good;
            //item.GoodId = item.SalerGood.id;
            //item.selected = false;
            var key = item.SalerGood.StoreId;
            if (!groupByStoreObj[key]) {
                groupByStoreObj[key] = [];
            }
            groupByStoreObj[key].push(item);
        }
        var groupByStoreArr = [];

        for(i in groupByStoreObj) {
            if (groupByStoreObj.hasOwnProperty(i)) {
                item = groupByStoreObj[i];
                groupByStoreArr.push({
                    shopName: item[0].SalerGood.Store.name,
                    storeId: item[0].SalerGood.StoreId,
                    data: item,
                    selected: false
                });
            }
        }

        if (src[0]) {
            scope.shoppingCart = [{
                shopName: '猫町海淘',
                data: src[0],
                selected: false,
                storeId: 0
            }].concat(groupByStoreArr);
        } else {
            scope.shoppingCart = groupByStoreArr;
        }

    }());

    scope.totalPrice = cal();

    function cal() {
        var fee = new Decimal(0);
        for(var shopIndex in scope.shoppingCart) {
            if (!scope.shoppingCart.hasOwnProperty(shopIndex)) {
                continue;
            }
            var shop = scope.shoppingCart[shopIndex];
            //shop.expressWay = 0;
            var totalPrice = new Decimal(0);
            for(var goodsIndex in shop.data) {
                if (!shop.data.hasOwnProperty(goodsIndex)) {
                    continue;
                }
                var goods = shop.data[goodsIndex];

                totalPrice =  totalPrice.plus(new Decimal(goods.Good.price).mul(goods.num));
            }
            shop.totalPrice = totalPrice.toNumber();
            fee =  fee.plus(totalPrice);
        }
        return fee.toNumber();
    }

    scope.address = JSON.parse(angular.element('#addresses').html());
    scope.identityInfoes = JSON.parse(angular.element('#identityInfoes').html());



    scope.addressIndex = 0;
    scope.identityIndex = 0;
    (function () {
        var i;
        for(i = 0 ; i < scope.address.length; i ++) {
            if (scope.address[i].isDefault) {
                var defaultAddress = scope.address.splice(i,  1);
                scope.address = defaultAddress.concat(scope.address);
                break;
            }
        }
        for(i = 0 ; i < scope.identityInfoes.length; i ++) {
            if (scope.identityInfoes[i].isDefault) {
                var defaultIdentity = scope.identityInfoes.splice(i,  1);
                scope.identityInfoes = defaultIdentity.concat(scope.identityInfoes);
                break;
            }
        }
        scope.$applyAsync();
    }());



    var submit = false;
    scope.buy = function () {
        if (submit) {
            return;
        }
        submit = true;


        var orders = [];

        for(var shopIndex in scope.shoppingCart) {
            if (!scope.shoppingCart.hasOwnProperty(shopIndex)) {
                continue;
            }
            var shop = scope.shoppingCart[shopIndex];
            var order = {
                msg: shop.msg.trim(),
                expressWay: shop.expressWay,
                suborders: [],
                storeId: shop.storeId
            };
            for(var goodsIndex in shop.data) {
                if (!shop.data.hasOwnProperty(goodsIndex)) {
                    continue;
                }
                var goods = shop.data[goodsIndex];
                order.suborders.push({
                    id: goods.id,
                    num: goods.num,
                    GoodsId: goods.Good.id,
                    type: goods.type,
                    SalerGoodId: goods.type == 1 ? goods.SalerGoodId : null
                });
            }
            orders.push(order);
        }

        if (orders.length === 0){
            return;
        }


        var form = angular.element('#order-form');
        form.find('[name=order]').val(JSON.stringify(orders));
        form.find('[name=address]').val(scope.address[scope.addressIndex].id);
        form.find('[name=msg]').val(scope.msg);
        form.find('[name=type]').val(scope.type);
        form.find('[name=identity]').val(scope.identityInfoes[scope.identityIndex].id);
        form.submit();
    };

    scope.modal = function (modalName) {
        scope.$broadcast(modalName);
    };

}]);


app.controller('ShopCtrl', ['$scope', '$http', function (scope, $http) {

}]);

app.controller('GoodsCtrl', ['$scope', '$http', function (scope, $http) {
}]);

app.controller('AddressCtrl', ['$scope', '$http', function (scope, $http) {
    var _modal = undefined;
    var modal = function () {
        if (!_modal) {
            _modal = angular.element('#address-modal').modal({

            });
        }
        return _modal;
    };

    scope.$on('address-modal', function () {
        modal().modal('open');
    });

    scope.setAddr = function (index) {
        scope.$parent.addressIndex = index;
        modal().modal('close');
    }
}]);

app.controller('IdentityCtrl', ['$scope', '$http', function (scope, $http) {
    var _modal = undefined;
    var modal = function () {
        if (!_modal) {
            _modal = angular.element('#identity-modal').modal({

            });
        }
        return _modal;
    };

    scope.$on('identity-modal', function () {
        modal().modal('open');
    });

    scope.setIndex = function (index) {
        scope.$parent.identityIndex = index;
        modal().modal('close');
    }
}]);

angular.bootstrap(document.documentElement, ['app']);

$(function () {
    $('.am-radio-inline-default').trigger('click');
});