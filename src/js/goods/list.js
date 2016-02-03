require('./../admin-base/common.js');
require('angular');
require('angular-route');
require('../../css/admin/goods.scss');
require('../angular.simple-datatables.js');

var app = angular.module('app', ['simpleDatatable', 'ngRoute']);

var getGoodsData = function ($http, scope, status) {
    if (status === 0 ? !scope.data.uncheck : !scope.data.checked) {
        $http
            .get('./goods/' + status)
            .success(function (data) {
                if (status === 0) {
                    scope.data.inactive = data;
                    scope.list = scope.data.inactive;
                } else {
                    scope.data.active = data;
                    scope.list = scope.data.active;
                }
                scope.$applyAsync();
            })
    } else {
        scope.list = status === 0 ? scope.data.inactive : scope.data.active;
        scope.$applyAsync();
    }
};

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/active', {
            template: '',
            controller: 'ActiveCtrl'
        })
        .when('/inactive', {
            template: '',
            controller: 'InactiveCtrl'
        })
        .otherwise({
            redirectTo: '/active'
        });
}]);

app.controller('AppCtrl', ['$scope', '$http', '$sce', function (scope, $http, $sce) {
    scope.tab = undefined;

    scope.data = {
    };

    scope.list = [];

    scope.$watch('tab', function (newVal, oldVal){
        if (newVal === oldVal || typeof newVal === 'undefined') {
            return;
        }
        getGoodsData($http, scope, newVal);
    });

    scope.sdtOn = function (event, row) {
        var extraParams = Array.prototype.slice.call(arguments, 2);
        var status = 0;
        var remover = extraParams[1];

        if (extraParams[0] === 'up') {
            row.deleted = null;
            if (scope.data.active) {
                scope.data.active.push(row);
            }
        } else if (extraParams[0] === 'down') {
            row.status = new Date();
            if (scope.data.inactive) {
                scope.data.inactive.push(row);
            }
        }
        $http
            .post('./goods/action', {
                id: row.id,
                action: extraParams[0]
            })
            .success(function (ret) {
                if (ret.status) {
                    remover();
                }
                scope.$applyAsync();
            })
            .error(function () {
                alert('操作失败，请刷新重试');
            });
    };

    scope.actionColFactory =  angular.element('#row-btn').html();

    window.s = scope;
}]);

app.controller('ActiveCtrl', ['$scope', function (scope) {
    scope.$parent.tab = 1;
}]);

app.controller('InactiveCtrl', ['$scope', function (scope) {
    scope.$parent.tab = 0;
}]);

angular.bootstrap(document.documentElement, ['app']);





