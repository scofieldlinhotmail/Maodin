/**
 * Created by bian on 15-12-6.
 */

var render = require('../../instances/render');
var db = require('../../models/db/index');
var DeliverAddress = db.models.DeliverAddress;
var Area = db.models.Area;
var auth = require('../../helpers/auth');

module.exports = (router) => {

    router.get('/user/address', function *() {
        var user = (yield auth.user(this));

        var data = yield DeliverAddress.findAll({
            where: {
                UserId: user.id
            }
        });

        this.body = yield render('phone/address-list', {
            datas: data,
            title: '收获地址'
        });
    });

    router.get('/user/address/save', function *() {

        var id = this.query.id;

        this.body = yield render('phone/address-save', {
            title: '收货地址',
            data: yield DeliverAddress.findById(id)
        });
    });


    router.post('/user/address/save', function *() {

        this.checkBody('name').notEmpty();
        this.checkBody('phone').notEmpty().isLength(11, 11);
        this.checkBody('province').notEmpty();
        this.checkBody('city').notEmpty();
        this.checkBody('country').notEmpty();
        this.checkBody('address').notEmpty();

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var body = this.request.body;
        if (body.id) {
            yield DeliverAddress.update({
                recieverName: body.name,
                phone: body.phone,
                province: body.province,
                city: body.city,
                area: body.country,
                address: body.address,
            }, {
                where: {
                    id: body.id,
                    UserId: (yield auth.user(this)).id
                }
            });
        } else {
            yield Identity.create({
                recieverName: body.name,
                phone: body.phone,
                province: body.province,
                city: body.city,
                area: body.country,
                address: body.address,
                isDefault: false,
                UserId: (yield auth.user(this)).id
            });
        }


        this.redirect('/user/address');
    });


    router.get('/user/address/del/:id', function *() {

        this.body = yield DeliverAddress.destroy({
            where: {
                id: this.params.id
            }
        });
    });

    router.post('/user/address/changeDefault', function *() {


        this.checkBody('id').notEmpty();
        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var data = this.request.body;
        var addrid = data.id;

        var UserID = (yield auth.user(this)).id;

        this.body = yield [
            DeliverAddress.update({
                isDefault: false
            }, {
                where: {
                    id: {
                        $not: addrid
                    },
                    UserId: UserID
                }
            }),

            DeliverAddress.update({
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