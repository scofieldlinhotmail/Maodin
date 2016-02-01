/**
 * Created by me on 15-12-1.
 */
var wechatRobot = require('wechat');
var OAuth = require('wechat-oauth');
var Promise = require('bluebird');

var wechatConfig = require('./../../instances/config.js').wechat;
var log = require('./../../instances/log.js');
var auth = require('./../../helpers/auth.js');
var util = require('util');

var db = require('./../../models/db/index.js');

var WechatAuthClient = function () {
    return new OAuth(wechatConfig.appId, wechatConfig.secret);
};

module.exports = (router) => {


    var User = db.models.User;

    var wechatCookieAccessToken = 'MaoDinWechatAccessToken',
        wechatCookieRefreshToken = 'MaoDinWechatRefreshToken';

    var refresh = function *(ctx, client) {
        try{
            var result = yield client.refreshAccessToken(refreshToken);
            ctx.cookies.set(wechatCookieRefreshToken, result.refresh_token);
            ctx.cookies.set(wechatCookieAccessToken, result.access_token);
            return result;
        } catch(ex) {
            console.log(ex);
            log.error(ex);
            return false;
        }
    };

    router.get('/wechat-gate', function *() {
        if (wechatRobot.checkSignature(this.request.query, wechatConfig.token)) {
            this.body = this.request.query.echostr;
        }else {
            this.body = "fail";
        }
    });

    router.get('/wechat/redirect', function *() {
        var client = WechatAuthClient();
        var url = client.getAuthorizeURL(`${wechatConfig.domain}/wechat/auth`, 'maodin', 'snsapi_userinfo');
        console.log(url);
        this.redirect(url);
    });

    router.get('/wechat/auth', function *(next) {
        var client = WechatAuthClient();
        var ctx = this;
        console.log(ctx.request.query.code);
        var p = new Promise(function (resolve) {
            client.getAccessToken(ctx.request.query.code, function (err, result) {
                if (err) {
                    console.log('getAccessToken', err);
                    ctx.redirect('/wechat/redirect');
                    resolve(null);
                    return;
                }
                var accessToken = result.data.access_token;
                var openid = result.data.openid;
                ctx.cookies.set(wechatCookieRefreshToken, result.data.refresh_token);
                ctx.cookies.set(wechatCookieAccessToken, result.data.access_token);
                client.getUser(openid, function (err, userInfo) {
                    resolve(userInfo);
                });
            });
        });

        var user = yield p;

        if (user == null) {
            ctx.redirect('/wechat/redirect');
            return;
        }
        var dbUser = yield User.findOne({
            where: {
                openid: user.openid
            }
        });
        if (util.isNullOrUndefined(dbUser)) {
            console.log(user);
            dbUser = yield User.create({
                nickname: user.nickname,
                headimgurl: user.headimgurl,
                sex: user.sex,
                openid: user.openid,
                subscribe_time: user.subscribe_time,
                unionid: 'unionidss'
            });
        }
        auth.login(this, dbUser);
        console.log('to center');
        this.redirect('/user/center');
    });

    router.get('/wechat/login', function *() {
        var client = WechatAuthClient();
        var user = yield auth.user(this);
        var accessToken;
        var ctx = this;
        var openid;
        if (util.isNullOrUndefined(user)) {
            var refreshToken = this.cookies.get(wechatCookieRefreshToken);
            if (util.isNullOrUndefined(refreshToken)) {
                this.redirect('/wechat/redirect');
                return;
            }
            var result = yield refresh(this, client);
            accessToken = result.access_token;
            openid = result.opnid;
            user = yield User.findOne({
                where: {
                    openid
                }
            });
            if (util.isNullOrUndefined(user)) {
                this.redirect('/wechat/redirect');
                return;
            }
        }
        this.redirect('/user/center');
    });

};
