require('../admin-base/common.js');
require('../../css/admin/rank.scss');

var $ = jQuery;
var list = [];
var edit = 0;
var oldname = "";
var b = 1;
function check(min, max, name) {
    b = 1;
    $.each(list, function (i, v) {
        if (v.min <= min && v.max >= min && name != v.name) {
            //console.log("false"+"--"+"min="+min+"v:"+v.name);
            b = 0;
        } else if (v.min <= max && v.max >= max && name != v.name) {
            //console.log("false"+"--"+"max="+max+"v:"+v.name);
            b = 0;
        }
    })
}
$('#add1btn').click(function () {
    var id = $('#id').val();
    var v = $('#add1').val();
    var v1 = Number($('#add2').val());
    var v2 = Number($('#add3').val());
    ///check
    if (edit == 0) {
        // console.log("add");
        check(v1, v2, v);
    }
    else if (edit == 1) {
        // console.log("edit");
        // console.log("oldname:"+oldname);
        check(v1, v2, oldname);
    }

    //console.log(b);
    if (v == "")
        alert("名称不能为空");
    else if (v1 >= v2)
        alert("积分上限值必须大于积分下限值");
    else if (edit == 0 && b == 0) {
        alert("与其他等级有积分重复")
    }
    else if (edit == 1 && b == 0) {
        alert("与其他等级有积分重复")
    }
    else {
        $.ajax({

            type: 'Get',

            url: "checkname",

            data: {id: id, name: v},

            success: function (ret) {
                if (ret == 1) {
                    $.ajax({

                        type: 'Get',

                        url: "ranksave",

                        data: {id: id, name: v, min: v1, max: v2},

                        success: function (d) {
                            var s;
                            if (id == 0) {
                                s = '';
                                s += '<tr class="odd gradeX" id="f' + id + '">';
                                s += '<td class="n1" style="">' + v + '</td>';
                                s += '<td class="n2" style="">' + v1 + '</td>';
                                s += '<td class="n3" style="">' + v2 + '</td>';
                                s += '<td>';
                                s += '<div style="height: 30px" class="btn-group">';
                                s += '<a href="#addmodal" data="' + id + '" value="' + v + '" data-toggle="modal"';
                                s += 'class="btn default btn-sm edit"><i class="fa fa-edit"></i> 修改</a>';
                                s += '<a data-id="' + id + '" class="btn red btn-sm  remove"><i class="fa fa-remove"></i>删除</a>';
                                s += '</div>';
                                s += '</td>';
                                s += '</tr>';
                                $("tbody").append(s);
                                $(".close").click();
                            } else {
                                var $s = $("#f" + id);
                                s = '';
                                s += '<td class="n1" style="">' + v + '</td>';
                                s += '<td class="n2" style="">' + v1 + '</td>';
                                s += '<td class="n3" style="">' + v2 + '</td>';
                                s += '<td>';
                                s += '<div style="height: 30px" class="btn-group">';
                                s += '<a href="#addmodal" data="' + id + '" value="' + v + '" data-toggle="modal"';
                                s += 'class="btn default btn-sm edit"><i class="fa fa-edit"></i> 修改</a>';
                                s += '<a data-id="' + id + '" class="btn red btn-sm  remove"><i class="fa fa-remove"></i>删除</a>';
                                s += '</div>';
                                s += '</td>';
                                $s.html(s);
                                ///重新绑定
                                $('.edit').click(function () {
                                    formclear();
                                    var id = $(this).attr("data");
                                    var $p = $(this).parent().parent().parent();
                                    var name = $p.find(".n1").html();
                                    var min = $p.find(".n2").html();
                                    var max = $p.find(".n3").html();
                                    oldname = name;
                                    $('#add1').val(name);
                                    $('#add2').val(min);
                                    $('#add3').val(max);
                                    $('#id').val(id);
                                    edit = 1;
                                });
                                $(".close").click();
                            }
                        }
                    });
                } else {
                    alert("名字有重复,请更改");
                }
            }
        });

    }
    full();

});
$('.edit').click(function () {
    formclear();
    $(".modal-title").html("修改");
    var id = $(this).data("id");
    var $p = $(this).parent().parent().parent();
    var name = $p.find(".n1").html();
    var min = $p.find(".n2").html();
    var max = $p.find(".n3").html();
    oldname = name;
    $('#add1').val(name);
    $('#add2').val(min);
    $('#add3').val(max);
    $('#id').val(id);
    edit = 1;
});
$("#addbtn").click(function () {
    formclear();
    $(".modal-title").html("添加");
});

function formclear() {
    $('#add1').val("");
    $('#add2').val("");
    $('#add3').val("");
    $('#id').val(0);
    edit = 0;

}

$('.remove').click(function (e) {
    var id = $(this).data('id');

    var count = $(this).attr('count');

    $.ajax({

        type: 'Get',

        url: "rankdel",

        data: {id: id},

        success: function () {
            $("#f" + id).remove();
        }

    });
    full();

});


///填充
function full() {
    list = [];
    var fas = $(".odd");
    fas.each(function () {
        var name = $(this).find(".n1").html();
        var min = $(this).find(".n2").html();
        var max = $(this).find(".n3").html();
        var one = {};
        one.min = Number(min);
        one.max = Number(max);
        one.name = name;
        list.push(one);
    });
    // console.log(list);
}


full();




