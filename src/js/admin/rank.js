require('../admin-base/common.js');
require('../../css/admin/rank.scss');

var $ = jQuery;

$('#add1btn').click(function () {
    var id=  $('#id').val();
    var v = $('#add1').val();
    var v1 = $('#add2').val();
    var v2 = $('#add3').val();
    if (v == "")
        alert("名称不能为空");
    else if(v1>=v2)
        alert("积分上限值必须大于积分下限值")
    else
        $.ajax({

        type: 'Get',

        url: "ranksave",

        data: {id:id, name: v, min: v1,max: v2},

        success: function (d) {
           if(id==0){
               var s='';
                   s+='<tr class="odd gradeX" id="f'+id+'">'
                   s+='<td class="n1" style="">'+v+'</td>'
                   s+='<td class="n2" style="">'+v1+'</td>'
                   s+='<td class="n3" style="">'+v2+'</td>'
                   s+='<td>'
                   s+='<div style="height: 30px" class="btn-group">'
                   s+='<a href="#addmodal" data="'+id+'" value="'+v+'" data-toggle="modal"'
                   s+='class="btn default btn-sm edit"><i class="fa fa-edit"></i> 修改</a>'
                   s+='<a data="'+id+'" class="btn red btn-sm  remove"><i class="fa fa-remove"></i>删除</a>'
                   s+='</div>'
                   s+='</td>'
                   s+='</tr>'
               $("tbody").append(s);
               $(".close").click();
           }else{
               var $s= $("#f"+id);
               var s='';
               s+='<td class="n1" style="">'+v+'</td>'
               s+='<td class="n2" style="">'+v1+'</td>'
               s+='<td class="n3" style="">'+v2+'</td>'
               s+='<td>'
               s+='<div style="height: 30px" class="btn-group">'
               s+='<a href="#addmodal" data="'+id+'" value="'+v+'" data-toggle="modal"'
               s+='class="btn default btn-sm edit"><i class="fa fa-edit"></i> 修改</a>'
               s+='<a data="'+id+'" class="btn red btn-sm  remove"><i class="fa fa-remove"></i>删除</a>'
               s+='</div>'
               s+='</td>'
               $s.html(s);
               $(".close").click();
           }
        }
        });

});

$('.edit').click(function () {
    var id = $(this).attr("data");
    var $p=$(this).parent().parent().parent();
    var name=$p.find(".n1").html();
    var min=$p.find(".n2").html();
    var max=$p.find(".n3").html();
    $('#add1').val(name);
    $('#add2').val(min);
    $('#add3').val(max);
    $('#id').val(id);
});
$("#addbtn").click(function(){
    formclear();
})

function formclear(){
    $('#add1').val("");
    $('#add2').val("");
    $('#add3').val("");
    $('#id').val(0);
}




$('.remove').click(function (e) {
    var id = $(this).attr('data');

    var count = $(this).attr('count');

    $.ajax({

            type: 'Get',

            url: "rankdel",

            data: {id: id},

            success: function () {
                $("#f"+id).remove();
            }

    });


});




