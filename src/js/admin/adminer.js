/**
 * Created by lxc on 15-12-17.
 */

require('../admin-base/common.js');
require('jquery-validation');
require('ajaxform/build/ajaxform-0.1.2.js');

var $ = jQuery;

require('datatables/media/js/jquery.dataTables.js');
require('datatables/media/css/jquery.dataTables.css');
require('select2');

require('./datetabesmy.js');

var $form = $('#form');

$form.validate({
    errorElement: 'span', //default input error message container
    errorClass: 'help-block', // default input error message class
    focusInvalid: false, // do not focus the last invalid input
    ignore: "",
    rules: {
        nickname: {
            required: true

        },
        name: {
            required: true,

        },
        phone: {
            required: true,
            number: true,
            maxlength: 11,
            minlength: 11
        },
        password: {
            required: true
        },
        password2: {
            equalTo: "#password"
        }
    },

    messages: {
        nickname: {
            required: '请填写登录名',
            remote: '用户名重复'

        },
        name: {
            required: '姓名',

        },
        phone: {
            required: '请填写电话',
            number: '请填写数字',
            maxlength: "请输入11位手机号",
            minlength: "请输入11位手机号"
        },
        type: {
            required: '请选择权限',
            number: '请选择权限'
        },
        password: {
            required: '请设置密码'
        },
        password2: {

            equalTo: '两次输入的密码不相同'
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


    }
});

var oTable = $('#sample_2').DataTable({
    "aoColumnDefs": [
        {"aTargets": [0]}
    ],
    "aaSorting": [[1, 'asc']],
    "aLengthMenu": [
        [5, 15, 20, -1],
        [5, 15, 20, "All"] // change per page values here
    ],
    // set the initial value
    "iDisplayLength": 10,
    "language": {
        "lengthMenu": "每页 _MENU_ 条记录",
        "zeroRecords": "没有找到记录",
        "info": "第 _PAGE_ 页 ( 总共 _PAGES_ 页 )",
        "infoEmpty": "无记录",
        "infoFiltered": "(从 _MAX_ 条记录过滤)"
    }
});

//var $wrapper = jQuery('#sample_2_wrapper');
//$wrapper.find('.dataTables_filter input').addClass("form-control input-small"); // modify table search input
//$wrapper.find('.dataTables_length select').addClass("form-control input-small").select2(); // modify table per page dropdown
//
//$('#sample_2_column_toggler').find('input[type="checkbox"]').change(function () {
//    /* Get the DataTables object again - this is not a recreation, just a get of the object */
//    var iCol = parseInt($(this).attr("data-column"));
//    var bVis = oTable.fnSettings().aoColumns[iCol].bVisible;
//    oTable.fnSetColumnVis(iCol, (bVis ? false : true));
//});
var edittingData;
$form.ajaxForm({
    errorClass: 'error-field', // Error class applied to field if it failed validation
    showErrorMessage: true,    // Show error messages or just highlight field
    errorMessageFormat: '<div class="error-message">{message}</div>', // Error message markup.
    insertMessage: 'before',   // Error message position. Accepts 2 options 'before' and 'after'
    onSuccess: function (id) {
        if (id == -1) {
            alert("登录名重复")
        }
        else {
            $("#addmodal").modal('hide');
            var idnow = $('#id').val();
            if (idnow == "") {
                $(oTable.row.add([
                    id,
                    $('#nickname').val(),
                    $('#name').val(),
                    $('#phone').val(),
                    $('#type').find("option:selected").text(),
                    '<a data="' + id + '" href="#addmodal" data-toggle="modal" class="btn blue btn-xs editbtn"><i class="fa fa-edit"></i>修改</a> <butten class="btn delbtn btn-warning btn-xs"><i class="fa fa-times"></i>删除</butten>'
                ]).draw().node()).data('id', id);
            } else {
                oTable.row($('tr.editing').removeClass('editing')).data([
                    id,
                    $('#nickname').val(),
                    $('#name').val(),
                    $('#phone').val(),
                    $('#type').find("option:selected").text(),
                    edittingData.type == 100 ?
                    '<a data="' + id + '" href="#addmodal" data-toggle="modal" class="btn blue btn-xs editbtn"><i class="fa fa-edit"></i>修改</a> '
                        : '<a data="' + id + '" href="#addmodal" data-toggle="modal" class="btn blue btn-xs editbtn"><i class="fa fa-edit"></i>修改</a> <butten class="btn delbtn btn-warning btn-xs"><i class="fa fa-times"></i>删除</butten>'

                ]).draw();

            }
            jQuery("#form")[0].reset();
            jQuery("#id").val("");
        }
    },     // Success callback. If validation passed
    onErrors: function () {
    },  //is callback for successfull server response with array of validation errors
    onError: function () {
    }  //is server error callback
});


$('#sample_2').click(function (event) {
    var $t = $(event.target);
    if ($t.is('.editbtn')) {
        var id = $t.attr('data');
        $('table tr.editing').each(function () {
            $(this).removeClass('editing');
        });
        $t.parents('tr').addClass('editing');
        $("#id").val(id);
        $.ajax({
            url: '/adminer-super/adminer-get?id=' + id,
            dataType: 'json',
            type: "get",
            success: function (data) {
                edittingData = data;
                $('#nickname').val(data.nickname);
                $('#name').val(data.name);
                $('#phone').val(data.phone);
                $('#password').val(data.password);
                $('#password2').val(data.password);
                $('#type').val(data.type);
                if (data.type == 100) {
                    $('#type').parents('.form-group').hide();
                    $('#super-option').prop('disabled', false);
                } else {
                    $('#type').parents('.form-group').show();
                    $('#super-option').prop('disabled', true);
                }
            }
        })
    } else if ($t.is('.delbtn')) {
        var id = $t.parents('tr').data('id');
        $.ajax({
            url: '/adminer-super/adminer-del?id=' + id,
            type: "get",
            success: function (data) {
                if (data == 1) {
                    oTable.row($t.parents('tr')).remove().draw();
                }
            }
        })
    }
});

$('#myModal').on('hidden.bs.modal', function (e) {
    $('#type').parents('.form-group').show();
    $('#super-option').prop('disabled', true);
});


