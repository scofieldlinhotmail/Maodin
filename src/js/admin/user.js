require('./../admin-base/common.js');
require('angular');
require('angular-route');
require('../angular.simple-datatables.js');
require('./../../css/shared/table.scss');

var app = angular.module('app', ['simpleDatatable']);

var getUserData = function ($http, scope, status) {
    $http
        .get('./user-data' )
        .success(function (data) {
            for(var i in data){
                data[i].joinTime = (new Date(data[i].joinTime)).toLocaleString();
                data[i].subscribe_time = (new Date(data[i].subscribe_time)).toLocaleString();
                data[i].headimgurl = '<img src="' +  data[i].headimgurl + '" >';
            }
            scope.data = data;
            scope.$applyAsync();
        });
};

var _modal;
var modal = function () {
    if (!_modal) {
        _modal = angular.element('#modal');
    }
    return _modal;
};

app.controller('AppCtrl', ['$scope', '$http', function (scope, $http) {

    scope.data = {
    };

    scope.list = [];


    scope.sdtOn = function (event, row) {
        var extraParams = Array.prototype.slice.call(arguments, 2);
        var status = 0;
        if (extraParams[0] === 'integralReward') {

            modal().modal('show');

            scope.edittingUserId = row.id;
        }
    };

    scope.submitIntegralReward = function () {

        var id = scope.edittingUserId;
        var integralReward = scope.integralReward;
        $http.post('./user-integral-reward', {
            id: id,
            integralReward: integralReward
        }).success(function () {
            var user = scope.find(id);
            if (!user) {
                return;
            }
            scope.data[user.key].integral += integralReward;
            scope.data[user.key].totalIntegral += integralReward;
            modal().modal('hide');
            scope.$applyAsync();

        }).error(function () {
            alert('操作失败,请刷新重试');
        });

    };

    scope.actionColFactory =  angular.element('#row-btn').html();

    scope.find = function (id) {
        for(var i = 0; i < scope.data.length; i ++) {
            if (scope.data[i].id == id) {
                return {
                    key: i,
                    value: scope.data[i]
                };
            }
        }
    };

    window.s = scope;

    scope.$applyAsync(function () {
        getUserData($http, scope);
    });

}]);


angular.bootstrap(document.documentElement, ['app']);





