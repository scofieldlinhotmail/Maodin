var db = require('./index.js');
var co = require('co');


function * adminerSeed(){
    for(var i = 0; i < 40; i ++) {
        yield db.models.Adminer.create({
            name: '用户' + i,
            password: '123456',
            phone: '18840823910',
            nickname: '用户' + i,
            type: i % 3 + 1
        })
    }
}

function * userSeed(){
    for(var i = 0; i < 40; i ++) {
        yield db.models.User.create({
            name: '用户' + i,
            password: '123456',
            phone: '18840823910',
            nickname: '用户' + i,
            headimage: 'http://www.baidu.com',
            sex: 0,
            unionid: 'unionid',
            openid: 'openid',
            joinTime: Date.now()
        })
    }
}

function * goodsSeed() {
    var goodsTypes = yield db.models.GoodsType.findAll({
        where: {
            type: 2,
            //status: 0
        }
    });
    for(var i = 0; i < 40; i ++) {
        yield db.models.Goods.create({
            title: '商品' + i,
            mainImg: '/tmp/1 (1).jpg',
            imgs: '["/tmp/1 (2).jpg", "/tmp/1 (3).jpg"]',
            price: 20 + i,
            oldPrice: 10 + i,
            capacity: 20 + i,
            content: '内容' + i,
            GoodsTypeId: goodsTypes[i % goodsTypes.length].id,
            perStr:  i % 2 ? '每斤' : '每个',
            brief: '简介',
            perNum: i % 6
        })
    }
}

function * goodsTypeSeed() {
    var ids = [];
    ids.push(yield db.models.GoodsType.create({
        title: '时令水果',
        type: 1
    }));
    ids.push(yield db.models.GoodsType.create({
        title: '新鲜蔬菜',
        type: 1
    }));
    ids.push(yield db.models.GoodsType.create({
        title: '禽蛋肉类',
        type: 1
    }));
    yield db.models.GoodsType.create({
        title: '禽蛋肉类',
        type: 1
    });
    yield db.models.GoodsType.create({
        title: '叶菜类',
        type: 2,
        GoodsTypeId: ids[0].id
    });
    yield db.models.GoodsType.create({
        title: '根茎类',
        type: 2,
        GoodsTypeId: ids[0].id
    });
    yield db.models.GoodsType.create({
        title: '豆类',
        type: 2,
        GoodsTypeId: ids[0].id
    });
    yield db.models.GoodsType.create({
        title: '精品类',
        type: 2,
        GoodsTypeId: ids[1].id
    });
    yield db.models.GoodsType.create({
        title: '热带类',
        type: 2,
        GoodsTypeId: ids[1].id
    });
    yield db.models.GoodsType.create({
        title: '苹果类',
        type: 2,
        GoodsTypeId: ids[1].id
    });
}

function * msgSeed(){
    var users = yield db.models.User.findAll({});
    for(var i = 0; i < 160; i ++) {
        yield db.models.Msg.create({
            title: '消息测试' + i,
            link: '#',
            UserId: users[i % users.length].id
        })
    }
}

function * areaSeed() {
    var ids = [];
    for(var i = 0; i < 40; i ++) {
        ids.push((yield db.models.Area.create({
            title: '一级区域' + i,
            type: 1
        })).id);
    }

    for(var i = 0; i < ids.length; i ++) {
        for(var j = 0; j < 40; j ++) {
            yield db.models.Area.create({
                title: '二级区域' + j,
                type: 2,
                AreaId: ids[i % ids.length],
                TopAreaId: ids[i % ids.length]
            });
        }
    }
}

function * addressSeed() {
    var users = yield db.models.User.findAll({});
    var areas = yield db.models.Area.findAll({
        where: {
            type: 2
        }
    });
    var defaults = {};
    for(var i = 0; i < 160; i ++) {
        yield db.models.DeliverAddress.create({
            recieverName: '收货人' + i,
            phone: "1884082391" + i % 10,
            province: '辽宁省',
            city: '大连市',
            area: '开发区',
            address: '大连理工大学软件学院',
            isDefault: defaults[users[i % users.length].id] ? false : true,
            UserId: users[i % users.length].id,
            AreaId: areas[i % areas.length].id
        })
        defaults[users[i % users.length].id] = true;
    }
}

function * containerSeed() {
    yield db.models.Container.fare({
        basicFare: 10,
        freeLine: 80
    });
}

function * shoppingCartSeed() {
    var users = yield db.models.User.findAll({});
    var goods = yield db.models.Goods.findAll({});
    for(var i = 0; i < users.length; i ++) {
        for(var j = 0 ; j < goods.length; j ++) {
            s = yield db.models.ShoppingCart.create({
                num: i + j + 1,
                UserId: users[i % users.length].id,
                GoodId: goods[j % goods.length].id
            });
        }
    }
}

function * orderSeed() {
    var fare = yield db.models.Container.fare();
    var users = yield db.models.User.findAll({});
    var areas = yield db.models.Area.findAll({
        where: {
            type: 2
        }
    });
    var goods = yield db.models.Goods.findAll({});
    for(var i = 0; i < users.length; i ++) {
        for(var j = 0 ; j < 80; j ++) {
            var items = [];
            var price = 0;
            for(var k = 0 ; k < (i + j % 10) + 1; k ++ ){
                var goodsItem = goods[(i+j+k) % goods.length];
                price += (i+j+k) * goodsItem.price;
                items.push(db.models.OrderItem.build({
                    goods: JSON.stringify(goodsItem),
                    price: ((i + j % 10) + 1) * goodsItem.price,
                    num: (i + j % 10) + 1,
                    GoodId: goodsItem.id
                }));
            }
            var orderFare = 0;
            if (price < parseFloat(fare.freeLine)) {
                orderFare = fare.basicFare;
                price += orderFare;
            }
            var order = yield db.models.Order.create({
                recieverName: '收货人' + i,
                phone: "1884082391" + i % 10,
                province: '辽宁省',
                city: '大连市',
                area: '开发区',
                address: '大连理工大学软件学院',
                price,
                num: items.length,
                status: 1,
                fare: orderFare,
                message: '留言啊',
                UserId: users[i].id,
                AreaId: areas[i % areas.length].id,
            });
            for(var k = 0 ; k < items.length; k ++ ){
                items[k].OrderId = order.id;
                yield items[k].save();
            }
        }
    }
}

function * init() {
    yield db.sync({force: true});
    yield adminerSeed();
    //yield goodsTypeSeed();
    yield areaSeed();
    yield userSeed();
    //yield goodsSeed();
    //yield msgSeed();
    yield addressSeed();
    //yield containerSeed();
    //yield shoppingCartSeed();
    //yield orderSeed();
}

function *addSuperAdminer() {
    yield db.models.Adminer.create({
        nickname: 'super',
        name: '超级管理员',
        phone: '18840823910',
        password: '123456',
        status: 0,
        type: 100
    });
}

co(function * () {
    yield db.sync({force: true});
    console.log('finished ...');
}).catch(function () {
    console.log(arguments);
});







