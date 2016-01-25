var co = require('co');
var AliDayu = require('co-alidayu');
var util = require('util');
var utilx = require('../lib/util.js');
var cache = require('../instances/cache.js');

var alidayu = new AliDayu("23277211", "604f2a9880cec26a7fdb519a61670d48");

// 发送短信

module.exports = {
    send: function *(phone) {
        var code = utilx.randomNum(6);
        var ret;
        cache.setex(`verifyCode/${phone}`, 60 * 30, code);
        var sms = {
            extend: phone,
            sms_free_sign_name: "注册验证",
            sms_param: {
                code: code,
                product: '夷沃'
            },
            rec_num: phone,
            sms_template_code: "SMS_2915139"
        };
        return code;
    },
    verify: function *(phone, code){
        var data = yield cache.get(`verifyCode/${phone}`);
        return code == data;
    }
};