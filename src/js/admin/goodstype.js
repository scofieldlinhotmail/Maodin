require('../admin-base/common.js');
require('../../css/admin/goodstype.scss');

var $ = jQuery;

$('#add1btn').click(function () {

    var v = $('#add1').val();
    if (v == "")
        alert("标题不能为空");
    $.ajax({

        type: 'Get',

        url: "/adminer/addtype/",

        data: {title: v, type: 1},

        success: function (d) {

            window.location.reload();//刷新当前页面.
        }


    });

});

$('#add2btn').click(function () {

    var v = $('#add2').val();
    var fid = $('#add2fid').val();
    if (v == "")
        alert("标题不能为空");
    $.ajax({

        type: 'Get',

        url: "/adminer/addtype/",

        data: {title: v, type: 2, fid: fid},

        success: function () {
            window.location.reload();//刷新当前页面.
        }

    });

});

$('#edit1btn').click(function () {

    var v = $('#edit1').val();
    var id = $('#editid').val();
    if (v == "")
        alert("标题不能为空");
    $.ajax({

        type: 'Get',

        url: "/adminer/edittype/",

        data: {title: v, id: id},

        success: function () {
            window.location.reload();//刷新当前页面.
        }

    });

});

$('#edit2btn').click(function () {

    var v = $('#edit2').val();
    var id = $('#edit2id').val();
    if (v == "")
        alert("标题不能为空");
    $.ajax({

        type: 'Get',

        url: "/adminer/edittype/",

        data: {title: v, id: id},

        success: function () {
            window.location.reload();//刷新当前页面.
        }

    });

});

$('.add2').click(function () {

    var v = $(this).attr("data");
    $('#add2fid').val(v);

});

$('.edit1').click(function () {

    var v = $(this).attr("data");
    var name = $(this).attr("value");
    $('#editid').val(v);
    $('#edit1').val(name);

});

$('.edit2').click(function () {

    var v = $(this).attr("data");
    var name = $(this).attr("value");
    $('#edit2id').val(v);
    $('#edit2').val(name);

});

$('.remove').click(function (e) {
    var id = $(this).attr('data');

    var count = $(this).attr('count');

    if (count > 0) {
        e.preventDefault();
        e.stopPropagation();
        alert("下属类别不为空，不允许删除")
    } else {
        $.ajax({

            type: 'Get',

            url: "/adminer/deltype/",

            data: {id: id},

            success: function () {
                window.location.reload();//刷新当前页面.
            }

        });
    }

});




