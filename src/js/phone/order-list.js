require('./base.js');
require('../../css/phone/order-list.scss');

require('angular');
require('angular-route');

var $ = jQuery;

var ajaxErrorCb = function () {
    alert('操作失败，请刷新重试');
};

var app = angular.module('app', []);

app.filter('statusStr', function () {
    return function (val){
        switch (val) {
            case 0:
                return '待付款';
            case 1:
                return '待发货';
            case 2:
                return '已发货';
            case 3:
                return '已签收';
        }
    };
});


app.controller('AppCtrl', ['$scope', '$http', function (scope, $http) {

    scope.data = {};

    scope.status = 0;
    scope.page = 1;
    scope.list = [];
    scope.loading = 0;

    scope.$watch('status', function (newVal, oldVal) {
        if (typeof newVal === 'undefined'){
            return
        }
        if (scope.data[scope.status]) {
            var data = scope.data[scope.status];
            scope.list = data.data;
            scope.page = data.page;
            scope.loading = data.loading;
        } else {
            scope.get();
        }
    });

    scope.get = function () {
        scope.loading = 1;
        var status = scope.status;
        var page= scope.page;
        $http
            .get('/user/order-list/' + status + '/' + page)
            .success(function (data) {
                if (data.length < 4 ){
                    scope.loading = 2;
                } else {
                    scope.loading = 0;
                }
                for(var i in data) {
                    for(var j in data[i].OrderItems) {
                        data[i].OrderItems[j].goods = JSON.parse(data[i].OrderItems[j].goods);
                    }
                    data[i].showAll = true;
                }

                if (!scope.data[status]) {
                    scope.data[status]= {
                        data: [],
                        page : 1
                    };
                }
                scope.data[status].data = scope.data[status].data.concat(data);
                scope.data[status].page = page;
                scope.data[status].loading = scope.loading;
                scope.list = scope.data[status].data;

                scope.$applyAsync();
            }).error(ajaxErrorCb);
    };

    scope.loadMore = function () {
        if (scope.loading != 0 ){
            return;
        }
        scope.page ++;
        scope.get();
    };


}]);

app.controller('OrderCtrl', ['$scope', '$http', function (scope, $http) {

    scope.check = function () {
        $http
            .post('/user/order/action', {
                id: scope.order.id,
                status: 3
            })
            .success(function () {
                scope.order.status = 3;
                scope.$applyAsync();
            }).error(ajaxErrorCb);
    };

}]);


angular.bootstrap(document.documentElement, ['app']);