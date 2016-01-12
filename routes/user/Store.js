var Sequelize = require('sequelize');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

var sequelizex = require('../../lib/sequelizex.js');


var Store = db.models.Store;
var GoodsType = db.models.GoodsType;
var ShoppingCart = db.models.ShoppingCart;
var GoodsCollection = db.models.GoodsCollection;

module.exports = (router) => {

    router.get('/user-store/apply',  function *() {
        this.body = yield render('phone/storeapply.html', {
        });
    });
    router.post('user-store/apply', function *() {
        var body = this.request.body;
        this.checkBody('name').notEmpty();
        this.checkBody('phone').notEmpty().match(/^1[3-8]+\d{9}$/);
        this.checkBody('username').notEmpty();
        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var user = yield auth.user(this);
        if (!user) {
            this.redirect('/wechat/login');
            return;
        }

        yield Store.create({
            name:body.username+"的店铺",
            username:body.username,
            phone:body.phone
        });
        this.redirect('/user-wait');
    });


};