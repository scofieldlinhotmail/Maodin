
var co = require('co');
var db = require('../models/db');


co(function *() {
    var data = yield db.models.Store.findOne({
        where: {
            id: 2
        }
    });
    console.log(data);
    var top = yield data.getTopStore();
    console.log(top.name);
}).catch((err) => console.log(err));
