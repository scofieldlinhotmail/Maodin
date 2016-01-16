/**
 * Created by lxc on 15-12-19.
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
    router.get('/user-comment/comment',  function *() {
        var id= this.query.id;
        var save=0;
        this.body = yield render('phone/Evaluation', {
            id,save
        });
    });

    router.get('/user-comment/add',  function *() {

        debug(this.query);
        this.checkQuery('text').empty().trim().toLow();
        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var Good=yield  Goods.findById(this.query.id);


        yield Comment.create({
            score:this.score,
            message: this.query.text,
            GoodId: this.query.id,
            UserId:(yield auth.user(this)).id
        });

        var save=1;
        this.redirect('/user/order-list');
    });




};