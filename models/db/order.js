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
         * 3 => 已签收
         *
         * -1 => 已取消
         */
        status: shortDataTypes.Int(),
        /**
         * 留言
         */
        message: shortDataTypes.String(),
        payTime: shortDataTypes.Date(null),
        sendTime: shortDataTypes.Date(null),
        recieveTime: shortDataTypes.Date(null),
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

