/**
 * Created by me on 15-12-1.
 */
var wechatRobot = require('wechat');
var OAuth = require('wechat-oauth');
var Promise = require('bluebird');
var fs = require('fs');

var wechatConfig = require('./../../instances/config.js').wechat;
var log = require('./../../instances/log.js');
var auth = require('./../../helpers/auth.js');
var util = require('util');
var utilx = require('./../../lib/util.js');

var db = require('./../../models/db/index.js');

var WXPay = require('weixin-pay');

var wxpay = WXPay({
    appid: wechatConfig.appId,
    mch_id: wechatConfig.mchId,
    partner_key: wechatConfig.partnerKey, //微信商户平台API密钥
    //pfx: fs.readFileSync(wechatConfig.pfx), //微信商户平台证书
});


module.exports = (router) => {


    var User = db.models.User;
    var Order = db.models.Order;

    router.get('/user/pay/:id', function *() {

        this.checkParams('id').notEmpty().isInt().toInt();
        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var order = yield Order.findOne({
            where: {
                id: this.params.id,
                // unpaid
                status: 0
            }
        });

        if (util.isNullOrUndefined(order)) {
            this.body = '错误操作';
            return;
        }
        var user = yield auth.user(this);
        var outerTradeId = utilx.intToFixString(order.id, 32);

        var payInfo;
        if (!util.isNullOrUndefined(order.prepayId)) {
            var queryPromise = new Promise(function (resolve, reject) {
                wxpay.queryOrder({ out_trade_no: outerTradeId }, function(err, order){
                    if (err) {
                        debug(err);
                        reject(err);
                    }
                    debug(order);
                    resolve(order);
                });
            });
        } else {
            var p = new Promise(function (resolve, reject) {
                wxpay.createUnifiedOrder({
                    body: '夷沃订单支付' + order.id,
                    out_trade_no: outerTradeId,
                    total_fee: 1, //todo: for test 1分
                    spbill_create_ip: this.request.id,
                    notify_url: 'http://139.129.18.214/wechat/paid',
                    trade_type: 'JSAPI',
                    openid: user.openid,
                    attach: order.id
                    //product_id: '1234567890'
                }, function(err, result){
                    if (err) {
                        debug(err);
                        reject(err);
                    }
                    resolve(result);
                });
            });

            payInfo = yield p;

            debug(payInfo);
        }

        payInfo = JSON.stringify(payInfo);
        this.body = yield render('user/pay', {
            title: '微信支付',
            payInfo
        });
    });

    router.get('/wechat/paid', function *() {
        debug('paid');
    });



};
