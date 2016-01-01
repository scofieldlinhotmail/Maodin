/**
 * Created by nobody on 2015/10/7.
 */
(function () {

    var simpleDataTable = angular.module('simpleDatatable', []);

    var injector = angular.injector(["ng"]);

    angular.element('<style>' +
        '.sdt-orderby { position: relative !important; }' +
        '.sdt-orderby-desc { position: relative !important; }' +
        '.sdt-orderby:after{content: ""; position: absolute; top: 50%; margin-top: -12px; right:8px; border-style: solid; border-width: 8px; border-color: transparent transparent #008080 transparent; }' +
        '.sdt-orderby-desc:after{content: ""; position: absolute; bottom: 50%; margin-bottom: -12px; right:8px; border-style: solid; border-width: 8px; border-color: #008080 transparent transparent transparent; }' +
        '</style>').appendTo('head');

    var getProperty = function ($parse, ctx, propertyStr) {
        if (propertyStr === '$this') {
            return ctx;
        }
        var getter = $parse(propertyStr);
        return getter(ctx);
    };

    var find = function (collection, filter) {
        for(var i in collection) {
            var item = collection[i];
            if (filter(item)) {
                return {
                    item: item,
                    index: i
                };
            }
        }
    };

    var quickSortBy = function($parse, arr, property, compare, reverse) {
        if (arr.length <= 1) { return arr; }
        var pivotIndex = Math.floor(arr.length / 2);
        var pivot = arr.splice(pivotIndex, 1)[0];
        var pivotVal = getProperty($parse, pivot, property);
        var left = [];
        var right = [];
        for (var i = 0; i < arr.length; i++){
            var compareResult;
            var item = getProperty($parse, arr[i], property);
            if (typeof compare === 'function') {
                compareResult = compare(item, pivotVal);
            } else {
                compareResult = item < pivotVal;
            }
            if (reverse) {
                compareResult = !compareResult;
            }
            if (compareResult) {
                left.push(arr[i]);
            } else {
                right.push(arr[i]);
            }
        }
        return quickSortBy($parse, left, property, compare, reverse).concat([pivot], quickSortBy($parse, right, property, compare, reverse));
    };

    simpleDataTable.filter('property', ['$parse', '$sce', function ($parse, $sce) {
        return function (ctx, propertyStr) {
            var val = getProperty($parse, ctx, propertyStr);
            val = typeof val === 'undefined' ? '' : val;
            if (val instanceof  Date) {
                val = val.toLocaleString();
            }
            return $sce.trustAsHtml(val.toString());
        };
    }]);

    simpleDataTable.directive('simpleDatatable', function (){
        return {
            restrict: "A",
            require: [
                "ngModel",
                "?sdtPerpageBoxInit",
                "?sdtRowId",
                '?sdtActionCol',
                '?sdtRowEdit',
                '?sdtPerPage',
                '?sdtOn'
            ],
            scope: {
                'ngModel': '=',
                'sdtPerpageBoxInit': '=',
                sdtOn: '=',
                sdtActionCol: '=',
                sdtRowEdit: '=',
                'sdtRowId': '@',
                sdtPerPage: '@'
            },
            controller: ['$scope', '$element', '$compile', '$parse', function (scope, element, $compile, $parse) {

                // elements
                var table = element.find('table'),
                    ths = table.find('thead th'),
                    tbody = table.find('tbody');

                // scope init
                scope.page = 1;
                scope.pageInput = scope.page;
                scope.perPage = 10;
                scope.list = [];
                scope.currentList = [];
                scope.totalPage = Math.ceil(scope.ngModel.length / scope.perPage);
                scope.sortCol = undefined;
                scope.sortColReverse = false;
                scope.sdtRowId = scope.sdtRowId || 'id';
                angular.copy(scope.ngModel, scope.list);

                // scope
                scope.colNames = [];
                //scope.colSortType = [];
                ths.each(function (index, ele) {
                    ele = angular.element(ele);
                    var colName = ele.data('sdt-col');
                    if (colName) {
                        scope.colNames.push(colName);
                        index = scope.colNames.length - 1;
                        ele.attr('ng-click', 'sort(' + index + ', sortCol == ' + index + ')');
                        ele.attr('class', ele.attr('class') + ' {{ sortCol == ' + index + ' ? (sortColReverse ? "sdt-orderby-desc" : "sdt-orderby" ) : ""}} ');
                        //var sortType = ele.attr('sdt-sort-type');
                        //switch (sortType) {
                        //    case 'number': {
                        //        scope.colSortType.push(function (item, pivot) {
                        //          return parseFloat(item) < pivot;
                        //        })
                        //    }
                        //    default :{
                        //        scope.colSortType.push(undefined);
                        //    }
                        //}
                    }
                    ele.css('cursor', 'pointer');
                });
                $compile(ths)(scope);


                scope.goto = function (page) {
                    
                    if (page) {
                        if (page < 1) {
                            page = 1;
                        }
                        if (page * scope.perPage > scope.list.length) {
                            page = scope.totalPage;
                        }
                        scope.page = page;
                    }
                    scope.currentList = scope.list.slice((scope.page - 1) * scope.perPage, scope.page * scope.perPage);
                    scope.$applyAsync();
                };

                scope.setPerPage = function (perPage) {
                    
                    if (perPage === 'all') {
                        scope.perPage = scope.list.length;
                    } else{
                        scope.perPage = perPage;
                    }
                    scope.$applyAsync();
                };

                scope.click = function (index, event) {
                    var row = scope.currentList[index];
                    var params= [event, row].concat(Array.prototype.slice.call(arguments, 2));
                    if (event === 'remove') {
                        var item = find(scope.ngModel, function (item) {
                            return item[scope.sdtRowId] == row.id;
                        });
                        if (item) {
                            if (typeof scope.sdtOn === 'function') {
                                scope.sdtOn.apply(null, params.concat([remove]));
                            } else {
                                remove();
                            }
                            function remove() {
                                scope.ngModel.splice(item.index, 1);
                                scope.$applyAsync();
                            }
                        }
                        return;
                    }
                    if (typeof scope.sdtOn === 'function') {
                        scope.sdtOn.apply(null, params);
                    }
                };

                scope.sort = function (index, reverse) {
                    if (typeof  index === 'undefined') {
                        return;
                    }
                    
                    if (scope.sortCol === index && scope.sortColReverse === reverse) {
                        reverse = ! reverse;
                    }
                    scope.sortColReverse = reverse;
                    var col = scope.colNames[index];
                    scope.list = quickSortBy($parse, scope.list, col, undefined, reverse/*, scope.colSortType[index]*/);
                    scope.sortCol = index;
                };

                var lastSearch;
                scope.search = function () {
                    var searchText = scope.searchInput;
                    
                    var list  = [];
                    for(var i in scope.ngModel) {
                        var item = scope.ngModel[i];
                        for(var col in scope.colNames) {
                            try {
                                if (getProperty($parse, item, scope.colNames[col]).toString().indexOf(searchText) !== -1) {
                                    list.push(item);
                                    break;
                                }
                            } catch (e) {

                            }
                        }
                    }
                    scope.page = 1;
                    scope.list = list;
                    lastSearch = searchText;
                    scope.sort(scope.sortCol, false);
                };

                // watch
                scope.$watch('[page, perPage, sortCol]', function (newVal, oldVal) {
                    if (oldVal[0] === newVal[0] && oldVal[1] === newVal[1] && oldVal[2] === newVal[2]) {
                        return;
                    }
                    if (oldVal[0] !== newVal[0]) {
                        scope.pageInput = scope.page;
                    }
                    scope.goto();
                });

                scope.$watchCollection('list', function (newVal, oldVal) {
                    if (angular.equals(oldVal, newVal)) {
                        return;
                    }
                    scope.totalPage = Math.ceil(scope.list.length / scope.perPage);
                    
                    scope.goto();
                });

                scope.trWrapper = function () {
                    var str = '' +
                        '<tr ng-repeat="row in currentList track by $index" >' +
                        '<td ng-repeat="name in colNames" ng-bind-html="row | property: name">' +
                            //'{{row | property: name}}' +
                        '</td>';
                    if (scope.sdtActionCol) {
                        var actionCol = scope.sdtActionCol;
                        actionCol = actionCol.replace('sdt-row-remove', "ng-click='click($index, \"remove\")'");
                        actionCol = actionCol.replace(/sdt-row-click="(.*?)"/g, function (searchValue, replaceValue) {
                            return "ng-click='click($index, " + replaceValue.split(',').map(function (item) {
                                return "\"" + item.trim() + "\"";
                            }).join(',') + ")'";
                        });
                        str += actionCol;
                    }
                    str += "</tr>";
                    tbody.html($compile(str)(scope));
                };

                scope.$watchCollection('ngModel', function (newVal, oldVal) {
                    if (angular.equals(oldVal, newVal)) {
                        return;
                    }
                    scope.search();
                });

                scope.$watchCollection('sdtActionCol', function (newVal, oldVal) {
                    if (angular.equals(oldVal, newVal)) {
                        return;
                    }
                    scope.trWrapper();
                });

                // init action
                scope.goto(1);

                if (typeof scope.sdtPerpageBoxInit === 'function') {
                    scope.sdtPerpageBoxInit(scope.setPerPage);
                }

            // env bind
                // draw tr
                scope.trWrapper();


                // bind search event
                scope.searchInput = '';
                var searchInput = element.find('[sdt-search-input]');
                searchInput.attr('ng-model', 'searchInput');
                searchInput.attr('ng-keydown', '$event.keyCode === 13 && search()');
                $compile(searchInput)(scope);

                var searchBtn = element.find('[sdt-search-btn]');
                searchBtn.attr('ng-click', 'search()');
                $compile(searchBtn)(scope);

                //
                var totalLabel = element.find('[sdt-total-label]');
                totalLabel.html('{{list.length}}');
                $compile(totalLabel)(scope);

                var totalPageLabel = element.find('[sdt-total-page]');
                totalPageLabel.html('{{totalPage}}');
                $compile(totalPageLabel)(scope);

                var pageInput = element.find('[sdt-page-input]');
                pageInput.attr('ng-model', 'pageInput');
                pageInput.attr('max', '{{totalPage}}');
                $compile(pageInput)(scope);

                var pageBtn = element.find('[sdt-page-btn]');
                pageBtn.attr('ng-click', 'goto(pageInput)');
                $compile(pageBtn)(scope);

                pageBtn = element.find('[sdt-prev-btn]');
                pageBtn.attr('ng-click', 'goto(page - 1)');
                pageBtn.attr('ng-show', 'page != 1 && totalPage != 0');
                $compile(pageBtn)(scope);

                pageBtn = element.find('[sdt-next-btn]');
                pageBtn.attr('ng-click', 'goto(page + 1)');
                pageBtn.attr('ng-show', 'page < totalPage');
                $compile(pageBtn)(scope);

                scope.$applyAsync();

            }]
        };
    });

}());