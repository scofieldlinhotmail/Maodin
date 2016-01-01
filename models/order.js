var sequelizex = require('../lib/sequelizex');
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
        fare: shortDataTypes.Double(),
        num: shortDataTypes.Int(),
        /**
         * 0 => 新建订单
         * 1 => 已支付
         * 2 => 已发货
         * 3 => 已签收
         * -1 => 已取消
         */
        status: shortDataTypes.Int(),
        /**
         * 留言
         */
        message: shortDataTypes.String(),
        payTime: shortDataTypes.Date(),
        sendTime: shortDataTypes.Date(),
        recieveTime: shortDataTypes.Date(),
        prepayId: shortDataTypes.String(64, true)
    }, {
        associate: function (models) {
            models.User.hasMany(models.Order);
            models.Order.belongsTo(models.User);
            models.Area.hasMany(models.Order);
            models.Order.belongsTo(models.Area);
        },
        instanceMethods: {
        },
        classMethods: {
        }
    });

    return Order;
};

