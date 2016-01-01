var sequelizex = require('../lib/sequelizex');
var shortDataTypes = sequelizex.DataTypes;

module.exports = function (sequelize, DataTypes) {

    var ShoppingCart = sequelize.define('ShoppingCart', {
        num: shortDataTypes.Int(),
    }, {
        timestamps: false,
        associate: function (models) {
            models.User.hasMany(models.ShoppingCart);
            models.ShoppingCart.belongsTo(models.User);
            models.ShoppingCart.belongsTo(models.Goods);
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
            }
        }
    });

    return ShoppingCart;
};

