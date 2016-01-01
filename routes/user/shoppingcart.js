var auth = require('../../helpers/auth.js');
var db = require('../../models/index.js');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

var sequelizex = require('../../lib/sequelizex.js');

var ShoppingCart = db.models.ShoppingCart;


module.exports = (router) => {

    router.get('/user/shoppingcart/:id/:num', function *() {
        this.checkParams('id').notEmpty().isInt().toInt();
        this.checkParams('num').notEmpty().isInt().toInt();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var shoppingCart = yield ShoppingCart.findOne({
            where:{
                UserId: (yield auth.user(this)).id,
                GoodId: this.params.id
            }
        });
        if (shoppingCart) {
            if (this.params.num >= 0 ) {
                shoppingCart.num = this.params.num;
                yield shoppingCart.save();
            } else {
                yield shoppingCart.destroy();
            }
        } else if (this.params.num >= 0){
            yield ShoppingCart.create({
                UserId: (yield auth.user(this)).id,
                GoodId: this.params.id,
                num: this.params.num
            });
        }
        this.body = 'ok';
    });

    router.get('/user/shoppingcart', function *() {
        this.body = sequelizex.Func.val(yield ShoppingCart.findAll({
            where: {
                UserId: (yield auth.user(this)).id
            },
            attributes: ['id', 'num', 'GoodId']
        }));
    });

    router.get('/user/shoppingcart-view', function *() {

        var shoppingCart = yield sequelizex.Func.val(yield ShoppingCart.findAll({
            where: {
                UserId: (yield auth.user(this)).id
            },
            attributes: ['id', 'num', 'GoodId'],
            include: [{
                model: db.models.Goods,
                attributes: {
                    exclude: ['content']
                }
            }]
        }));
        this.body = yield render('phone/shoppingCart.html', {
            title: '购物车',
            shoppingCart: JSON.stringify(shoppingCart)
        });
    });

};