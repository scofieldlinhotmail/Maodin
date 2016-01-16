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
        type: shortDataTypes.Int(),
        GoodId: shortDataTypes.Int()
    }, {
        timestamps: false,
        associate: function (models) {
            models.User.hasMany(models.GoodsCollection);
            models.GoodsCollection.belongsTo(models.User);
        },
        instanceMethods: {
        },
        classMethods: {
            /**
             * 收藏
             * @param userId
             * @param goodsId
             * @param isAuto 是否为自动收藏
             */
            collect: function * (userId, goodsId, isAuto) {
                yield GoodsCollection.create({
                    UserId: userId,
                    GoodId: goodsId,
                    type: isAuto ? 0 : 1
                });
            }
        }
    });

    return GoodsCollection;
};

