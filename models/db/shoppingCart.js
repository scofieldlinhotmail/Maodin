var sequelizex = require('../../lib/sequelizex');
var shortDataTypes = sequelizex.DataTypes;

module.exports = function (sequelize, DataTypes) {

    var ShoppingCart = sequelize.define('ShoppingCart', {
        num: shortDataTypes.Int(),
        /**
         * 0 => 普通商品
         * 1 => 分销商品
         */
        type: shortDataTypes.Int(),
    }, {
        associate: function (models) {
            models.User.hasMany(models.ShoppingCart);
            models.ShoppingCart.belongsTo(models.User);
            models.ShoppingCart.belongsTo(models.Goods);
            models.ShoppingCart.belongsTo(models.SalerGoods);
        },
        instanceMethods: {
        },
        classMethods: {
            my: function *(id) {
                return sequelizex.Func.val(yield ShoppingCart.findAll({
                    where: {
                        UserId: id
                    },
                    attributes: ['id', 'num', 'GoodId']
                }));
            },
            num: function *(goodsId, userId, type) {
                var condition = {
                    where: {
                        UserId: userId,
                        type: type
                    }
                };
                if (type == 0) {
                    condition.where.GoodId = goodsId;
                } else {
                    condition.where.SalerGoodId = goodsId;

                }
                return yield this.count(condition);
            }
        }
    });

    return ShoppingCart;
};

