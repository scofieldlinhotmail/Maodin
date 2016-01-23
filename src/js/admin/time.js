/**
 * Created by lxc on 16-1-23.
 */
require('../admin-base/common.js');
require('../../css/admin/time.scss');

var $ = jQuery;

$("#in1").change(function(){
    change(1,$(this).val());
})
$("#in2").change(function(){
    change(2,$(this).val());
})
$("#in3").change(function(){
    change(3,$(this).val());
})

function change(num,value){
    if(value<0){
        alert("输入值不可以是小于0的数")
    }else{
        $.ajax({
            type:"get",
            url:"change",
            data:{
                num:num,value:value
            },
            success:function(){
            }
        })
    }

}



