var Sequelize = require('sequelize');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

var sequelizex = require('../../lib/sequelizex.js');


var Goods = db.models.Goods;
var GoodsView = db.models.GoodsShortcutView;
var GoodsType = db.models.GoodsType;
var ShoppingCart = db.models.ShoppingCart;
var GoodsCollection = db.models.GoodsCollection;

module.exports = (router) => {

    router.get('/user/goods-list',  function *() {

        var types = yield GoodsType.findAll({
            where: {
                type: 1
            },
            attribute: ['id', 'title'],
            include: [
                {
                    model: GoodsType,
                    attribute: ['id', 'title']
                }
            ]
        });

        this.body = yield render('phone/goods-list.html', {
            noHeaderTpl: true,
            types
        });
    });

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
        if (body.typeId && /^\d*$/.test(body.typeId)){
            where.GoodsTypeId = body.typeId;
        }

        where.status = 1;
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

        this.body = (yield GoodsView.findAll(conditions)).map((item) => item.dataValues);

    }

    router.get('/user/goods-page/:id', function *() {


        this.checkParams('id').notEmpty().isInt().toInt();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var goods = yield Goods.findById(this.params.id);
        if (!goods || goods.status !== 1 ){
            this.body = "错误访问";
            return;
        }
        goods.GoodsType = yield goods.getGoodsType();
        goods.imgs = JSON.parse(goods.imgs);
        var shoppingCart = yield ShoppingCart.findOne({
            where:{
                UserId: (yield auth.user(this)).id,
                GoodId: this.params.id,
            }
        });
        goods.num = shoppingCart ? shoppingCart.num : 0;
        goods.isCollected = (yield GoodsCollection.count({
            where: {
                GoodId: goods.id,
                UserId: (yield auth.user(this)).id,
            }
        })) != 0;
        this.body = yield render('phone/goods.html', {
            title: '商品:' + goods.title,
            goods: goods
        });
    });

    router.get('/user/goods-collection', function *() {
        this.body = (yield GoodsCollection.findAll({
            where: {
                UserId: (yield auth.user(this)).id
            },
            include: [Goods]
        })).map(function (item) {
            return item.Good;
        });
    });

    router.get('/user/goods-collect/:id', function *() {
        this.checkParams('id').notEmpty();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var id = this.params.id;
        var item = yield GoodsCollection.findOne({
            where: {
                UserId: (yield auth.user(this)).id,
                GoodId: id
            }
        });
        if (item) {
            yield item.destroy();
        } else {
            yield GoodsCollection.collect((yield auth.user(this)).id, id);
        }
        this.body = 'ok';
    });

};