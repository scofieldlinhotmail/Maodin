var sequelizex = require('../../lib/sequelizex');
var shortDataTypes = sequelizex.DataTypes;

module.exports = function (sequelize, DataTypes) {

    var GoodsCollection = sequelize.define('GoodsCollection', {
        /**
         * 添加类型
         * 0 => 系统自动添加
         * 1 => 用户手动添加
         * 2 => 分销商品
         */
        type: shortDataTypes.Int()
    }, {
        associate: function (models) {
            models.User.hasMany(models.GoodsCollection);
            models.GoodsCollection.belongsTo(models.User);
            models.GoodsCollection.belongsTo(models.Goods);
            models.GoodsCollection.belongsTo(models.SalerGoods);
        },
        classMethods: {
            isCollected: function *(goodsId, userId, type) {
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
                return (yield this.count(condition)) != 0;
            }
        }
    });

    return GoodsCollection;
};

