/**
 * Created by lxc on 15-12-19.
 */
require('imports?$=jquery!amazeui/dist/css/amazeui.css');

require('../../scss/evaluation.scss');
require('./base.js');
require('jquery-validation');
require('ajaxform/build/ajaxform-0.1.2.js');



var $=jQuery;
var list=[];


var $form = $('form');
$form.each(function(){
    $(this).validate({
        debug:true,
        errorElement: 'span', //default input error message container
        errorClass: 'help-block', // default input error message class
        focusInvalid: false, // do not focus the last invalid input
        ignore: "",
        rules: {
            score: {
                required: true,
            },

            text: {
                required:true,
                minlength: 5
            },
        },

        messages: {
            score: {
                required: '请选择评分',
            },

            text: {
                required: '请填写描述',
                minlength: "描述最少5个字"
            },

        },

        invalidHandler: function (event, validator) {
        },

        highlight: function (element) {
            $(element)
                .closest('.am-form-group').addClass('am-form-error');
        },

        unhighlight: function (element) {
            $(element)
                .closest('.am-form-group').removeClass('am-form-error'); // set error class to the control group
        },

        success: function (label) {
            label
                .closest('.am-form-group').removeClass('am-form-error'); // set success class to the control group
        },

        submitHandler: function (form) {
            console.log(1);
            var id=$(form).find(".inputitem").eq(0).val();
            var s=$(form).find(".inputitem").eq(1).val();
            var text=$(form).find(".inputitem").eq(2).val();
            var a=new Object();
            a.id=id;
            a.s=s;
            a.text=text;
            list.push(a);
        }
    });
})



$("#sub").click(function(){
    list=[];
    $form.each(function(){
        $(this).submit();
    })
    if(list.length==$('form').length)
    {
        $.each(list,function(i,v){
            $.ajax({
                type:"get",

                url:"add",
                data:{
                    score:v.s,
                    message: v.text,
                    GoodId:v.id

                },
                success:function(){
                }
            })


        });
        window.location.href="/user/order-list";
    }
});

$(".pjbtn").click(function(){
    $(this).addClass("act");
    $(this).parent().siblings().find("button").removeClass("act");
    var data=$(this).attr("data");
    $(this).parent().parent().next().val(data);
    //$(this).parents("form").submit();

    $(this)
        .closest('.am-form-group').removeClass('am-form-error').find("span").html("");
    




})



