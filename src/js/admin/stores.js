/**
 * Created by lxc on 16-1-16.
 */
require('../admin-base/common.js');

require('angular');
require('angular-route');
require('jquery-validation');
var $ = jQuery;

$(".group-checkable").click(function(){
    var has=$(".group-checkable").parent().hasClass("checked");
    if(has){
        $(".checkboxes").parent().removeClass("checked");
        $(".checkboxes").removeAttr("checked");
    }else{
        $(".checkboxes").parent().addClass("checked");
        $(".checkboxes").prop("checked","checked");
    }


})

$("#btn1").click(function(){
    var has=$(".group-checkable").parent().hasClass("checked");
    if(has){
        $(".checkboxes").parent().removeClass("checked");
        $(".checkboxes").removeAttr("checked");
    }else{
        $(".checkboxes").parent().addClass("checked");
        $(".checkboxes").prop("checked","checked");
    }

})

$("#focus").focusout(function(){
    var page=$("#page").val();

    var get=$(this).val();
    if(get<0){
        alert("请输入正确页数")
    }else if(page!=get&&get!=0){
        var url = window.location.href;
        var ed=changeURLPar(url,"page",get);
        window.location.href=ed;
    }



})

$("#btn2").click(function(){
    var obj=$(".many");
    var list=[];
    obj.each(function(){
        if($(this).parent().hasClass("checked"))
        {
            var tid=$(this).attr("data-id");
            list.push(tid);}
    })
    console.log(list);
    var val=1;
    manychange(list,val);
})
$("#btn3").click(function(){
    var obj=$(".many");
    var list=[];
    obj.each(function(){
        if($(this).parent().hasClass("checked"))
        {
            var tid=$(this).attr("data-id");
            list.push(tid);}
    })
    console.log(list);
    var val=0;
    manychange(list,val);
})
$("table").click(function(e){

    var v=$(e.toElement).attr("value");
    if(e.toElement.type=="button"&&v!=-1&&v<10){
        var id=$(e.toElement).attr("data-id");
        var s=$(e.toElement).attr("value");
        $.ajax({
            type: 'get',

            url: "ChangeOneO" ,

            data: {
                id:id,s:s
            } ,
            success: function(){
                if(s==1){
                    $(e.toElement).parent().html('<a data-id="'+id+'" type="button" value="0" class="btn  btn-sm refuse ">关闭</a>')
                    $("tr[data-id='"+id+"']").find(".status").html("已开启")
                }else{
                    $(e.toElement).parent().html('<a data-id="'+id+'" type="button" value="1" class="btn  btn-sm pass ">开启</a>')
                    $("tr[data-id='"+id+"']").find(".status").html("已关闭")

                }

            } ,

            dataType: "json"

        });
    }else if(e.toElement.type=="button"&&v==11){
        var id=$(e.toElement).attr("data-id");
        var newurl=changeURLPar( window.location.href,"parent",id);
        newurl=changeURLPar(newurl,"kid",0);
        window.open(newurl);
    }else if(e.toElement.type=="button"&&v==12){
        var id=$(e.toElement).attr("data-id");
        var newurl=changeURLPar( window.location.href,"kid",id);

        window.open(newurl);
    }else if(e.toElement.type=="button"&&v==21){
        var id=$(e.toElement).attr("data-id");
        $("#addmodal").modal('show');
        $("#id").val(id);
        $("#name").val(  $("tr[data-id='"+id+"']").find(".usernametd").html());
        $("#phone").val( $("tr[data-id='"+id+"']").find(".phonetd").html());
    }
})

function manychange(list,s) {
    $.ajax({
        type: 'get',

        url: "ChangeManyO" ,

        data: {
            list:JSON.stringify(list),s:s
        } ,

        success: function(){
            var ano=(s+1)%2;
            $.each(list,function(i,v){
                if(s==1){
                    $("tr[data-id='"+v+"']").find(".oc").html('<a data-id="'+v+'" type="button" value="0" class="btn  btn-sm refuse ">关闭</a>')
                    $("tr[data-id='"+v+"']").find(".status").html("已开启")
                }else{
                    $("tr[data-id='"+v+"']").find(".oc").html('<a data-id="'+v+'" type="button" value="1" class="btn  btn-sm pass ">开启</a>')
                    $("tr[data-id='"+v+"']").find(".status").html("已关闭")
                }
            })

        } ,
        dataType: "json"

    });

}


function changeURLPar(destiny, par, par_value)
{
    var pattern = par+'=([^&]*)';
    var replaceText = par+'='+par_value;
    if (destiny.match(pattern))
    {
        var tmp = '/\\'+par+'=[^&]*/';
        tmp = destiny.replace(eval(tmp), replaceText);
        return (tmp);
    }
    else
    {
        if (destiny.match('[\?]'))
        {
            return destiny+'&'+ replaceText;
        }
        else
        {
            return destiny+'?'+replaceText;
        }
    }
    return destiny+'\n'+par+'\n'+par_value;
}

jQuery.validator.addMethod("mobile", function(value, element) {
    var length = value.length;
    var mobile = /^1[3-8]+\d{9}$/
    return this.optional(element) || (length == 11 && mobile.test(value));
}, "手机号码格式错误");

var $form = $('#formedit');
$form.validate({
    errorElement: 'span', //default input error message container
    errorClass: 'help-block', // default input error message class
    focusInvalid: false, // do not focus the last invalid input
    ignore: "",
    rules: {
        username: {
            required: true
        },
        phone: {
            required: true,
            number: true,
            maxlength: 11,
            minlength: 11,
            mobile:true

        },
    },

    messages: {
        username: {
            required: '请填写真实姓名',
        },
        phone: {
            required: '请填写电话',
            number: '请填写数字',
            maxlength: "请输入11位手机号",
            minlength: "请输入11位手机号"
        },
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
        var id=$("#id").val();
        var username=$("#name").val();
        var phone=$("#phone").val( );
        $("#addmodal").modal('hide');
        $.ajax({
            type: 'get',

            url: "edit" ,

            data: {
                id:id,username:username,phone:phone
            } ,

            success: function(){
                $("tr[data-id='"+id+"']").find(".usernametd").html(username)
                 $("tr[data-id='"+id+"']").find(".phonetd").html(phone)
            } ,
            dataType: "json"

        });
    }
});

$("#searchbtn").click(function(){
    var key=$("#key").val();
    var newurl=changeURLPar( window.location.href,"key",key);
    location.href=newurl;
})

