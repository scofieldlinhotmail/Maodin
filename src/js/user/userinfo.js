/**
 * Created by bian on 15-12-10.
 */
require('../../css/user/userinfo.js');
var $ = require('expose?$=jQuery!jquery');
jQuery = $;
$(document).ready(function(){
    $('.changephone').hide();
    if(sendbtn.attr('disabled'))
        sendbtn.removeAttr('disabled');
    if($('#tel').attr('disabled'))
        $('#tel').removeAttr('disabled');

});

$('.phone').click(function (){
   $('.myinfo').hide();
    $('.changephone').show();
});

$('#back').click(function(){
    $('.myinfo').show();
    $('.changephone').hide();
});

var sendbtn = $('#validate');
var code = '';
var result = false;
var tel1 = '';
sendbtn.click(function(){
    var phone = $('#tel').val();
    var url = '/verifyCode/' + phone;
    if(phone && phone.match(/^1[3-8]+\d{9}$/)) {
        $.ajax({
            url:url,
            type:'GET',
            success:function(data){
                if(data === -1){
                    alert('fail');
                }else{
                    code = data;
                    startClock();
                }
            }
        });
    }else{
        alert('手机号输入错误');
    }
});

function startClock(){
    var count = 60;
    var text = '秒';
    tel1 = $('#tel').val();
    sendbtn.attr('disabled','disabled');
    $('#tel').attr('disabled','disabled');
    var my_interval = setInterval(function () {
        if (count == 0) {
            stopClock(my_interval);
        } else {
            count --;
            sendbtn.html(count+text);
        }
    }, 1000);
}

function stopClock(my_interval){
    clearInterval(my_interval);
    sendbtn.html('发送验证码');
    sendbtn.removeAttr('disabled');
    $('#tel').removeAttr('disabled');
}

$('#change').click(function(){
    var c = $('#code');
    if(c.val()){
        if(code){
            var url = '/verifyCode/' + $('#tel').val() + '/' + c.val();
            $.ajax({
                url:url,
                type:'GET',
                success:function(data){
                    if(data){
                        result = true;
                         changePhone();
                    }else{
                        alert('验证码错误');
                    }
                }
            });
        }else{
            alert('请先得到验证码');
        }
    }else{
        alert('请输入验证码');
    }
});

function changePhone(){
    if(tel1 == $('#tel').val()) {
        var url = '/user/changePhone/'+tel1;
        $.ajax({
            url:url,
            type:'GET',
            success:function(data){
                if(data){
                    alert('更换成功');
                    window.location.href = location.href;
                }else{
                    alert('更换失败');
                }
            }
        })
    }
}