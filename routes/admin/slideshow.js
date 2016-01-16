/**
 * Created by lxc on 16-1-16.
 */

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug');
var sequelize = require('sequelize');




module.exports = (router) => {
    var Comment = db.models.Comment;
    var User= db.models.User;
    var Goods = db.models.Goods;
    router.get('/adminer-slideshow/index',  function *() {
        this.body = yield render('admin/slideshow', {
        });
    });






};