var WechatApi = require('co-wechat-api');
var co = require('co');

var wechatConfig = require('../instances/config.js').wechat;

var wechatApi = new WechatApi(wechatConfig.appId, wechatConfig.secret);

co(function *(){
    var result = yield* wechatApi.removeMenu();
    console.log(result);
    result = yield* wechatApi.createMenu({
        button: [
            {
                type: 'view',
                name: '测试',
                url: 'http://maodin.cn/user/center'
            }
        ]
    });
    console.log(result);
}).catch((err) => {
    console.log(err);
});
