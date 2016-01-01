/**
 * Created by lxc on 15-12-10.
 */
require('../admin-base/common.js');
require('../../css/admin/orders.scss');
require('../../template_content/assets/plugins/bootstrap-datetimepicker/css/datetimepicker.css');
require('../../template_content/assets/plugins/bootstrap-datetimepicker/js/bootstrap-datetimepicker.js');


var $ = jQuery;

$.fn.datetimepicker.dates['zh-CN'] = {
    days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
    daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    monthsShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
    today: "今天",
    suffix: [],
    meridiem: ["上午", "下午"]
};


$(".form_datetime").datetimepicker({format: 'yyyy-mm-dd hh:ii'});



$('.get').click(function(){

    var v=$(this).val();


});

$('#dm a').click(function(){
    var t=$(this).text();
    t+='<i class="fa fa-angle-down">';
    $('#con').html(t);

    $('#dm li').removeClass('active');
});


function setactive()
{
    var id=$('#activeid').val();
    var a=$('.list').removeClass('active').eq(id).addClass('active');
}


setactive();

$('.get').click(function(){

   var id=$(this).attr('value');
    $.ajax({

        type: 'Get',

        url: "/adminer/getorderinfor" ,

        data: {id:id} ,

        success: function(data){
           alert(data.address);
        },
        datetype:"json"

    });

});
$('.send').click(function(){

    var id=$(this).attr('value');
    $('#sendbtn').attr('value',id);

});
$('.refuge').click(function(){

    var id=$(this).attr('value');
    $('#refugebtn').attr('value',id);

});

$('#refugebtn').click(function(){
    var id=$(this).attr('value');
    var jjly=$('#jjly').val();
    $.ajax({

        type: 'Get',

        url: "/adminer/orderrefuge" ,

        data: {id:id,reason:jjly} ,

        success: function(data){
            alert(data.address);
        },
        datetype:"json"

    });

});
$('#sendbtn').click(function(){
    var id=$(this).attr('value');

    var time=$('#sendtime').val();
    $.ajax({

        type: 'Get',

        url: "/adminer/ordersend" ,

        data: {id:id,time:time} ,

        success: function(data){
            alert(data.address);
        },
        datetype:"json"

    });

});
