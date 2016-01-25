var db = require('../models/db');

var Goods = db.models.Goods;

var autoDown = function *() {

    yield Goods.update({
        deletedAt: Date.now(),
        timeToDown: null
    }, {
        where: {
            timeToDown: {
                $lte: new Date()
            }
        },
        paranoid: false
    });

};

module.exports = function * () {

    return yield autoDown();

};
