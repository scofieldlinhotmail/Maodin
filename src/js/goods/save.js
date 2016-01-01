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
require('imports?$=jquery!simple-module');
//require('imports?$=jquery!simple-hotkeys');
require('imports?$=jquery!simple-hotkeys');
require('imports?$=jquery!simple-uploader');
var Simditor = require('imports?$=jquery!simditor/lib/simditor.js');
require('angular');
require('imports?$=jquery!jquery-validation');


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
            } catch (e){
                scope.data = [imgDom.data('main')];
            }

            scope.imgs = scope.data.slice();

            scope.mainImgUrl = scope.data[scope.mainImg];
        };

        scope.init();

        uploader.on('fileQueued', function (file) {
            uploader.makeThumb( file, function( error, ret ) {
                if ( error ) {
                    alert('预览失败，请刷新重试');
                } else {
                    scope.imgs.push(ret);
                    scope.data.push(file);
                    scope.$apply();
                }
            }, 640, 260);
        });

        uploader.on('uploadSuccess', function (file, ret) {
            for(var i in scope.data) {
                var ele = scope.data[i];
                //debugger
                if (ele.id && ele.id == file.id) {
                    scope.data[i] =  ret.file_path;
                    break;
                }
            }
        });

        uploader.on('uploadFinished', function () {
            for(var i in scope.data) {
                var ele = scope.data[i];
                var filePath = ele;
                if (i == scope.mainImg) {
                    scope.mainImgUrl = filePath;
                } else{
                    scope.imgsUrl.push(filePath);
                }
            }
            //scope.mainImgUrl = scope.imgsUrl[scope.mainImg];
            scope.$apply();
            $form[0].submit();
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
                brief: {
                    required: true,
                    maxlength: 100
                },
                perStr: {
                    required: true,
                    maxlength: 10
                },
                perNum: {
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
                GoodsTypeId : {
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
                perStr: {
                    required: '请填写单位',
                    maxlength: '文字过长'
                },
                perNum: {
                    required: '请填写每份的量',
                    number: '请填写数字'
                },
                brief: {
                    required: '请填写简介',
                    maxlength: '文字过长'
                },
                oldPrice: {
                    required: '请填写原价',
                    number: '请填写数字'
                },
                capacity: {
                    required: '请填写剩余量',
                    number: '请填写整数'
                },
                GoodsTypeId : {
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


    app.controller('TypeCtl', ['$scope', function (scope){

        var typeDom = angular.element('#types');

        scope.data = JSON.parse(typeDom.html());

        var typeId = typeDom.data('id');

        (function () {
            for(var i in scope.data) {
                var ltype = scope.data[i];
                for(var j in ltype.GoodsTypes) {
                    var stype = ltype.GoodsTypes[j]
                    if (stype.id == typeId) {
                        scope.ltype = ltype;
                        scope.stype = stype;
                        scope.$applyAsync();
                    }
                }
            }
        }());


    }]);


        angular.bootstrap(document.documentElement, ['app']);
});









