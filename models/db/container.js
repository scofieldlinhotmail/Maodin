var sequelizex = require('../../lib/sequelizex');
var shortDataTypes = sequelizex.DataTypes;
var util = require('util');

module.exports = function (sequelize, DataTypes) {

    var Container = sequelize.define('Container', {
        key: shortDataTypes.String(),
        value: shortDataTypes.String(),
        status: shortDataTypes.Int()
    }, {
        associate: function (models) {
        },
        instanceMethods: {
        },
        classMethods: {
            fare: function *(value) {
                var fare;
                if(util.isNullOrUndefined(value)) {
                    fare =  yield this.findOne({
                        where: {
                            key: 'fare'
                        }
                    });
                    return util.isNullOrUndefined(fare) ? null : JSON.parse(fare.value);
                } else {
                    fare = yield this.fare();
                    if (util.isNullOrUndefined(fare)) {
                        return yield this.create({
                            key: 'fare',
                            value: JSON.stringify(value)
                        });
                    } else {
                        fare.value = JSON.stringify(value);
                        return yield fare.save();
                    }
                }
            },
            ///未付款订单自动过期时间(分钟)
            overduetime: function *(value) {
                var overduetime;
                if(util.isNullOrUndefined(value)) {
                    overduetime =  yield this.findOne({
                        where: {
                            key: 'overduetime'
                        }
                    });
                    return util.isNullOrUndefined(overduetime) ? null : (overduetime.value);
                } else {
                    overduetime = yield this.overduetime();
                    if (util.isNullOrUndefined(overduetime)) {
                        return yield this.create({
                            key: 'overduetime',
                            value: (value)
                        });
                    } else {
                        overduetime.value = (value);
                        return yield overduetime.save();
                    }
                }
            },
            ///未付款订单自动过期时间(天)
            autoaccepttime: function *(value) {
                var autoaccepttime;
                if(util.isNullOrUndefined(value)) {
                    autoaccepttime =  yield this.findOne({
                        where: {
                            key: 'autoaccepttime'
                        }
                    });
                    return util.isNullOrUndefined(autoaccepttime) ? null : (autoaccepttime.value);
                } else {
                    autoaccepttime = yield this.autoaccepttime();
                    if (util.isNullOrUndefined(autoaccepttime)) {
                        return yield this.create({
                            key: 'autoaccepttime',
                            value: (value)
                        });
                    } else {
                        autoaccepttime.value = (value);
                        return yield autoaccepttime.save();
                    }
                }
            },
            ///extend允许用户延长收货时间(天)
            extendaccepttime: function *(value) {
                var extendaccepttime;
                if(util.isNullOrUndefined(value)) {
                    extendaccepttime =  yield this.findOne({
                        where: {
                            key: 'extendaccepttime'
                        }
                    });
                    return util.isNullOrUndefined(extendaccepttime) ? null :(extendaccepttime.value);
                } else {
                    extendaccepttime = yield this.extendaccepttime();
                    if (util.isNullOrUndefined(extendaccepttime)) {
                        return yield this.create({
                            key: 'extendaccepttime',
                            value:(value)
                        });
                    } else {
                        extendaccepttime.value = (value);
                        return yield extendaccepttime.save();
                    }
                }
            }
        }
    });

    return Container;
};

