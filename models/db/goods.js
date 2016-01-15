var sequelizex = require('../../lib/sequelizex');
var shortDataTypes = sequelizex.DataTypes;
var util = require('util');

module.exports = function (sequelize, DataTypes) {

    var Goods = sequelize.define('Goods', {
        title: shortDataTypes.String(100),
        /**
         * 主图
         */
        mainImg: shortDataTypes.String(),
        /**
         * 图片链接数组的json串
         * [url, url, url]
         */
        imgs: shortDataTypes.String(),
        /**
         * 现价
         */
        price: shortDataTypes.Double(),
        /**
         * 原价
         */
        oldPrice: shortDataTypes.Double(),
        baseSoldNum: shortDataTypes.Int(0),
        /**
         * 已售数量
         */
        soldNum: shortDataTypes.Int(),
        /**
         * 每人限购
         */
        buyLimit: shortDataTypes.Int(),
        /**
         *
         */
        //vipDiscount: shortDataTypes.Double(10),
        /**
         * 剩余量
         */
        capacity: shortDataTypes.Int(),
        content: {
            type: DataTypes.TEXT
        },
        /**
         * -1 已删除
         * 0 下架
         * 1 已上架
         */
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        /**
         * 定时下架
         */
        timeToDown: shortDataTypes.Date(),
        /**
         * 赠送积分
         */
        integral: shortDataTypes.Double(),
        /**
         * 分级佣金
         */
        commission1: shortDataTypes.Double(),
        commission2: shortDataTypes.Double(),
        commission3: shortDataTypes.Double(),
        /**
         * 扩展属性值
         */
        extraFields: shortDataTypes.Text()
    }, {
        associate: function (models) {
        },
        instanceMethods: {
        },
        classMethods: {
        },
        getterMethods: {
            compoundSoldNum:()  => {
                return this.baseSoldNum + this.soldNum;
            }
        }
    });

    var GoodsShortcutView = sequelize.define('GoodsShortcutView', {
        title: shortDataTypes.String(100),
        /**
         * 主图
         */
        mainImg: shortDataTypes.String(),
        /**
         * 现价
         */
        price: shortDataTypes.Double(),
        /**
         * 原价
         */
        oldPrice: shortDataTypes.Double(),
        compoundSoldNum: shortDataTypes.Int(0),
        /**
         *
         */
        //vipDiscount: shortDataTypes.Double(10),
        /**
         * 剩余量
         */
        capacity: shortDataTypes.Int(),
        /**
         * -1 已删除
         * 0 下架
         * 1 已上架
         */
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        /**
         * 赠送积分
         */
        integral: shortDataTypes.Double(),
        /**
         * 分级佣金
         */
        //commission1: shortDataTypes.Double(),
        //commission2: shortDataTypes.Double(),
        //commission3: shortDataTypes.Double(),
        createdAt: shortDataTypes.Date()
    }, {
        timestamps: false,
        associate: function (models) {
        },
        instanceMethods: {
        },
        classMethods: {
        },
        getterMethods: {
            compoundSoldNum:()  => {
                return this.baseSoldNum + this.soldNum;
            }
        }
    });

    return Goods;
};

