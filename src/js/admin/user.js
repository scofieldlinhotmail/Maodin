require('./../admin-base/common.js');
require('angular');
require('angular-route');
require('../angular.simple-datatables.js');

var app = angular.module('app', ['simpleDatatable', 'ngRoute']);

var getUserData = function ($http, scope, status) {
    if (status === 0 ? !scope.data.uncheck : !scope.data.checked) {
        $http
            .get('/adminer/user-admin/' + status)
            .success(function (data) {
                for(var i in data){
                    data[i].joinTime = (new Date(data[i].joinTime)).toLocaleString();
                }
                if (status === 0) {
                    scope.data.uncheck = data;
                    scope.list = scope.data.uncheck;
                } else {
                    scope.data.checked = data;
                    scope.list = scope.data.checked;
                }
                scope.$applyAsync();
            })
    } else {
        scope.list = status === 0 ? scope.data.uncheck : scope.data.checked;
        scope.$applyAsync();
    }
};

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/uncheck', {
            template: '',
            controller: 'UncheckCtrl'
        })
        .when('/checked', {
            template: '',
            controller: 'CheckedCtrl'
        })
        .otherwise({
            redirectTo: '/uncheck'
        });
}]);


app.controller('AppCtrl', ['$scope', '$http', function (scope, $http) {
    scope.tab = undefined;

    scope.data = {
    };

    scope.list = [];

    scope.$watch('tab', function (newVal, oldVal){
        if (newVal == oldVal || typeof newVal === 'undefined') {
            return;
        }
        getUserData($http, scope, newVal);

    });

    scope.sdtOn = function (event, row) {
        var extraParams = Array.prototype.slice.call(arguments, 2);
        var status = 0;
        var remover = extraParams[1];
        if (extraParams[0] === 'pass') {
            status = 1;
        } else if (extraParams[0] === 'reject') {
            status = -3;
        }
        $http
            .post('/adminer/user-admin-action', {
                id: row.id,
                status: status.toString()
            })
            .success(function (ret) {
                if (ret.status) {
                    remover();
                    if (status === 1 && scope.data.checked) {
                        row.status = status;
                        scope.data.checked.push(row);
                        scope.$applyAsync();
                    }
                }
            })
            .error(function () {
                alert('操作失败，请刷新重试');
            });
    };

    scope.actionColFactory =  angular.element('#row-btn').html();

    //window.s = scope;

}]);

app.controller('UncheckCtrl', ['$scope', function (scope) {
    scope.$parent.tab = 0;
}]);

app.controller('CheckedCtrl', ['$scope', function (scope) {
    scope.$parent.tab = 1;
}]);

angular.bootstrap(document.documentElement, ['app']);





