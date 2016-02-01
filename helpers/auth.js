/**
 * Created by me on 15-12-2.
 */
var cache = require('../instances/cache.js');
var utilx = require('../lib/util.js');
var util = require('util');

var cookieName = 'MaoDinUser';

module.exports = {
    /**
     * 登录
     * @param ctx
     * @param user
     */
    login: (ctx, user) => {
        ctx.current = ctx.current || {};
        ctx.current.user = user;
        var token = utilx.md5(`${user.id}#${Date.now()}`);
        var nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        ctx.cookies.set(cookieName, token, {
            expires: nextMonth
        });
        cache.jsetex(token, 60 * 60 * 24, user);
    },
    logout: function *(ctx) {
        var user = yield this.user(ctx);
        ctx.current = ctx.current || {};
        if (user) {
            var token = utilx.md5(`${user.id}#${Date.now()}`);
            cache.del(token);
        }
        var lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        ctx.cookies.set(cookieName, null, {
            expires: lastMonth
        });
        ctx.current.user = null;
    },
    /**
     * 获取当前用户
     * @param ctx
     * @returns {user || null}
     */
    user: function *(ctx) {
        var user;
        ctx.current = ctx.current || {};
        user = ctx.current.user;
        if (util.isNullOrUndefined(user)) {
            var token = ctx.cookies.get(cookieName);
            if (util.isNullOrUndefined(token)) {
                return null;
            }
            user = yield cache.jget(token);
        }
        ctx.current.user = user;
        return user;
    }
};
