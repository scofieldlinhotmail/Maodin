/* css */
require('../admin-base/common.js');
require('../../css/shared/table.scss');

require('angular');
require('angular-messages');
require('angular-animate');
require('imports?$=jquery!jquery-validation');
require('ajaxform/build/ajaxform-0.1.2.js');

var $ = jQuery;
$(function () {
    var app = angular.module('app', ['ngMessages', 'ngAnimate']);
    var $form = $('#form');
    app.filter('typeStr', function () {
        return function (val) {
            val = parseInt(val);
            switch (val) {
                case 0:
                    return '文本输入框';
                case 1:
                    return '数字输入框';
                case 2:
                    return '时间输入框';
                case 3:
                    return '单选下拉框';
                case 4:
                    return '多选下拉框';
            }
        };
    });

    app.controller('MainCtrl', ['$scope', function (scope) {

        scope.options = [];

        scope.$on('edit-emit', function (e, index) {
            scope.$broadcast('edit-broadcast', index);
        });

    }]);

    app.controller('FormCtrl', ['$scope', '$http', function (scope, $http) {

        scope.submit = function (){
            scope.theForm.$submitted = true;
            $http.post('')
        }

    }]);

    app.controller('ExtCtrl', ['$scope', function (scope) {

        scope.options = [];
        scope.title = '';
        scope.optionInput = '';
        scope.id = '';
        scope.index = -1;

        scope.$watch('type', function (newVal, oldVal) {
            if (typeof newVal == 'undefined' || newVal === oldVal) {
                return;
            }
        });

        scope.addOption = function () {
            var val = scope.optionInput.trim();
            if (val.length !== 0) {
                scope.options.push(val);
            }
            scope.optionInput = '';
        };

        scope.removeOption = function (index) {
            scope.options.splice(index, 1);
        };

        scope.clear = function () {
            scope.optionInput = '';
            scope.title = '';
            scope.type = '';
            scope.options = [];
            scope.index = -1;
        };

        scope.add = function () {
            scope.title = scope.title.trim();
            if (scope.title.length === 0) {
                alert('请输入增加的属性的属性名');
                return;
            }
            if (scope.type >= 3 && scope.options.length === 0) {
                alert('请添加候选值');
                return;
            }
            if (scope.index === -1) {
                scope.$parent.options.push({
                    id: Date.now(),
                    title: scope.title,
                    type: scope.type,
                    options: scope.options
                });
            } else {
                scope.$parent.options[scope.index] = {
                    id: scope.id,
                    title: scope.title,
                    type: scope.type,
                    options: scope.options
                };
            }
            scope.clear();
        };

        scope.$on('edit-broadcast', function (e, index) {

            var item = scope.$parent.options[index];
            scope.options = item.options;
            scope.title = item.title;
            scope.type = item.type;
            scope.optionInput = item.optionInput;
            scope.id = item.id;
            scope.index = index;
        });

    }]);

    app.controller('ExtListCtrl', ['$scope', function (scope) {

        scope.edit = function (index) {
            scope.$emit('edit-emit', index);
        };

        scope.remove = function (index) {
            if (!window.confirm("是否确认删除")) {
                return;
            }
            scope.$parent.options.splice(index, 1);
        };
    }]);

    angular.bootstrap(document.documentElement, ['app']);

});









