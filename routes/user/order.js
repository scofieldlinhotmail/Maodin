/**
 * Created by nobody on 2015/12/9.
 */
var Sequelize = require('sequelize');
var util = require('util');
var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');
var co = require('co');

var sequelizex = require('../../lib/sequelizex.js');


var Container = db.models.Container;
var Goods = db.models.Goods;
var SalerGoods = db.models.SalerGoods;
var ShoppingCart = db.models.ShoppingCart;
var DeliverAddress = db.models.DeliverAddress;
var Order = db.models.Order;
var Store = db.models.Store;
var User = db.models.User;
var OrderItem = db.models.OrderItem;

module.exports = function (router) {

    /**
     * type: 0 => from shoppingCart 1 => buy directly
     */
    router.post('/user/order-comfirm', function *() {

        this.checkBody('type').notEmpty().isInt().toInt();

        var body = this.request.body;

        if (body.type == 0) {
            this.checkBody('ids').notEmpty();
        } else {
            this.checkBody('id').notEmpty();
            this.checkBody('num').notEmpty().gt(0).isInt().toInt();
            this.checkBody('goodsType').notEmpty().ge(0).le(1).isInt().toInt();
        }

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var user = yield auth.user(this);

        var order;
        var goodsAttributes = {
            exclude: ['content', 'extraFields', 'commission1', 'commission2', 'commission3', 'timeToDown']
        };
        if (body.type == 0) {
            var ids = JSON.parse(body.ids);

            order = yield [
                ShoppingCart.findAll({
                    where: {
                        UserId: user.id,
                        id: {
                            $in: ids
                        },
                        type: 0
                    },
                    include: [{
                        model: Goods,
                        attributes: goodsAttributes,
                        required: true
                    }],
                }),
                ShoppingCart.findAll({
                    where: {
                        UserId: user.id,
                        id: {
                            $in: ids
                        },
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

        } else {
            order = {
                num: body.num,
                type: body.goodsType
            };
            if (body.goodsType == 0 ){
                order.Good = yield Goods.findOne({
                    where: {
                        id: body.id
                    },
                    attributes: goodsAttributes
                });
            } else {
                order.SalerGood = yield SalerGoods.findOne({
                    where: {
                        id: body.id
                    },
                    include: [
                        {
                            model: db.models.Goods,
                            attributes: goodsAttributes
                        },
                        {
                            model: Store,
                            attributes: ['name'],
                            required: true
                        }
                    ]
                });
            }
            order = [null, [order]];
        }


        var addresses = yield DeliverAddress.findAll({
            where: {
                UserId: (yield auth.user(this)).id
            }
        });

        this.body = yield render('phone/order-comfirm', {
            title: '订单确认',
            order: JSON.stringify(order),
            addresses: JSON.stringify(addresses),
            type: body.type
        });
    });

    router.post('/user/buy', function *() {

        this.checkBody('order').notEmpty();
        this.checkBody('address').notEmpty();
        this.checkBody('type').notEmpty().isInt().ge(0).le(1).toInt();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var body = this.request.body;
        var orderInfo = JSON.parse(body.order);
        var addressId = body.address;
        var userId = (yield auth.user(this)).id;
        var type = body.type;

        var address = yield DeliverAddress.findOne({
            where: {
                id: addressId,
                UserId: (yield auth.user(this)).id
            }
        });

        var user = yield User.findById(userId);

        if (util.isNullOrUndefined(user)) {
            this.body = '用户不存在';
            return;
        }


        if (!address) {
            this.body = 'invalid address';
            return;
        }

        var shoppingCart;
        if (type == 0) {
            var ids = [];
            orderInfo.forEach((shopOrder)  => {
                shopOrder.suborders.forEach((item) => {
                    ids.push(item.id);
                });
            });

            shoppingCart = yield ShoppingCart.findAll({
                where: {
                    UserId: (yield auth.user(this)).id,
                    id: {
                        $in: ids
                    }
                },
                attributes: ['id', 'num']
            });

        } else {

        }

        var goodsIds = [];
        var storeIds = [];

        orderInfo.forEach((shopOrder)  => {
            storeIds.push(shopOrder.storeId);
            shopOrder.suborders.forEach((item) => {
                goodsIds.push(item.GoodsId);

            });
        });

        var storeData = yield Store.findAll({
            where: {
                id: {
                    $in: storeIds
                }
            }
        });


        var goodsData = yield Goods.findAll({
            where: {
                id: {
                    $in: goodsIds
                },
                capacity: {
                    $gt: 0
                }
            }
        });

        if (goodsData.length !== goodsIds.length) {
            throw "商品已售完或已下架";
        }

        var orders = [];
        yield db.transaction(function (t) {

            return co(function *() {

                // 每个店铺的订单
                for(var shopOrderIndex = 0; shopOrderIndex < orderInfo.length; shopOrderIndex ++) {
                    var shopOrder = orderInfo[shopOrderIndex];
                    var orderItems = [];

                    var price = 0;
                    var goodsNum = 0;

                    var commission = [0, 0, 0];

                    var store = storeData.filter((item) => {
                        return item.id === shopOrder.storeId
                    })[0];

                    // 子订单
                    for(var orderItemIndex = 0; orderItemIndex < shopOrder.suborders.length; orderItemIndex ++) {

                        var buyItem = shopOrder.suborders[orderItemIndex];


                        if (type == 0) {
                            // 购物车清理操作
                            var shoppingCartItem = shoppingCart.filter((item) => {
                                return item.id === buyItem.id
                            })[0];
                            if (util.isNullOrUndefined(shoppingCartItem)) {
                                throw 'invalid op';
                            }
                            if (buyItem.num === shoppingCartItem.num) {
                                yield shoppingCartItem.destroy({transaction: t});
                            } else if (buyItem.num < shoppingCartItem.num) {
                                shoppingCartItem.num -= item.num;
                                yield shoppingCartItem.save({transaction: t});
                            } else {
                                throw "提交参数有误";
                            }
                        }

                        var buyGoods = goodsData.filter((item) => {
                            return item.id === buyItem.GoodsId
                        })[0];


                        if (!buyGoods) {
                            throw '未能锁定商品信息';
                        }

                        if (buyGoods.capacity < buyItem.num) {
                            throw "商品库存不足";
                        }

                        price += buyItem.num * buyGoods.price;
                        goodsNum += buyItem.num;

                        orderItems.push(OrderItem.build({
                            goods: JSON.stringify(buyGoods),
                            price: buyItem.num * buyGoods.price,
                            num: buyItem.num,
                            type: store ? 1 : 0,
                            SalerGoodId: store ? buyItem.SalerGoodId : null,
                            GoodId: store ? null :buyGoods.id
                        }));
                        buyGoods.capacity--;
                        buyGoods.soldNum++;
                        yield buyGoods.save({transaction: t});
                        //// 赠送积分
                        //user.integral += buyGoods.integral;
                        //user.totalIntegral += buyGoods.integral;
                        //
                        //// 佣金
                        //if (type == 1) {
                        //    commission[0] += buyGoods.commission1;
                        //    commission[1] += buyGoods.commission2;
                        //    commission[2] += buyGoods.commission3;
                        //}
                    }

                    var order = yield Order.create({
                        recieverName: address.recieverName,
                        phone: address.phone,
                        province: address.province,
                        city: address.city,
                        area: address.area,
                        address: address.address,
                        price,
                        num: orderItems.length,
                        status: 0,
                        message: shopOrder.msg ? shopOrder.msg : '',
                        UserId: userId,
                        expressWay: shopOrder.expressWay,
                        type: store ? 1 : 0,
                        StoreId: store ? store.id : null
                    }, {transaction: t});

                    for (var i in orderItems) {
                        var orderItem = orderItems[i];
                        orderItem.OrderId = order.id;
                        yield orderItem.save({transaction: t});
                    }

                    //yield user.save({transaction: t});

                    // 佣金
                    //if(type == 1 && store) {
                    //    var storesContainer = [];
                    //    store.money += commission[0];
                    //    store.totalMoney += commission[0];
                    //
                    //    storesContainer.push(store);
                    //
                    //    var secondStore = yield store.getTopStore();
                    //
                    //    if (secondStore) {
                    //        secondStore.money += commission[1];
                    //        secondStore.totalMoney += commission[1];
                    //
                    //        storesContainer.push(secondStore);
                    //
                    //        var ThirdStore = yield secondStore.getTopStore();
                    //
                    //        if (ThirdStore) {
                    //            ThirdStore.money += commission[2];
                    //            ThirdStore.totalMoney += commission[2];
                    //            storesContainer.push(ThirdStore);
                    //        }
                    //    }
                    //    for(var l = 0; l < storesContainer.length; l ++) {
                    //        yield storesContainer[l].save({transaction: t})
                    //    }
                    //}

                    orders.push(order);
                }
            }).catch((err) => {
                // todo: err
                throw err;
            });

        });

        // todo: pay
        if (orders.length === 1) {
            this.redirect('/user/order/pay?id=' + orders[0].id);
        } else {
            //todo:
            this.redirect('/user/order-list');
        }

    });

    var orderLimitNum = 5;
    router.get('/user/order-list/:status/:page', function *() {
        this.checkParams('status').notEmpty().isInt().toInt();
        this.checkParams('page').notEmpty().isInt().toInt();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var userId = (yield auth.user(this)).id;
        var order = yield Order.findAll({
            where: {
                UserId: userId,
                status: this.params.status >= 3 ? {
                    $gt: 2
                } : this.params.status
            },
            include: [OrderItem],
            offset: ( this.params.page - 1) * orderLimitNum,
            limit: orderLimitNum
        });

        this.body = yield order;
    });

    router.get('/user/order-list', function *() {
        this.body = yield render('phone/order-list', {
            title: '订单',
        });
    });

    router.post('/user/order/action', function *() {
        this.checkBody('id').notEmpty();
        this.checkBody('status').notEmpty().isInt().toInt();
        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var status = this.body.status;
        var id = this.request.body.id;
        var userId = (yield auth.user(this)).id;

        var user = yield User.findById(userId);

        if (util.isNullOrUndefined(user)){
            this.body = '用户不存在';
            return;
        }

        if (status == 10) {
            // 签收
            var order = yield order.findOne({
                where: {
                    id: id,
                    UserId: userId
                },
                include: [OrderItem, Store]
            });

            order.status = 10;
            order.recieveTime = Date.now();

            yield order.save();
            // 积分和佣金

            var stores = [];

            var commissions = [0, 0, 0];

            if (order.type == 1 && order.Store) {
                stores.push(order.Store);

                var topStore = order.Store.getTopStore();

                if (topStore) {
                    stores.push(topStore);
                }

                if (stores.length === 2){
                    topStore = topStore.getTopStore();
                    if (topStore) {
                        stores.push(topStore);
                    }
                }
            }

            for(var orderItemIndex  = 0; orderItemIndex < order.OrderItems.length; orderItemIndex ++) {
                var orderItem = order.OrderItems[orderItemIndex];
                var goods = JSON.parse(orderItem.goods);
                user.integral += goods.integral;
                user.totalIntegral += goods.integral;

                for(let storeIndex = 0; storeIndex < stores.length; storeIndex ++) {
                    commissions[storeIndex] += goods["comission" + (storeIndex + 1)];
                }

            }

            yield user.save();

            for(let storeIndex = 0; storeIndex < stores.length; storeIndex ++) {
                var store = stores[storeIndex];
                store.money += commissions[storeIndex] ;
                store.totalMoney += commissions[storeIndex] ;
                yield store.save();
            }

        } else if (status == -1) {
            // 取消
            this.body = yield Order.destroy({
                where: {
                    id: id,
                    UserId: userId
                }
            });
            // 退款
        } else if (status == -2) {
            // 退货
            this.body = yield Order.update({
                returnStatus: 1,
                returnRequestTime: Date.now()
            },{
                where: {
                    id: id,
                    UserId: userId
                }
            });
        }


    });

    router.get('/user/order/pay', function *() {
        this.body = '待绑定';
    });

};