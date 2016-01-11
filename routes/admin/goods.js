var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug');
var sequelize = require('sequelize');

module.exports = (router) => {

    var Goods = db.models.Goods;
    var GoodsType = db.models.GoodsType;
    var OrderItem = db.models.OrderItem;

    router.get('/adminer-shopkeeper/goods/save',  saveView);
    router.get('/adminer-shopkeeper/goods/save/:id',  saveView);

    router.post('/adminer-shopkeeper/goods/save',  save);
    router.post('/adminer-shopkeeper/goods/save/:id',  save);

    function *saveView() {
        var types = yield GoodsType.findAll({
            where: {
                type: 1
            },
            attributes: ['title', 'type', 'id'],
            include: [GoodsType]
        });

        var data;
        if (this.params.id ){
            data = yield Goods.findById(this.params.id);
            data = data.dataValues;
            data.discount = data.discount ? 'checked' : '';
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
        this.checkBody('perNum').notEmpty().isInt().gt(0).toInt();
        this.checkBody('perStr').notEmpty();
        this.checkBody('GoodsTypeId').notEmpty().isInt().toInt();
        this.checkBody('brief').notEmpty();

        var body = this.request.body;

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var isCreate = true;
        if (body.id) {
            var goods = yield Goods.findById(body.id);
            if (goods != null) {
                goods.title = body.title;
                goods.mainImg = body.mainImg;
                goods.imgs = body.imgs;
                goods.price = body.price;
                goods.oldPrice = body.oldPrice;
                goods.capacity = body.capacity;
                goods.perNum = body.perNum;
                goods.perStr = body.perStr;
                goods.GoodsTypeId = body.GoodsTypeId;
                goods.brief = body.brief;
                goods.content = body.content;
                yield goods.save();
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
                perNum: body.perNum,
                perStr: body.perStr,
                GoodsTypeId: body.GoodsTypeId,
                brief: body.brief,
                soldNum: 0,
                content: body.content
            });
        }

        this.redirect('/adminer/goods');
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
        this.body = yield Goods.findAll({
            where: {
                status: this.params.status
            },
            attributes: [
                'id',
                'mainImg',
                'soldNum', 'capacity',
                'title',
                'status',
                'oldPrice', 'price',
                'perNum', 'perStr'
            ],
            include: [GoodsType]
        });
    });

    router.post('/adminer-shopkeeper/goods/action',function *(){
        this.checkBody('id').notEmpty().isInt().toInt();
        this.checkBody('status').notEmpty().isInt().toInt();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var body = this.request.body;
        yield Goods.update({
            status: body.status
        }, {
            where: {
                id: body.id
            }
        });

        if (body.status == 0 ){
            // 购物车清理
            yield db.models.ShoppingCart.destroy({
                where: {
                    GoodId:  body.id
                }
            });
        }

        this.body = {
            status: true
        };
    });

    router.get('/adminer-shopkeeper/goods/all',function *(){
        var goods = yield Goods.findAll({
            attributes: ['id','title', 'price','soldNum','content']
        });
        console.log(JSON.stringify(goods));
        this.body = JSON.stringify(goods);
    });

    router.get('/adminer-shopkeeper/goods/remove/:id',function *(){
        var id = this.params.id;
        try {
            yield Goods.destroy({
                where: {
                    id: id
                }
            });
            this.body = '1';
        }catch(err){
            this.body = '0';
            console.log(error);
        }
    });

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