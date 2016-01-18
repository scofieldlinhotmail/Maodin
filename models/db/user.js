var sequelizex = require('../../lib/sequelizex');
var shortDataTypes = sequelizex.DataTypes;

module.exports = function (sequelize, DataTypes) {

	var User = sequelize.define('User', {
        nickname: shortDataTypes.String(),
		headimgurl: shortDataTypes.Url(),
		sex: shortDataTypes.Int(),
        openid: shortDataTypes.String(),
        joinTime: shortDataTypes.Date(),
		subscribe_time: shortDataTypes.Date(),
		unionid: shortDataTypes.String(),
		totalIntegral: shortDataTypes.Double(),
		integral: shortDataTypes.Double(),
		/**
		 */
        status: {
			type: DataTypes.INTEGER,
			defaultValue: 0
		}
	}, {
        timestamps: false,
		associate: function (models) {
			models.Adminer.hasMany(models.User);
			models.User.belongsTo(models.Adminer);
		},
		instanceMethods: {
		},
		classMethods: {
		}
	});

	return User;
};

