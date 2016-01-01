var sequelizex = require('../lib/sequelizex');
var shortDataTypes = sequelizex.DataTypes;

module.exports = function (sequelize, DataTypes) {

    return sequelize.define('Adminer', {
        /**
         * 登录名，不可重复
         */
        nickname: shortDataTypes.String(),
        /***
         * 真实姓名
         */
        name: shortDataTypes.String(),
        password: shortDataTypes.String(),
        phone: shortDataTypes.Phone(),
        status: shortDataTypes.Int(),
        /**
         * 管理员类型
         */
        type: shortDataTypes.Int()
    }, {
        timestamps: false,
        associate: function (models) {
        },
        instanceMethods: {},
        classMethods: {}
    });
};

