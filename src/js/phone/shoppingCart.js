require('./base.js').bottomBar(1);
require('../../css/phone/shoppingCart.scss');

require('angular');

var $ = jQuery;

var app = angular.module('app', []);

app.controller('AppCtrl', ['$scope', '$http', function (scope, $http) {

    scope.shoppingCart = [];
    var src = JSON.parse(angular.element('#shoppingCart').html());
    scope.shoppingCart = src;
    scope.all = false;
    scope.selectAll = function (selected) {
        scope.all = selected;
        for(var i in scope.shoppingCart) {
            scope.shoppingCart[i].selected  = selected;
        }
        scope.totalPrice = cal();
    };

    scope.totalPrice = cal();

    scope.$on('price-change', function () {
        scope.totalPrice = cal();
    });

    function cal() {
        var fee = 0;
        for(var i in scope.shoppingCart) {
            var goods = scope.shoppingCart[i];
            if (goods.selected) {
                fee += goods.Good.price * goods.num * goods.Good.perNum;
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

    //window.s = scope;

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
            $http.get('/user/shoppingcart/' + scope.goods.GoodId + '/' + scope.goods.num);
        },  800);
        scope.$emit('price-change');
    });

    scope.remove = function () {
        var goods = scope.$parent.shoppingCart.splice(scope.goodsIndex, 1)[0];
        scope.$emit('price-change');
        $http.get('/user/shoppingcart/' + goods.GoodId + '/-1');
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