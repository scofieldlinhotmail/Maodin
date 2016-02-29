var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

module.exports = (router) => {

    var GoodsType = db.models.GoodsType;
    var GoodsOfTypes = db.models.GoodsOfTypes;

    router.get('/adminer-shopkeeper/goodstype', function *() {
        var types = yield GoodsType.all({
            include: [GoodsType],
            where: {
                type: 1
            }
        });
        this.body = yield render('goodstype/list', {
            types
        });
    });

    router.get('/adminer-shopkeeper/goodstype-save', function *() {

        var query = this.query;

        var data;
        if (query.id) {
            data = yield GoodsType.findById(query.id);
        }

        this.body = yield render('goodstype/save', {
            types: yield GoodsType.findAll({
                where: {
                    type: 1
                }
            }),
            data: JSON.stringify(data)
        });


    });

    router.post('/adminer-shopkeeper/goodstype-save', function *() {

        var body = this.request.body;

        if (typeof body.title === 'undefined' || body.title.trim().length === 0
            || typeof body.type === 'undefined' || body.type.trim().length === 0) {
            this.body = this.errors;
            return;
        }
        if (body.type == 2 && !body.topTypeId) {
            this.body = 'topTypeId is missing';
            return;
        }

        body.title = body.title.trim();
        if (body.id) {
            yield GoodsType.update({
                title: body.title,
                fields: JSON.stringify(body.fields)
            }, {
                where: {
                    id: body.id,
                    type: body.type
                }
            });
        } else {
            var data = {
                title: body.title,
                fields: JSON.stringify(body.fields),
                id: body.id,
                type: body.type
            };
            if (body.type == 2) {
                data.GoodsTypeId = body.topTypeId;
            }
            yield GoodsType.create(data)
        }

        this.body = {
            url: '/adminer-shopkeeper/goodstype'
        };
    });

    router.post('/adminer-shopkeeper/goodstype-del', function *() {

        var id = this.request.body.id;
        if (!id) {
            this.body = 'nothing';
            return;
        }
        var type = yield GoodsType.findById(id);
        if (type == null) {
            this.body = 'nothing';
            return;
        }
        if (type.type == 2) {
            var count = yield GoodsOfTypes.count({
                where: {
                    GoodsTypeId: id
                }
            });
            if (count == 0) {
                type.destroy();
            } else {
                this.body = 1;
                return;
            }
        }
        else {
            var count = yield GoodsType.count({
                where: {
                    GoodsTypeId: id
                }
            });
            if (count == 0) {
                type.destroy();
            } else {
                this.body = 1;
                return;
            }
        }

        yield type.save();

        this.body = 0;

    });

};
