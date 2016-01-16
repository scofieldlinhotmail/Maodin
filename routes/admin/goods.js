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
            data.timeToDown = moment(data.timeToDown).format('MM/DD/YYYY hh:mm A');
        }

        this.body = yield render('goods/save.html', {
            types: JSON.stringify(types),
            data: data
        });
    }

    function *save() {
        this.checkBody('title').notEmpty();
        this.checkBody('mainImg').notEmpty();
        this.checkBody('imgs').notEmpty();
        this.checkBody('price').notEmpty().isFloat().gt(0).toFloat();
        this.checkBody('oldPrice').notEmpty().isFloat().gt(0).toFloat();
        this.checkBody('capacity').notEmpty().isInt().gt(0).toInt();
        this.checkBody('GoodsTypeId').notEmpty().isInt().toInt();
        this.checkBody('baseSoldNum').notEmpty().isInt().toInt();
        this.checkBody('commission1').notEmpty().isFloat().gt(0).toFloat();
        this.checkBody('commission2').notEmpty().isFloat().gt(0).toFloat();
        this.checkBody('commission3').notEmpty().isFloat().gt(0).toFloat();
        this.checkBody('integral').notEmpty().isFloat().gt(0).toFloat();

        var body = this.request.body;

        var type = yield GoodsType.findOne({
            where: {
                id: body.GoodsTypeId
            },
            include: [{
                model: GoodsType,
                as: 'ParentType'
            }]
        });

        var fields = JSON.parse(type.fields).concat(JSON.parse(type.ParentType.fields));
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
        if (body.id) {
            var goods = yield Goods.scope('all').findById(body.id);
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
                goods.extraFields = JSON.stringify(extraFields);
                goods.timeToDown = body.hasTimeToDown ? (new Date(body.timeToDown)).getTime() : null;
                goods.buyLimit = body.buyLimit ? body.buyLimit : 0;

                yield goods.save();
                debug(body.hasTimeToDown, goods.timeToDown);
                isCreate = false;
            }
        }

        if (isCreate) {
            yield Goods.create({
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
                GoodsTypeId: body.GoodsTypeId,
                soldNum: 0,
                content: body.content,
                extraFields: JSON.stringify(extraFields),
                timeToDown: body.hasTimeToDown ? (new Date(body.timeToDown)).getTime() : null,
                buyLimit: body.buyLimit ? body.buyLimit : 0,
                // todo: ok?
                deletedAt: Date.now()
            });
        }

        this.redirect('/adminer-shopkeeper/goods');
    }

    router.get('/adminer-shopkeeper/goods',function *(){
        this.body = yield render('goods/list.html',{
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
                'integral', 'buyLimit'
            ],
            include: [GoodsType]
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