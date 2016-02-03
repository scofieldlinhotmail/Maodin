/* css */
require('../admin-base/common.js');
require('fex-webuploader/dist/webuploader.css');
require('../../css/lib/webuploader.scss');
require('../../css/img-upload-thumbnail.scss');
require('simditor/styles/simditor.css');

/* js */
//require('../admin/index');
/* webuplader */

var WebUploader = require('fex-webuploader');
require('simple-module');
//require('simple-hotkeys');
require('simple-hotkeys');
require('simple-uploader');
var Simditor = require('simditor/lib/simditor.js');
require('angular');
require('jquery-validation');
require('eonasdan-bootstrap-datetimepicker');
require('select2/dist/js/select2.js');
require('select2/dist/css/select2.css');

var $ = jQuery;
$(function () {
    var app = angular.module('app', []);

    var uploader = new WebUploader.Uploader({
        swf: '/dist/Uploader.swf',
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/*'
        },
        pick: {
            id: '#upload-picker',
            multiple: true
        },
        fileSizeLimit: 1024 * 1024 * 3,
        fileNumLimit: 10,
        server: '/upload'
    });

    var uploaded = false;

    var editor = new Simditor({
        textarea: $('#editor'),
        upload: {
            url: '/upload',
            fileKey: 'file',
            params: null,
            connectionCount: 3,
        }

        //optional options
    });

    app.controller('UploadCtl', ['$scope', function (scope) {
        scope.imgs = [];

        scope.data = [];
        scope.mainImg = 0;
        scope.mainImgUrl = '';
        scope.imgsUrl = [];

        scope.setMain = function (index) {
            scope.mainImg = index;
        };

        scope.remove = function (index) {
            scope.data.splice(index, 1);
            scope.imgs.splice(index, 1);
        };

        scope.init = function () {
            var imgDom = angular.element('#imgs');
            try {
                if (imgDom.data('main')) {
                    scope.data = [imgDom.data('main')].concat(JSON.parse(imgDom.html()));
                } else {
                    scope.data = [];
                }
            } catch (e) {
                scope.data = [imgDom.data('main')];
            }

            scope.imgs = scope.data.slice();

            scope.mainImgUrl = scope.data[scope.mainImg];
        };

        scope.init();

        uploader.on('fileQueued', function (file) {
            uploader.makeThumb(file, function (error, ret) {
                if (error) {
                    alert('预览失败，请刷新重试');
                } else {
                    scope.imgs.push(ret);
                    scope.data.push(file);
                    scope.$apply();
                }
            }, 512, 512);
        });

        uploader.on('uploadSuccess', function (file, ret) {
            var ele;
            for (var i = 0; i < scope.data.length; i ++) {
                ele = scope.data[i];
                if (ele.id && ele.id == file.id) {
                    scope.data[i] = ret.file_path;
                    break;
                }
            }
        });

        uploader.on('uploadFinished', function () {
            var ele;
            for (var i = 0 ; i < scope.data.length; i ++) {
                ele = scope.data[i];
                var filePath = ele;
                if (i == scope.mainImg) {
                    scope.mainImgUrl = filePath;
                } else {
                    scope.imgsUrl.push(filePath);
                }
            }

            scope.$apply();
            $form[0].submit();
        });

        uploader.on('error', function (err) {
            if (err == 'Q_EXCEED_NUM_LIMIT') {
                alert('文件数量超出限制');
            } else if (err == 'Q_EXCEED_SIZE_LIMIT') {
                alert('图片大小超出限制');
            }
        });


        var $form = $('#form_sample_1');

        $form.validate({
            errorElement: 'span', //default input error message container
            errorClass: 'help-block', // default input error message class
            focusInvalid: false, // do not focus the last invalid input
            ignore: "",
            rules: {
                title: {
                    required: true
                },
                price: {
                    required: true,
                    number: true
                },
                oldPrice: {
                    required: true,
                    number: true
                },
                capacity: {
                    required: true,
                    number: true
                },
                content: {
                    required: true
                },
                baseSoldNum: {
                    required: true,
                    number: true
                },
                integral: {
                    required: true,
                    number: true
                },
                taxRate: {
                    required: true,
                    number: true
                },
                commission1: {
                    required: true,
                    number: true
                },
                commission3: {
                    required: true,
                    number: true
                },
                commission2: {
                    required: true,
                    number: true
                },
                GoodsTypeId: {
                    required: true
                }
            },

            messages: {
                title: {
                    required: '请填写标题'
                },
                price: {
                    required: '请填写价格',
                    number: '请填写数字'
                },
                baseSoldNum: {
                    required: '请填写内容',
                    number: '请填写数字'
                },
                integral: {
                    required: '请填写内容',
                    number: '请填写数字'
                },
                taxRate: {
                    required: '请填写内容',
                    number: '请填写数字'
                },
                commission3: {
                    required: '请填写内容',
                    number: '请填写数字'
                },
                commission2: {
                    required: '请填写内容',
                    number: '请填写数字'
                },
                commission1: {
                    required: '请填写内容',
                    number: '请填写数字'
                },
                oldPrice: {
                    required: '请填写原价',
                    number: '请填写数字'
                },
                capacity: {
                    required: '请填写剩余量',
                    number: '请填写整数'
                },
                GoodsTypeId: {
                    required: '请选择类型'
                }
            },

            invalidHandler: function (event, validator) {
            },

            highlight: function (element) {
                $(element)
                    .closest('.form-group').addClass('has-error');
            },

            unhighlight: function (element) {
                $(element)
                    .closest('.form-group').removeClass('has-error'); // set error class to the control group
            },

            success: function (label) {
                label
                    .closest('.form-group').removeClass('has-error'); // set success class to the control group
            },

            submitHandler: function (form) {
                if (uploaded) {
                    form.submit();
                }
                uploaded = true;
                uploader.upload();
            }
        });
    }]);

    app.controller('FormCtl', ['$scope', function (scope) {

        var typeDom = angular.element('#types');


        scope.typeArr = JSON.parse(typeDom.html());

        (function () {
            for (var i = 0; i < scope.typeArr.length; i++) {
                var ltype = scope.typeArr[i];
                scope.typeArr[i].fields = JSON.parse(scope.typeArr[i].fields);
                for (var j = 0; j < ltype.GoodsTypes.length; j++) {
                    var stype = ltype.GoodsTypes[j];
                    stype.fields = JSON.parse(stype.fields);
                }
            }
        }());

        scope.typeDict = (function () {
            var types = {};
            angular.forEach(scope.typeArr, function (ltype) {
                types[ltype.id] = ltype;
                angular.forEach(ltype.GoodsTypes, function (stype) {
                    types[stype.id] = stype;
                });
            });
            return types;
        })();

        var typeIds = typeDom.data('id');

        try {
            var $select = $('[name="typeIds"]');
            $select.select2();
            $select.val(typeIds).trigger('change');
            scope.typeIds = typeIds;
            scope.$applyAsync();
        }catch (ex) {
        }

        scope.$watchCollection('typeIds', function (newVal, oldVal) {
            if (typeof newVal === 'undefined') {
                return;
            }
            var types = [];
            var ids = [];
            angular.forEach(scope.typeIds, function (typeId) {
                ids.push(typeId);
                var stype = scope.typeDict[typeId];
                if (ids.indexOf(stype.GoodsTypeId) == -1) {
                    ids.push(stype.GoodsTypeId);
                    var ltype = scope.typeDict[stype.GoodsTypeId];
                    types.push(ltype);
                }
                types.push(stype);
            });
            scope.types = types;
        });


        var extraFieldsStr = angular.element("#extraFields").html().trim();
        var extraFields = {};
        if (extraFieldsStr.length != 0) {
            extraFieldsStr = JSON.parse(extraFieldsStr);
            for (var key in extraFieldsStr) {
                if (extraFieldsStr.hasOwnProperty(key)) {
                    var field = extraFieldsStr[key];
                    extraFields[field.id] = field.value;
                }
            }
            scope.extraFields = extraFields;
        }
        window.s = scope;

    }]);

    angular.bootstrap(document.documentElement, ['app']);

    $('[type=datetime]').datetimepicker({});


});









