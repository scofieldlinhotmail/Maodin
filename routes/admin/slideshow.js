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
    router.get('/adminer-slideshow/add',  function *() {
        this.checkQuery('img').empty().trim().toLow();
        this.checkQuery('link').empty().trim().toLow();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var img=this.query.img;
        var link=this.query.link;
        var x=yield Slideshow.create({
            link:link,
            address:img
        });
        this.body = x.id;
    });
    router.get('/adminer-slideshow/del',  function *() {
        this.checkQuery('id').empty().trim().toLow();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var delone=yield Slideshow.findById(this.query.id);
        if(delone!=null)
        delone.destroy();
        this.body = 1;
    });






};