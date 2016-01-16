/**
 * Created by lxc on 16-1-12.
 */
var sequelizex = require('../../lib/sequelizex');
var shortDataTypes = sequelizex.DataTypes;
var util = require('util');

module.exports = function (sequelize, DataTypes) {

    var Store = sequelize.define('Store', {

        username: shortDataTypes.String(),

        name: shortDataTypes.String(),//店铺名称

        phone: shortDataTypes.Phone(true),

        //0未审核
        //1通过
        status:shortDataTypes.Int(),

        money:shortDataTypes.Double(),//佣金

        totalMoney: shortDataTypes.Double()
    }, {
        timestamps: true,
        paranoid: true,
        associate: function (models) {
            models.User.hasOne(models.Store);
            models.Store.belongsTo(models.User);
            models.Store.hasMany(models.Store);
            models.Store.belongsTo(models.Store, {as: 'TopStore', foreignKey: 'StoreId', constraints: false});
        },
        instanceMethods: {
        },
        classMethods: {
        }
    });

    return Store;
};
