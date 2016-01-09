var Sequelize = require('sequelize');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

var sequelizex = require('../../lib/sequelizex.js');


var Msg = db.models.Msg;


module.exports = (router) => {

    router.get('/user/msgCount',  function *() {
        this.body = yield Msg.myCount((yield auth.user(this)).id);
    });

    router.get('/user/msg', function *() {
        this.body = 'hello';
    });

};