var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

var sequelizex = require('../../lib/sequelizex.js');

var util = require('util');


var Store = db.models.Store;
var GoodsShortcutView = db.models.GoodsShortcutView;
var Slideshow = db.models.Slideshow;
var Goods = db.models.Goods;
var Favorite = db.models.Favorite;
var User = db.models.User;

module.exports = (router) => {

    router.get('/adminer-store/list', function *() {

        var nums = yield [
            Store.scope('all').count({
                where:{
                    status: 0
                }
            }),
            Store.scope('all').count({
                where: {
                    status: 1
                }
            })
        ];

        var stores = yield Store.scope('all').findAll({
            where:{
                status: 1
            },
            attributes: ['id', 'name']
        });

        this.body = yield render('store/list', {
            nums,
            stores
        });

    });

    router.get('/adminer-store/list/:status', function *() {
        this.body = yield Store.scope('all').findAll({
            where: {
                status: this.params.status
            },
            include: [
                {
                    model:  Store.scope('all'),
                    as: 'TopStore',
                    required: false
                },
                User
            ]
        });
    });


    router.post('/adminer-store/check', function *() {

        this.checkBody('ids').notEmpty();
        this.checkBody('action').notEmpty();

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var ids = this.request.body.ids;
        var action = this.request.body.action;

        if (action == 'pass') {
            this.body = yield Store.update({
                status: 1
            }, {
                where:{
                    id: {
                        $in: ids
                    },
                    status: 0
                }
            });
        } else {
            this.body = yield Store.scope('all').destroy({
                where: {
                    id: {
                        $in: ids
                    }
                },
                force: true
            });
        }
    });

    router.post('/adminer-store/action', function *() {

        this.checkBody('ids').notEmpty();
        this.checkBody('action').notEmpty();

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var ids = this.request.body.ids;
        var action = this.request.body.action;

        this.body = yield Store.scope('all').update({
            deletedAt: action == 'lock' ? new Date() : null
        }, {
            where:{
                id: {
                    $in: ids
                }
            }
        });
    });

    router.post('/adminer-store/detail', function *() {

        this.checkBody('id').notEmpty();

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var id = this.request.body.id;

        var store = yield Store.scope('all').findOne({
            where: {
                id: id
            },
            include: [
                {
                    model: Store,
                    as: 'TopStore',
                    required: false,
                    include: [User]
                },
                Store,
                User
            ]
        });
        this.body = store;
    });

    router.post('/adminer-store/save', function *() {
        this.checkBody('id').notEmpty();
        this.checkBody('username').notEmpty();
        this.checkBody('name').notEmpty();
        this.checkBody('phone').notEmpty();

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var body = this.request.body;

        this.body = yield Store.update({
            username: body.username,
            name: body.name,
            phone: body.phone,
            StoreId: body.StoreId ? body.StoreId: null,
        }, {
            where: {
                id: body.id
            }

        });
    })
};