var sequelizex = require('../../lib/sequelizex');
var shortDataTypes = sequelizex.DataTypes;

module.exports = function (sequelize, DataTypes) {

    var Order = sequelize.define('Order', {
        /**
         * address 对象json
         */
        recieverName: shortDataTypes.String(),
        phone: shortDataTypes.Phone(),
        province: shortDataTypes.String(),
        city: shortDataTypes.String(),
        area: shortDataTypes.String(),
        address: shortDataTypes.String(),
        price: shortDataTypes.Double(),
        num: shortDataTypes.Int(),
        goodsNum: shortDataTypes.Int(),
        /**
         * 0 => 包邮
         * 1 => 自取
         */
        expressWay: shortDataTypes.Int(),
        /**
         * -2 => 過期取消
         * -1 => 手動取消
         * 0 => 新建订单
         * 1 => 已支付
         * 2 => 已发货
         * 4 => 退货中
         * 10 => 完成
         * 11 => 已评价
         *
         */
        status: shortDataTypes.Int(),
        /**
         * 0 => 未退货
         * 1 => 申请退货
         * 2 => 退货中
         * 3 => 退货完成
         */
        returnStatus: shortDataTypes.Int(),
        /**
         * 留言
         */
        message: shortDataTypes.String(),
        payTime: shortDataTypes.Date(null),
        sendTime: shortDataTypes.Date(null),
        recieveTime: shortDataTypes.Date(null),
        returnRequestTime:  shortDataTypes.Date(null),
        returnTime: shortDataTypes.Date(null),
        prepayId: shortDataTypes.String(64, true),
        /**
         * 0 => 本店
         * 1 => 分销
         */
        type: shortDataTypes.Int()
    }, {
        paranoid: true,
        associate: function (models) {
            models.User.hasMany(models.Order);
            models.Order.belongsTo(models.User);
            models.Store.hasMany(models.Order);
            models.Order.belongsTo(models.Store);
        },
        instanceMethods: {
            receive: function *() {
                var order = this;

                order.status = 10;
                order.recieveTime = Date.now();

                if (!order.OrderItems ){
                    order.OrderItems = order.getOrderItems();

                }
                if (!order.Store ){
                    order.Store = order.getStore();
                }
                if (!order.User ){
                    order.User = order.getUser();
                }



                yield order.save();
                // 积分和佣金

                var stores = [];

                var commissions = [0, 0, 0];

                if (order.type == 1 && order.Store) {
                    stores.push(order.Store);

                    var topStore = yield order.Store.getTopStore();

                    if (topStore) {
                        stores.push(topStore);
                    }

                    if (stores.length === 2){
                        topStore = yield topStore.getTopStore();
                        if (topStore) {
                            stores.push(topStore);
                        }
                    }
                }

                for(var orderItemIndex  = 0; orderItemIndex < order.OrderItems.length; orderItemIndex ++) {
                    var orderItem = order.OrderItems[orderItemIndex];
                    var goods = JSON.parse(orderItem.goods);
                    order.User.integral += goods.integral;
                    order.User.totalIntegral += goods.integral;

                    for(var storeIndex = 0; storeIndex < stores.length; storeIndex ++) {
                        commissions[storeIndex] += goods["commission" + (storeIndex + 1)];
                    }

                }

                yield order.User.save();

                for(var storeIndex = 0; storeIndex < stores.length; storeIndex ++) {
                    var store = stores[storeIndex];
                    store.money += commissions[storeIndex];
                    store.totalMoney += commissions[storeIndex];
                    yield store.save();
                }
            }
        },
        classMethods: {
        }
    });

    return Order;
};

