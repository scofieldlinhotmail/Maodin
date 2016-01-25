var db = require('../models/db');

var Container = db.models.Container;
var Order = db.models.Order;

var autoCancel = function *() {

    var overduetimMinutes = parseInt(yield Container.overduetime());
    //
    var overduetime = new Date();
    overduetime.setMinutes(overduetime.getMinutes() - overduetimMinutes);

    yield Order.update({
        status: -2
    }, {
        where: {
            createAt: {
                $lgt: overduetime
            },
            status: 0
        }
    });

};

var autoRecieve = function *() {

    var autoaccepttimeDays = parseInt(yield Container.autoaccepttime());

    var autoaccepttime = new Date();
    autoaccepttime.setDate(autoaccepttime.getDate() - autoaccepttimeDays);

    var orders = yield Order.findAll({
        where: {
            status: 2,
            returnStatus: 0
        },
        include: [db.models.OrderItem, db.models.User, db.models.Store]
    });

    for(var i = 0; i < orders.length; i ++) {
        yield orders.receive();
    }

};

module.exports = function * () {


    return yield [
        autoCancel(),
        autoRecieve()
    ];

};
