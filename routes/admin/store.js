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
            Store.count({
                where:{
                    status: 0
                }
            }),
            Store.count({
                where: {
                    status: 1
                }
            })
        ];

        this.body = yield render('store/list', {
            nums
        });

    });

    router.get('/adminer-store/list/:status', function *() {
        this.body = yield Store.scope('all').findAll({
            where: {
                status: this.params.status
            },
            include: [
                {
                    model: Store,
                    as: 'TopStore',
                    required: false
                },
                User
            ]
        });
    })

};