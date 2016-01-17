/**
 * Created by lxc on 16-1-16.
 */

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug');
var sequelize = require('sequelize');




module.exports = (router) => {
    var Slideshow = db.models.Slideshow;
    router.get('/adminer-slideshow/index',  function *() {
        var list=yield Slideshow.findAll();
        debug(list);
        this.body = yield render('admin/slideshow', {
            list
        });
    });






};