
var co = require('co');
var db = require('../models/db');


co(function *() {
    var data = yield db.models.GoodsShortcutView.findAll({
        order: 'compoundSoldNum DESC'
    });
    console.log(data);
}).catch((err) => console.log(err));
