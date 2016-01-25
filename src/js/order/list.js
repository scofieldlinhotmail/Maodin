require('../admin-base/common.js');

/* js */
require('../admin/index');
/* webuplader */

require('exports?window.angular!imports?$=jquery!angular');
var moment = require('moment');
require('imports?$=jquery!jquery-validation');
require('eonasdan-bootstrap-datetimepicker');

require('select2/dist/css/select2.css');
require('imports?$=jquery!select2');

var orderStatusToString = require('../shared/orderStatusToString.js');

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
        //locale: 'zh'
    });

    $('.select2').select2({
        placeholder: "可多选",
        allowClear: true
    });
});

app.filter('statusStr', function () {
    return orderStatusToString;
});

var _modal;
var modal = function () {
    if (!_modal) {
        _model = angular.element('#modal');
    }
    return _modal;
};

app.controller('AppCtrl', ['$scope', function (scope) {

    scope.modalData = {};

    scope.$on('see', function (e, data) {
        scope.modalData = data;
    });

}]);

app.controller('OrderListCtrl', ['$scope', '$http', function (scope, $http) {

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
            .post('/adminer-order/get-order', {
                page: scope.page,
                status: scope.status,
                first: page == 1,
                startDate: daterange.eq(0).val(),
                endDate: daterange.eq(1).val(),
                recieverName: scope.recieverName,
                phone: scope.phone,
                goodsIds: scope.goodsIds,
                type: scope.type
            })
            .success(function (data) {
                scope.loading = false;
                if (page == 1) {
                    scope.count = data.num;
                    scope.totalPage = Math.ceil(scope.count / (scope.numPerPage * 1.0));
                }
                data = data.orders;
                if (data.length < scope.numPerPage) {
                    scope.canload = false;
                }
                for(var i in data) {
                    data[i].opened = false;
                    data[i].createdAt = data[i].createdAt ? moment(data[i].createdAt).format("YY/MM/DD hh:mm:ss") : '';
                    data[i].payTime = data[i].payTime ? moment(data[i].payTime).format("YY/MM/DD hh:mm:ss") : '';
                    data[i].sendTime = data[i].sendTime ? moment(data[i].sendTime).format("YY/MM/DD hh:mm:ss") : '';
                    data[i].recieveTime = data[i].recieveTime ? moment(data[i].recieveTime).format("YY/MM/DD hh:mm:ss") : '';
                    data[i].returnRequestTime = data[i].returnRequestTime ? moment(data[i].returnRequestTime).format("YY/MM/DD hh:mm:ss") : '';
                    data[i].returnTime = data[i].returnTime ? moment(data[i].returnTime).format("YY/MM/DD hh:mm:ss") : '';
                    data[i].deletedAt = data[i].deletedAt ? '否' : '是';
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
        scope.recieverName = '';
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

    scope.action = function (status, id) {
        var ids = [];
        if (typeof id !== 'undefined') {
            ids.push(id);
        } else {
            ids = scope.selectedIds;
        }
        $http
            .post('/adminer-order/order/status', {
                ids: ids,
                status: status
            })
            .success(function () {
                for(var i in ids) {
                    var order = find(scope.data, ids[i], 'id');
                    if (order) {
                        if (scope.data[order.key].status == 1 && status == 2) {
                            scope.data[order.key].status = status;
                        } else if (scope.data[order.key].status == 2  && status == 3) {
                            scope.data[order.key].status = 10;
                            scope.data[order.key].returnStatus = 2;
                        }
                    }
                }
                scope.$applyAsync();

            }).error(ajaxErrorCb);
    };


    var form = angular.element('#export-form');
    var inputs = form.find('input');


    scope.$applyAsync(function () {
        scope.get();
    });


    window.s = scope;

}]);




app.controller('OrderCtrl', ['$scope', '$http', function (scope, $http) {

    var loading = false;
    scope.$watch('order.opened', function (newVal, oldVal) {
        if (typeof newVal === 'undefined' || newVal == oldVal || newVal != true){
            return;
        }
        if (loading || scope.order.orderItems) {
            return;
        }
        loading = true;
        scope.loadItem();
    });

    scope.loadItem = function () {
        $http
            .get('/adminer-order/get-orderitem/' + scope.order.id, {
                cache: true
            })
            .success(function (data) {
                scope.order.orderItems = data;
            }).error(ajaxErrorCb);
    };

    scope.see = function (order) {
        scope.loadItem();
        scope.$emit('see', order);
    };

}]);

angular.bootstrap(document.documentElement, ['app']);


