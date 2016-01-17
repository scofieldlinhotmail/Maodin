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
        },
        classMethods: {
        }
    });

    return Order;
};

