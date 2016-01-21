/**
 * Created by bian on 12/3/15.
 */
var debug = require('../../instances/debug');
var render = require('../../instances/render');
var db = require('../../models/db/index');
var auth = require('../../helpers/auth.js');
var Admins = db.models.Adminer;


module.exports = (router) => {

    router.get('/adminer/index', function *() {
        var user = yield auth.user(this);
        var pageSrc;
        if (user.type == 2) {
            pageSrc = '/adminer-adminer/user-list';
        } else if (user.type == 1) {
            pageSrc = '/adminer-shopkeeper/goods';
        } else if (user.type == 3) {
            pageSrc = '/adminer-order/order-list/t/1';
        } else if (user.type == 4) {
            pageSrc = '/adminer-order/order-list/t/2';
        } else {
            pageSrc = '/adminer-order/order-list';
        }
        this.body = yield render('admin/index', {
            src: pageSrc
        });
    });

    router.get('/admin-login', function *() {
        this.body = yield render('admin/login');
    });

    // todo: redirect
    router.post('/admin-login', function *() {
        var ctx = this;
        var body = this.request.body;
        this.checkBody('nickname').notEmpty();
        this.checkBody('password').notEmpty();
        if (this.errors) {
            return;
        }
        try {

            var c = yield Admins.findOne({
                where: {
                    nickname: body.nickname,
                    password: body.password,
                    status: 0
                }
            });

            var pageSrc;
            if (c != null && c.status == 0) {
                ///登陆
                auth.login(this, c);
                this.redirect('/adminer/index');
            } else {
                this.redirect('/admin-login');
            }
        } catch (err) {
            this.redirect('/admin-login');
        }
    });


    router.get('/admin-logout', function *() {
        yield auth.logout(this);
        this.redirect('/admin-login');
    })
};