var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

var sequelizex = require('../../lib/sequelizex.js');

var ShoppingCart = db.models.ShoppingCart;
var Goods = db.models.Goods;
var GoodsView = db.models.GoodsShortcutView;
var SalerGoods = db.models.SalerGoods;
var Store = db.models.Store;


module.exports = (router) => {

    router.get('/user/shoppingcart/:type/:id/:num', function *() {
        this.checkParams('type').notEmpty().isInt().ge(0).le(1).toInt();
        this.checkParams('id').notEmpty().isInt().toInt();
        this.checkParams('num').notEmpty().isInt().toInt();
        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var id = this.params.id;
        var type = this.params.type;
        var num = this.params.num;
        var user = yield auth.user(this);

        var shoppingCart = yield ShoppingCart.findOneWithType(id, user.id, type);

        if (shoppingCart) {
            if (num >= 0) {
                shoppingCart.num = this.params.num;
                yield shoppingCart.save();
            } else {
                yield shoppingCart.destroy();
            }
        } else if (num >= 0) {
            yield ShoppingCart.createWithType(id, user.id, type, num);
        }
        this.body = 'ok';
    });

    //router.get('/user/shoppingcart', function *() {
    //    this.body = yield ShoppingCart.findAll({
    //        where: {
    //            UserId: (yield auth.user(this)).id
    //        },
    //        attributes: ['id', 'num', 'GoodId']
    //    });
    //});

    router.get('/user/shoppingcart-view', function *() {

        var goodsAttributes = {
            exclude: ['content', 'extraFields', 'commission1', 'commission2', 'commission3', 'createdAt', 'updatedAt']
        };

        var shoppingCart = yield [
            ShoppingCart.findAll({
                where: {
                    UserId: (yield auth.user(this)).id,
                    type: 0
                },
                include: [{
                    model: Goods,
                    attributes: goodsAttributes
                }]
            }),
            ShoppingCart.findAll({
                where: {
                    UserId: (yield auth.user(this)).id,
                    type: 1
                },
                include: [
                    {
                        model: SalerGoods,
                        include: [
                            {
                                model: Goods,
                                attributes: goodsAttributes,
                                required: true
                            },
                            {
                                model: Store,
                                attributes: ['name'],
                                required: true
                            }
                        ]
                    }
                ]
            })
        ];

        this.body = yield render('phone/shoppingCart', {
            title: '购物车',
            shoppingCart: JSON.stringify(shoppingCart)
        });
    });

};