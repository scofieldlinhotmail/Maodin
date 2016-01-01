/**
 * Created by lxc on 15-12-20.
 */
///分配业务员
var util = require('util');
var auth = require('../../helpers/auth.js');
var db = require('../../models/index.js');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

module.exports = (router) => {

    var User = db.models.User;

    router.get('/adminer/assign', function *() {
        var u = yield User.findAll({
            where:{
                AdminerId:null
            }
        });
        debug(u);
        this.body = yield render('admin/assignuser', {
            u
        });
    });



};