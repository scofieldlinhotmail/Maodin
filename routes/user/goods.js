var Sequelize = require('sequelize');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');
var util = require('util');

var sequelizex = require('../../lib/sequelizex.js');


var Goods = db.models.Goods;
var GoodsView = db.models.GoodsShortcutView;
var SalerGoods = db.models.SalerGoods;
var Store = db.models.Store;
var GoodsType = db.models.GoodsType;
var ShoppingCart = db.models.ShoppingCart;
var GoodsCollection = db.models.GoodsCollection;

module.exports = (router) => {

    router.get('/user/goods-list', goodsListView);
    router.get('/user/goods-list/:id', goodsListView);

    function * goodsListView() {

        var types  = yield GoodsType.structured();

        this.body = yield render('phone/goods-list.html', {
            noHeaderTpl: true,
            types,
            storeId: this.params.id ? this.params.id: 'null'
        });
    }

    var goodsPerPage = 10;
    router.post('/get-goods', getGoodsData);

    function *getGoodsData() {

        this.checkBody('page').notEmpty().isInt().toInt();
        this.checkBody('orderMode').notEmpty();

        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var body = this.request.body;


        var where = {};
        if (body.searchKey) {
            where.title = {
                $like: `%${body.searchKey.trim()}%`
            };
        }
        if (body.typeId && /^\d*$/.test(body.typeId)) {
            where.GoodsTypeId = body.typeId;
        }

        where.capacity = {
            $gt: 0
        };

        var conditions = {
            where,
            offset: (body.page - 1) * goodsPerPage,
            limit: goodsPerPage
        };

        if (['createdAt DESC', 'compoundSoldNum DESC', 'price DESC', 'price'].indexOf(body.orderMode) < 0) {
            this.body = 'invalid order';
            return;
        }
        conditions.order = body.orderMode;

        var storeId = body.storeId;
        if (storeId) {
            var goodsIds = (yield SalerGoods.findAll({
                attribute: ['GoodId'],
                where: {
                    StoreId: storeId
                },
                include: [Store]
            })).map((item) => item.GoodId);
            conditions.where.id = {
                $in: goodsIds
            }
        }

        this.body = (yield GoodsView.findAll(conditions)).map((item) => item.dataValues);

    }

    router.get('/user/goods-page/:type/:id', function *() {

        // todo: 评价
        this.checkParams('id').notEmpty().isInt().toInt();
        this.checkParams('type').notEmpty().isInt().toInt();

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var goods;
        if (this.params.type == 0) {
            goods = yield Goods.findById(this.params.id);
        } else {
            var salerGoods = yield SalerGoods.findById(this.params.id);
            goods = salerGoods ? yield salerGoods.getGood() : null;
        }

        if (!goods || goods.status !== 1) {
            this.body = "错误访问";
            return;
        }

        goods.GoodsType = yield goods.getGoodsType();
        goods.imgs = JSON.parse(goods.imgs);

        var id = this.params.id;

        goods.num = yield ShoppingCart.num(id, (yield auth.user(this)).id, this.params.type);
        goods.isCollected = yield GoodsCollection.isCollected(id, (yield auth.user(this)).id, this.params.type);

        goods.extraFields = JSON.parse(goods.extraFields);

        var user = yield auth.user(this);
        var store = yield Store.findOne({
            where: {
                UserId: user.id
            }
        });

        var isSaled = typeof store === 'undefined' ? false : (yield SalerGoods.count({
            where: {
                GoodId: goods.id,
                StoreId: store.id
            }
        })) != 0;

        this.body = yield render('phone/goods-page', {
            title: '商品:' + goods.title,
            goods: goods,
            noFooterTpl: true,
            isSaler: typeof store !== 'undefined',
            isSaled,
            type: this.params.type
        });
    });

    router.get('/user/goods-collection', function *() {

        var goodsAttributes = ['id', 'mainImg', 'price', 'oldPrice', 'baseSoldNum', 'soldNum', 'title'];
        var userId = (yield auth.user(this)).id;
        var collections = yield [
            GoodsCollection.findAll({
                where: {
                    UserId: userId,
                    type: 0
                },
                include: [{
                    model: Goods,
                    attributes: goodsAttributes,
                    required: true
                }]
            }),
            GoodsCollection.findAll({
                where: {
                    UserId: userId,
                    type: 1
                },
                include: [
                    {
                        model: SalerGoods,
                        required: true,
                        include: [{
                            model: Goods,
                            attributes: goodsAttributes,
                            required: true
                        }]
                    }
                ]
            })
        ];

        collections = collections[0].concat(collections[1].map((item) => {

            item.dataValues.Good = item.SalerGood.Good;
            return item.dataValues;
        }));

        this.body = yield render('phone/goods-collection', {
            collections: JSON.stringify(collections),
            title: '商品收藏'
        });

    });

    router.get('/user/sale/:id/:action', function *() {

        this.checkParams('id').notEmpty().isInt().toInt();
        this.checkParams('action').notEmpty().isInt().toInt();

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var user = yield auth.user(this);
        var store = yield Store.findOne({
            where: {
                UserId: user.id
            }
        });
        if (util.isNullOrUndefined(store)) {
            this.body = '错误操作';
            return;
        }

        var action = this.params.action;

        if (action == 1) {
            if ((yield Goods.count({
                    where: {
                        id: this.params.id,
                        status: 1
                    }
                })) == 0) {
                this.body = '错误操作';
                return;
            }

            yield SalerGoods.create({
                GoodId: this.params.id,
                StoreId: store.id
            });
        } else {
            yield SalerGoods.destroy({
                where: {
                    GoodId: this.params.id,
                    StoreId: store.id
                }
            });
        }

        this.body = 'ok';
    });

    router.get('/user/goods-collect/:type/:id', function *() {
        this.checkParams('id').notEmpty();
        this.checkParams('type').notEmpty();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var id = this.params.id;
        var type = this.params.type;

        var user = yield auth.user(this);

        var item = yield GoodsCollection.findOneWithType(id, user.id, type);
        if (item) {
            yield item.destroy();
        } else {
            yield GoodsCollection.createWithType(id, user.id, type);
        }
        this.body = 'ok';
    });

};