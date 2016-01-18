/**
 * Created by lxc on 16-1-16.
 */
require('../admin-base/common.js');
require('../../css/admin/slideshow.scss');
require('fex-webuploader/dist/webuploader.css');

var WebUploader = require('fex-webuploader');

var $ = jQuery;
// 文件上传



// 图片上传
jQuery(function() {
    var $ = jQuery,
        $list = $('#fileList'),
    // 优化retina, 在retina下这个值是2
        ratio = window.devicePixelRatio || 1,

    // 缩略图大小
        thumbnailWidth = 100 * ratio,
        thumbnailHeight = 100 * ratio,

    // Web Uploader实例
        uploader;

    // 初始化Web Uploader
    console.log('init');
    uploader =new WebUploader.Uploader({

        // 自动上传。
        auto: false,

        // swf文件路径
        swf: '/dist/Uploader.swf',

        // 文件接收服务端。
        server:'/upload',
        // 选择文件的按钮。可选。
        // 内部根据当前运行是创建，可能是input元素，也可能是flash.
        pick: '#filePicker',
        fileNumLimit: 1,
        // 只允许选择文件，可选。
        accept: {
            title: 'Images',
            extensions: 'gif,jpg,jpeg,bmp,png',
            mimeTypes: 'image/*'
        }
    });

    // 当有文件添加进来的时候
    uploader.on( 'fileQueued', function( file ) {
        var $li = $(
                '<div id="' + file.id + '" class="file-item thumbnail">' +
                '<img>' +
                '<div class="info">' + file.name + '</div>' +
                '</div>'
            ),
            $img = $li.find('img');

        $list.append( $li );

        // 创建缩略图
        uploader.makeThumb( file, function( error, src ) {
            if ( error ) {
                $img.replaceWith('<span>不能预览</span>');
                return;
            }

            $img.attr( 'src', src );
        }, thumbnailWidth, thumbnailHeight );
    });

    // 文件上传过程中创建进度条实时显示。
    uploader.on( 'uploadProgress', function( file, percentage ) {
        var $li = $( '#'+file.id ),
            $percent = $li.find('.progress span');

        // 避免重复创建
        if ( !$percent.length ) {
            $percent = $('<p class="progress"><span></span></p>')
                .appendTo( $li )
                .find('span');
        }

        $percent.css( 'width', percentage * 100 + '%' );
    });

    // 文件上传成功，给item添加成功class, 用样式标记上传成功。
    uploader.on( 'uploadSuccess', function( file,path ) {
        $( '#'+file.id ).addClass('upload-state-done');
        $("#add2").val(path.file_path);

    });

    // 文件上传失败，现实上传出错。
    uploader.on( 'uploadError', function( file ) {
        var $li = $( '#'+file.id ),
            $error = $li.find('div.error');

        // 避免重复创建
        if ( !$error.length ) {
            $error = $('<div class="error"></div>').appendTo( $li );
        }
        $error.text('上传失败');
    });

    // 完成上传完了，成功或者失败，先删除进度条。
    uploader.on( 'uploadComplete', function( file ) {
        $( '#'+file.id ).find('.progress').remove();
        var v1=$("#add1").val();
        var v2=$("#add2").val();
        if(v2==""){
            alert(" 请上传图片");
        }else
         $.ajax({

                    type: 'get',

                    url: "add" ,

                    data: {img:v2,link:v1} ,

                    success: function(id){
                        $(".close").click();

                        var s="";
                        s+='<tr class="odd gradeX" tr-id="'+id+'">'
                        s+='    <td><img class="img" src="'+v2+'"></td>'
                        s+='   <td ><span class="link">'+v1+'</span> </td>'
                        s+='    <td>'
                        s+='    <div class="btns" >'
                        s+='    <button data-id="'+id+'" class="btn red btn-sm delbtn ">删除</button>'
                        s+='    </div>'
                        s+='    </td>'
                        s+='    </tr>'
                        $("tbody").append(s);
                        $(".delbtn").click(function(){
                            var id=$(this).attr("data-id");
                            $.ajax({

                                type: 'get',

                                url: "del" ,

                                data: {id:id} ,

                                success: function(){
                                    $("tr[tr-id="+id+"]").remove();
                                }
                            });
                        });
                        clear();

                    }
                });
    });

    $("#add1btn").click(function(){
        var v1=$("#add1").val();
        if(v1==""){
            alert(" 请输入链接");
        }
        else{
            if(uploader.getFiles().length>0);
              uploader.upload();
        }

    });
    $("#close").click(function(){
        clear();
    });
    $(".close").click(function(){
        clear();
    });
    function clear(){
        var v1=$("#add1").val("");
        var v2=$("#add2").val("");
        uploader.reset();
        $list.html( "" );
    }
});

$(".delbtn").click(function(){
    var id=$(this).attr("data-id");
    $.ajax({

        type: 'get',

        url: "del" ,

        data: {id:id} ,

        success: function(){
            $("tr[tr-id="+id+"]").remove();
        }
    });
});







