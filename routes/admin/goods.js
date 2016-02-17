var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug');
var sequelize = require('sequelize');
var util = require('util');
var moment = require('moment');

module.exports = (router) => {

    var Goods = db.models.Goods;
    var GoodsType = db.models.GoodsType;
    var GoodsOfTypes = db.models.GoodsOfTypes;
    var OrderItem = db.models.OrderItem;
    var ShoppingCart = db.models.ShoppingCart;
    var GoodsCollection = db.models.GoodsCollection;

    router.get('/adminer-shopkeeper/goods/save',  saveView);
    router.get('/adminer-shopkeeper/goods/save/:id',  saveView);

    router.post('/adminer-shopkeeper/goods/save',  save);
    router.post('/adminer-shopkeeper/goods/save/:id',  save);

    function *saveView() {
        var types = yield GoodsType.findAll({
            where: {
                type: 1
            },
            include: [GoodsType]
        });

        var data;
        if (this.params.id ){
            data = yield Goods.scope('all').findById(this.params.id);
            data.dataValues.timeToDown = moment(data.timeToDown).format('MM/DD/YYYY hh:mm A').toString();
            data.typeIds = JSON.stringify((yield data.getGoodsOfTypes()).map((rel) => rel.GoodsTypeId));
        }

        this.body = yield render('goods/save.html', {
            types,
            typesStr: JSON.stringify(types),
            data: data
        });
    }

    function *save() {
        this.checkBody('title').notEmpty();
        this.checkBody('mainImg').notEmpty();
        this.checkBody('imgs').notEmpty();
        this.checkBody('price').notEmpty().isFloat().ge(0).toFloat();
        this.checkBody('oldPrice').notEmpty().isFloat().ge(0).toFloat();
        this.checkBody('capacity').notEmpty().isInt().ge(0).toInt();
        this.checkBody('typeIds').notEmpty();
        this.checkBody('baseSoldNum').notEmpty().isInt().toInt();
        this.checkBody('commission1').notEmpty().isFloat().ge(0).toFloat();
        this.checkBody('commission2').notEmpty().isFloat().ge(0).toFloat();
        this.checkBody('commission3').notEmpty().isFloat().ge(0).toFloat();
        this.checkBody('integral').notEmpty().isFloat().ge(0).toFloat();
        this.checkBody('taxRate').notEmpty().isFloat().ge(0).toFloat();

        var body = this.request.body;

        if (!(body.typeIds instanceof Array)) {
            body.typeIds = [body.typeIds];
        }

        console.log(body.typeIds);

        var type = yield GoodsType.findAll({
            where: {
                id: {
                    $in: body.typeIds
                }
            },
            include: [{
                model: GoodsType,
                as: 'ParentType'
            }]
        });

        var fields = [];

        type.forEach(function (stype) {
            fields = fields.concat(JSON.parse(stype.fields).concat(JSON.parse(stype.ParentType.fields)))
        });

        var extraFields = [];

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        for(var key in fields) {
            if (fields.hasOwnProperty(key)) {
                var field = fields[key];
                var val = body[field.id];
                if (!util.isNullOrUndefined(field) && field.length != 0) {
                    field.value = val;
                    extraFields.push(field);
                }
            }
        }


        var isCreate = true;
        var createTypeTask = [];
        var goods;
        if (body.id) {
            goods = yield Goods.scope('all').findById(body.id);
            if (goods != null) {
                goods.title = body.title;
                goods.mainImg = body.mainImg;
                goods.imgs = body.imgs;
                goods.price = body.price;
                goods.oldPrice = body.oldPrice;
                goods.capacity = body.capacity;
                goods.GoodsTypeId = body.GoodsTypeId;
                goods.content = body.content;
                goods.commission1 = body.commission1;
                goods.commission2 = body.commission2;
                goods.commission3 = body.commission3;
                goods.integral = body.integral;
                goods.baseSoldNum = body.baseSoldNum;
                goods.compoundSoldNum = goods.baseSoldNum + goods.soldNum;
                goods.taxRate = body.taxRate;
                goods.extraFields = JSON.stringify(extraFields);
                goods.timeToDown = body.hasTimeToDown ? (new Date(body.timeToDown)).getTime() : null;
                goods.buyLimit = body.buyLimit ? body.buyLimit : 0;

                yield goods.save();
                createTypeTask.push(GoodsOfTypes.destroy({
                    where: {
                        GoodId: goods.id
                    }
                }));

                yield createTypeTask;

                createTypeTask = [];

                isCreate = false;
            }
        }

        if (isCreate) {
            goods = yield Goods.create({
                title: body.title,
                mainImg: body.mainImg,
                imgs: body.imgs,
                price: body.price,
                oldPrice: body.oldPrice,
                capacity: body.capacity,
                commission1: body.commission1,
                commission2: body.commission2,
                commission3: body.commission3,
                integral: body.integral,
                baseSoldNum: body.baseSoldNum,
                compoundSoldNum: body.baseSoldNum,
                GoodsTypeId: body.GoodsTypeId,
                soldNum: 0,
                content: body.content,
                taxRate: body.taxRate,
                extraFields: JSON.stringify(extraFields),
                timeToDown: body.hasTimeToDown ? (new Date(body.timeToDown)).getTime() : null,
                buyLimit: body.buyLimit ? body.buyLimit : 0,
                // todo: ok?
                deletedAt: Date.now()
            });

        }
        for(var i = 0; i < body.typeIds; i ++) {
            createTypeTask.push(GoodsOfTypes.create({
                GoodId: goods.id,
                GoodsTypeId: body.typeIds[i]
            }));
        }
        yield createTypeTask;

        this.redirect('/adminer-shopkeeper/goods');
    }

    router.get('/adminer-shopkeeper/goods',function *(){

        var types = yield GoodsType.findAll({
            where: {
                type: 1
            },
            include: [
                {
                    model: GoodsType,
                    attributes: ['id', 'title']
                }
            ],
            attributes: ['id', 'title']
        });

        this.body = yield render('goods/list.html',{
            types: JSON.stringify(types)
        });
    });

    router.get('/adminer-shopkeeper/goods/:status',function *(){
        this.checkParams('status').notEmpty().isInt().toInt();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var model = Goods;
        if (this.params.status < 1) {
            model = model.scope('deleted');
        }
        this.body = yield model.findAll({
            attributes: [
                'id',
                'mainImg',
                'soldNum', 'baseSoldNum', 'capacity',
                'title',
                'deletedAt',
                'oldPrice', 'price',
                'commission1', 'commission2', 'commission3',
                'integral', 'buyLimit',
                'deletedAt',
                'taxRate'
            ],
            include: [GoodsOfTypes]
        });
    });

    router.post('/adminer-shopkeeper/goods/action',function *(){

        this.checkBody('id').notEmpty().isInt().toInt();
        this.checkBody('action').notEmpty();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var body = this.request.body;
        var action = body.action;

        if (action == 'up') {
            yield Goods.up(body.id);
        } else if (action == 'down') {
            yield Goods.down(body.id);
        } else if (action == 'del') {
            yield Goods.remove(body.id);
        }

        this.body = {
            status: true
        };
    });

    //router.get('/adminer-shopkeeper/goods/all',function *(){
    //    var goods = yield Goods.findAll({
    //        attributes: ['id','title', 'price','soldNum','content']
    //    });
    //    this.body = JSON.stringify(goods);
    //});
    //
    //router.get('/adminer-shopkeeper/goods/remove/:id',function *(){
    //    var id = this.params.id;
    //    try {
    //        yield Goods.destroy({
    //            where: {
    //                id: id
    //            }
    //        });
    //        this.body = '1';
    //    }catch(err){
    //        this.body = '0';
    //        console.log(error);
    //    }
    //});

    ///商品详情
    router.get('/adminer-shopkeeper/goods/detail',function *(){

        var id = this.query.id;
        var good= yield Goods.findById(id);

        var dates=[];
        var count=[];
        for(var i=0;i<10;i++)
        {
            var n=new Date;

            n.setDate(n.getDate() - i);

            dates.push(n.getMonth()+1+"-"+n.getDate());


            var items= yield OrderItem.findAll({
                where: {
                    GoodId: id,
                    createdAt: {
                        $gte: new Date(n.getFullYear(), n.getMonth(), n.getDate()),
                        $lt: new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1)
                    }
                }
            });

            var len = items.length,
                i1 = 0;
            var c=0;
            for (; i1 < len; ++i1) {
               c+=items[i1].num;
            }

            count.push(c);
        }


        var imgs=eval(good.imgs);

        this.body = yield render('goods/detail.html', {
           good,imgs,count,dates
        });

    });

};