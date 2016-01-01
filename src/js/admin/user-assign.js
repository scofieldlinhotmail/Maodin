require('../../css/admin-base/common.js');

/* js */
require('../admin/index');
/* webuplader */

require('angular');
var moment = require('moment');
require('jquery-validation');
require('eonasdan-bootstrap-datetimepicker');

var $ = jQuery;

var app = angular.module('app', []);

var ajaxErrorCb = function () {
    alert('操作失败，请刷新重试');
};

var find = function (arr, funcOrVal, key) {
    for(var i in arr) {
        if (typeof funcOrVal === 'function' && funcOrVal(arr[i], i, arr)){
            return {
                key: i,
                value: arr[i]
            }
        } else {
            var ele = typeof key === 'undefined' ? arr[i] : arr[i][key];
            if (ele == funcOrVal){
                return {
                    key: i,
                    value: arr[i]
                }
            }
        }
    }
};

$(function () {
    $('.date-picker').find('input').datetimepicker({
        //locale: 'zh-cn'
    });
});

app.filter('statusStr', function () {
    return function (val){
        switch (val) {
            case -1:
                return '待分配';
            case 0:
                return '待审核';
            case 1:
                return '已审核';
        }
    };
});

app.controller('AppCtrl', ['$scope', function (scope) {
}]);

app.controller('ListCtrl', ['$scope', '$http', function (scope, $http) {

    scope.canload = true;
    scope.numPerPage = 25;
    scope.page = 1;
    scope.topPage = 1;
    scope.status = undefined;
    scope.data = [];
    scope.list = [];
    scope.count = 0;
    scope.totalPage = 0;
    scope.loading = false;
    scope.selectedIds = [];
    scope.all = false;

    scope.listWrap = function () {
        for(var i in scope.list){
            scope.list[i].selected = typeof find(scope.selectedIds, scope.list[i].id) !== 'undefined';
        }
    };

    var daterange = angular.element('.input-large input');

    scope.get = function () {
        scope.loading = true;
        var page = scope.page;
        var start = scope.data.length;
        $http
            .post('/adminer/get-user', {
                page: scope.page,
                status: scope.status,
                first: page == 1,
                startDate: daterange.eq(0).val(),
                endDate: daterange.eq(1).val(),
                name: scope.name,
                phone: scope.phone,
                areas: scope.areas
            })
            .success(function (data) {
                scope.loading = false;
                if (page == 1) {
                    scope.count = data.num;
                    scope.totalPage = Math.ceil(scope.count / (scope.numPerPage * 1.0));
                }
                data = data.users;
                if (data.length < scope.numPerPage) {
                    scope.canload = false;
                }
                for(var i in data) {
                    data[i].opened = false;
                    data[i].payTime = moment(data[i].payTime).format("YY/MM/DD hh:mm:ss");
                }
                scope.data = scope.data.concat(data);
                scope.list = scope.data.slice(start, scope.data.length);
                //scope.listWrap();
                scope.topPage = page;
                scope.$applyAsync();
            }).error(ajaxErrorCb);
    };

    scope.$watch('page', function (newVal, oldVal) {
        if (typeof newVal === 'undefined' || newVal == oldVal || newVal < 1){
            return;
        }
        if (newVal < scope.topPage) {
            scope.list = scope.data.slice((newVal - 1) * scope.numPerPage, newVal * scope.numPerPage);
        }else {
            scope.get();
        }
    });

    scope.$watchCollection('list', function (newVal, oldVal) {
        if (typeof newVal === 'undefined') {
            return;
        }
        scope.listWrap();
    });

    scope.search = function () {
        scope.data = [];
        scope.page = 1;
        scope.get();
    };

    scope.reset = function (){
        scope.goodsIds = [];
        scope.areas = [];
        scope.name = '';
        scope.phone = '';
        daterange.eq(0).val('');
        daterange.eq(1).val('');
        scope.status = '';
    };

    var allCheckbox = angular.element('#all-checkbox');

    scope.select = function (id) {
        if (id == 'all') {
            if(scope.all) {
                for(var i in scope.list) {
                    var ele = find(scope.selectedIds, scope.list[i].id);
                    if (ele) {
                        scope.selectedIds.splice(ele.key, 1);
                    }
                }
            } else {
                for(var i in scope.list) {
                    var ele = find(scope.selectedIds, scope.list[i].id);
                    if (!ele) {
                        scope.selectedIds.push(scope.list[i].id);
                    }
                }
            }
            scope.all = !scope.all;
            scope.listWrap();
            return;
        } else if (id == 'to be empty'){
            scope.selectedIds = [];
            scope.all = false;
            scope.listWrap();
            return;
        }
        var ele = find(scope.selectedIds, id);
        if (ele){
            scope.selectedIds.splice(ele.key, 1);
            return;
        } else {
            scope.selectedIds.push(id);
        }
        scope.listWrap();
    };

    var modal = $('#modal');
    var submitIds = [];
    scope.action = function (id) {

        var ids = [];
        if (typeof id !== 'undefined') {
            ids.push(id);
        } else {
            ids = scope.selectedIds;
        }
        if (ids.length === 0) {
            return;
        }
        submitIds = ids;
        modal.modal('show');
    };

    scope.submit = function () {
        if (!scope.counterman) {
            return;
        }
        modal.modal('hide');
        $http
            .post('/adminer/user-assign', {
                ids: submitIds,
                adminerId: scope.counterman
            })
            .success(function (data) {
                for(var i in submitIds) {
                    var user = find(scope.data, submitIds[i], 'id');
                    if (user) {
                        scope.data[user.key].status = 0;
                        scope.data[user.key].Adminer = data;
                    }
                    user = find(scope.list, submitIds[i], 'id');
                    if (user ) {
                        if (user.status == -1) {
                            scope.list[user.key].status = 0;
                        }
                        scope.data[user.key].Adminer = data;
                    }
                }
                scope.$applyAsync();

            }).error(ajaxErrorCb);
    };

    scope.export = function (type) {

        var form = angular.element('#export-form');
        var inputs = form.find('input');
        inputs.eq(0).val(JSON.stringify(scope.selectedIds));
        inputs.eq(1).val(type);
        form.submit();

    };

    scope.get();

    window.s = scope;

}]);

app.controller('UserCtrl', ['$scope', '$http', function (scope, $http) {

    scope.$watch('order.opened', function (newVal, oldVal) {
        if (typeof newVal === 'undefined' || newVal == oldVal || newVal != true){
            return;
        }
        $http
            .get('/adminer/get-orderitem/' + scope.order.id)
            .success(function (data) {
                scope.order.orderItems = data;
            }).error(ajaxErrorCb);
    });

}]);

angular.bootstrap(document.documentElement, ['app']);


