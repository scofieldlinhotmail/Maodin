require('./base.js');

var $ = jQuery;

$(function () {

    var payInfo = JSON.parse($('#pay-info').html());

    $('#pay').click(function () {
        WeixinJSBridge.invoke(
            "getBrandWCPayRequest", payInfo , function(res){
                if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                    console.log('paid');
                }
            });
    });

});