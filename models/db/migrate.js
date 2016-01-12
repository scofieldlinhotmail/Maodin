var db = require('./index.js');
var co = require('co');

function *addSuperAdminer() {
    yield db.models.Adminer.create({
        nickname: 'super',
        name: '超级管理员',
        phone: '12345678901',
        password: '123456',
        status: 0,
        type: 100
    });
}

function * adminerSeed(){
    yield addSuperAdminer();
    for(var i = 0; i < 40; i ++) {
        yield db.models.Adminer.create({
            name: '用户' + i,
            password: '123456',
            phone: '18840823910',
            nickname: '用户' + i,
            type: i % 4 + 1
        })
    }
}

function * commentSeed(){
    for(var i = 0; i < 40; i ++) {
        yield db.models.Comment.create({
            score:i%5,
            status:i%2,
            message:"message"+i,
            UserId:1,
            GoodId:1

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

function diffDate() {
    for(var i = 1; i < 1000; i ++) {
        for(var j = 1; j < 3000; j ++) {

        }
    }
    return Date.now();
}

function * goodsTypeSeed() {
    var ids = [];
    var fields = [
        {
            title: "扩展属性"
        }
    ];
    for(var i = 1; i < 5; i ++) {
        var tmp = yield db.models.GoodsType.create({
            title: '一级类型' + i,
            type: 1,
            fields: JSON.stringify([
                {
                    title: '一级扩展属性1',
                    id: diffDate(),
                    type: '0',
                    options: []
                },
                {
                    title: '一级扩展属性2',
                    id: diffDate(),
                    type: '1',
                    options: []
                },
                {
                    title: '一级扩展属性3',
                    id: diffDate(),
                    type: '2',
                    options: []
                },
                {
                    title: '一级扩展属性4',
                    id: diffDate(),
                    type: '3',
                    options: ['1', '2', '3']
                },
                {
                    title: '一级扩展属性5',
                    id: diffDate(),
                    type: '4',
                    options: ['1', '2', '3']
                }
            ])
        });
        ids.push(tmp.id);
    }
    for(var j = 0; j < ids.length; j ++) {
        for(var i = 1; i < 5; i ++) {
            var tmp = yield db.models.GoodsType.create({
                title: '二级类型' + i,
                type: 2,
                GoodsTypeId: ids[j],
                fields: JSON.stringify([
                    {
                        title: '二级扩展属性1',
                        id: diffDate(),
                        type: '0',
                        options: []
                    },
                    {
                        title: '二级扩展属性2',
                        id: diffDate(),
                        type: '1',
                        options: []
                    },
                    {
                        title: '二级扩展属性3',
                        id: diffDate(),
                        type: '2',
                        options: []
                    },
                    {
                        title: '二级扩展属性4',
                        id: diffDate(),
                        type: '3',
                        options: ['1', '2', '3']
                    },
                    {
                        title: '二级扩展属性5',
                        id: diffDate(),
                        type: '4',
                        options: ['1', '2', '3']
                    }
                ])
            });
        }
    }

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
    yield goodsTypeSeed();
    //yield areaSeed();
    //yield userSeed();
    //yield goodsSeed();
    //yield msgSeed();
    //yield addressSeed();
    //yield containerSeed();
    //yield shoppingCartSeed();
    //yield orderSeed();
    //yield commentSeed();
}



co(function * () {
    yield init();
    console.log('finished ...');
}).catch(function () {
    console.log(arguments);
});







