/**
 * Created by bian on 15-12-6.
 */

var render = require('../../instances/render');
var db = require('../../models/db/index');
var Identity = db.models.Identity;
var Area = db.models.Area;
var auth = require('../../helpers/auth');

module.exports = (router) => {

    router.get('/user/identity', function *() {
        var user = (yield auth.user(this));

        var data = yield Identity.findAll({
            where: {
                UserId: user.id
            }
        });

        this.body = yield render('phone/identity-list', {
            datas: data,
            title: '备案信息'
        });
    });

    router.get('/user/identity/save', function *() {

        var id = this.query.id;

        this.body = yield render('phone/identity-save', {
            title: '备案信息',
            data: yield Identity.findById(id)
        });
    });

    router.get('/user/identity/del/:id', function *() {
        var id = this.params.id;
        this.body = yield Identity.destroy({
            where: {
                id: id,
                UserId: (yield auth.user(this)).id
            }
        });
    });

    router.post('/user/identity/save', function *() {

        this.checkBody('name').notEmpty();
        this.checkBody('phone').notEmpty().isLength(11, 11);
        this.checkBody('identityNum').notEmpty().isLength(18, 18);

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var body = this.request.body;
        if (body.id) {
            yield Identity.update({
                name: body.name,
                phone: body.phone,
                identityNum: body.identityNum
            }, {
                where: {
                    id: body.id,
                    UserId: (yield auth.user(this)).id
                }
            });
        } else {
            yield Identity.create({
                name: body.name,
                phone: body.phone,
                identityNum: body.identityNum,
                isDefault: false,
                UserId: (yield auth.user(this)).id
            });
        }


        this.redirect('/user/identity');
    });

    router.post('/user/identity/changeDefault', function *() {

        this.checkBody('id').notEmpty();
        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var data = this.request.body;
        var addrid = data.id;

        var UserID = (yield auth.user(this)).id;

        this.body = yield [
            Identity.update({
                isDefault: false
            }, {
                where: {
                    id: {
                        $not: addrid
                    },
                    UserId: UserID
                }
            }),

            Identity.update({
                isDefault: true
            }, {
                where: {
                    id: addrid,
                    UserId: UserID
                }
            })
        ];
    });
};