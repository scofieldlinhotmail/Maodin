/**
 * Created by lxc on 15-12-17.
 */
var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index.js');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');


module.exports = (router) => {

    var Admins = db.models.Adminer;

    router.get('/adminer-super/adminer-manage', function *() {
        var admin = yield Admins.findAll({
            where: {
                status: 0
            }
        });
        this.body = yield render('admin/adminer-list', {
            admin
        });
    });


    router.post('/adminer-super/adminer-add', function *() {
        var body = this.request.body;
        debug(body);

        var nickname = body.nickname;
        ///修改
        if (body.id != "") {
            var is = yield Admins.findOne({
                where: {
                    nickname: nickname,
                    id: {
                        $ne: body.id
                    }
                }
            });
            if (is == null) {
                var th = yield Admins.findOne({
                    where: {
                        id: body.id
                    }
                });

                th.nickname = body.nickname,

                    th.name = body.name,
                    th.phone = body.phone,
                    th.password = body.password;
                if (th.type != 100 && body.type != 100) {
                    th.type = body.type;
                }
                    yield th.save();
                this.body = th.id
            } else {
                this.body = -1
            }
        } else {
            ///添加
            is = yield Admins.findOne({
                where: {
                    nickname: nickname
                }
            });
            debug(is);
            if (is == null) {
                var e = yield Admins.create({
                    nickname: body.nickname,
                    type: body.type,
                    name: body.name,
                    phone: body.phone,
                    password: body.password,
                    status: 0
                });
                this.body = e.id
            } else {
                this.body = -1;
            }
        }


    });

    router.get('/adminer-super/adminer-get', function *() {

        var id = this.query.id;
        var is = yield Admins.findOne({
            where: {
                id: id
            }
        });
        this.body = JSON.stringify(is);
    });

    router.get('/adminer-super/adminer-del', function *() {

        var id = this.query.id;
        var is = yield Admins.findOne({
            where: {
                id: id
            }
        });
        is.destroy();
        yield is.save();
        this.body = 1;
    });

};