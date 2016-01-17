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
    var Order = db.models.Order;
    var OrderItem = db.models.OrderItem;
    router.get('/user-comment/comment',  function *() {
        var id= this.query.id;
        var save=0;
        var order=yield Order.findOne({
            where:{
                id:id,
            },
            include:[OrderItem]
        });

        for(var j in order.OrderItems) {
            order.OrderItems[j].goods = JSON.parse(order.OrderItems[j].goods);
        }

        this.body = yield render('phone/Evaluation', {
            id,save,order
        });
    });

    router.get('/user-comment/add',  function *() {

        debug(this.query);
        this.checkQuery('text').empty().trim().toLow();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        yield Comment.create({
            score:this.query.score,
            message: this.query.message,
            GoodId: this.query.GoodId,
            UserId:(yield auth.user(this)).id
        });

        var save=1;
        this.redirect('/user/order-list');
    });





};