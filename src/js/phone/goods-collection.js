require('./base.js');
require('../../css/phone/goods-list.scss');


require('angular');

var $ = jQuery;

var app = angular.module('app', []);

var perPageNum = 10;

var ajaxError = function () {
    alert('操作失败，请刷新重试');
};

app.controller('AppCtrl', ['$scope', '$http', function (scope, $http) {

    var data = angular.element('#data');

    try {
        scope.data = JSON.parse(data.html());
    } catch (e){
        scope.data = [];
    }

    //data.remove();

    var perPage = 2;

    scope.page = 0;

    scope.loadmore = function () {
        scope.loadStatus = 1;
        if (!scope.list) {
            scope.list = [];
        }
        scope.list = scope.list.concat(scope.data.slice(scope.page * perPage, (scope.page + 1) * perPage));
        scope.page ++;
        scope.loadStatus =  scope.list.length < scope.page * perPage ? 2 : 0;
    };

    scope.loadmore();

    window.s = scope;

}]);

angular.bootstrap(document.documentElement, ['app']);