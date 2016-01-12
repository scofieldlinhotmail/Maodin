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
        status:shortDataTypes.Int(),
        money:shortDataTypes.Int(),//佣金
    }, {
        timestamps: true,
        paranoid: true,
        associate: function (models) {
            models.User.hasOne(models.Store);
            models.Store.belongsTo(models.User);
        },
        instanceMethods: {
        },
        classMethods: {
        }
    });

    return Store;
};
