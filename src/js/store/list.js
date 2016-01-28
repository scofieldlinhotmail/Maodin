require('./../admin-base/common.js');
require('angular');
require('angular-route');
require('../../css/store/list.scss');
require('../angular.simple-datatables.js');

var app = angular.module('app', ['simpleDatatable', 'ngRoute']);


var getData = function ($http, scope, status) {
    if (status === 0 ? !scope.data.uncheck : !scope.data.checked) {
        $http
            .get('./list/' + status)
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

var _modal;
var modal = function () {
    if (!_modal) {
        _modal = angular.element('#modal');
    }
    return _modal;
};

var _editModal;
var editModal = function () {
    if (!_editModal) {
        _editModal = angular.element('#edit-modal');
    }
    return _editModal;
};

var ajaxError = function () {
    alert('操作失败，请刷新重试');
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
        getData($http, scope, newVal);
    });

    scope.sdtOn = function (event, row) {

        var extraParams = Array.prototype.slice.call(arguments, 2);
        var status = 0;
        var remover = extraParams[extraParams.length - 1];

        if (extraParams[0] == 'check') {
            scope.check(extraParams[1], [row.id])
        }
        if (event === 'see') {
            $http.post('./detail', {
                id: row.id
            }, {
                cache: true
            }).success(function (data) {
                scope.modalData = data;
                modal().modal('show');
                scope.$applyAsync();
            }).error(ajaxError);
        } else if (event=== 'lock' || event === 'unlock') {
            scope.action(event, [row.id])
        } else if (event === 'edit') {
            angular.element('#selectTopStore').val(row.StoreId);
            scope.editModalData = angular.copy(row);
            editModal().modal('show');
        }
    };

    scope.check = function (event, data) {
        if (!data) {
            data = scope.sdtSelected.map(function (row) {
                return row.id;
            });
        }
        $http
            .post('./check', {
                ids: data,
                action: event
            })
            .success(function (ret) {
                angular.forEach(data, function (id) {
                    var user = scope.find(id, scope.data.inactive);
                    if (!user) {
                        return;
                    }
                    scope.data.inactive.splice(user.key, 1);
                    if (event == 'pass') {
                        if (scope.data.active) {
                            scope.data.active.push(user.value);
                        }
                    }
                });
                scope.$applyAsync();
            })
            .error(ajaxError);
    };

    scope.action = function (event, data) {
        if (!data) {
            data = scope.sdtSelected.map(function (row) {
                return row.id;
            });
        }
        $http
            .post('./action', {
                ids: data,
                action: event
            })
            .success(function (ret) {
                angular.forEach(data, function (id) {
                    var user = scope.find(id, scope.list);
                    if (!user) {
                        return;
                    }
                    if (event === 'lock') {
                        user.value.deletedAt = new Date();
                    } else {
                        user.value.deletedAt = null;
                    }
                });
                scope.$applyAsync();
            })
            .error(ajaxError);
    };

    scope.find = function (id, src) {
        for(var i = 0; i < src.length; i ++) {
            if (src[i].id == id) {
                return {
                    key: i,
                    value: src[i]
                };
            }
        }
    };

    scope.editSubmit = function () {
        if (scope.editForm.$invalid) {
            return;
        }
        scope.editModalData.StoreId = angular.element('#selectTopStore').val();
        $http.post('./save', {
            id: scope.editModalData.id,
            username: scope.editModalData.username,
            name: scope.editModalData.name,
            phone: scope.editModalData.phone,
            StoreId: scope.editModalData.StoreId
        })
            .success(function () {
                editModal().modal('hide');
                var storeKey = scope.find(scope.editModalData.id, scope.list).key;
                scope.list[storeKey] = scope.editModalData;
                if (scope.editModalData.StoreId) {
                    scope.list[storeKey].TopStore = scope.find(scope.editModalData.StoreId, scope.list).value;
                } else {
                    scope.list[storeKey].TopStore = null;
                }
                scope.$applyAsync();
            }).error(ajaxError);
    };


    scope.actionColFactory =  angular.element('#row-btn').html();

    scope.clearSelect = function () {
        scope.sdtSelected = [];
    };

}]);

app.controller('ActiveCtrl', ['$scope', function (scope) {
    scope.$parent.tab = 1;
}]);

app.controller('InactiveCtrl', ['$scope', function (scope) {
    scope.$parent.tab = 0;
}]);


angular.bootstrap(document.documentElement, ['app']);





