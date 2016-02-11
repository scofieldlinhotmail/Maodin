/**
 * Created by lxc on 16-1-20.
 */
var Sequelize = require('sequelize');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

var sequelizex = require('../../lib/sequelizex.js');


var Store = db.models.Store;
var User = db.models.User;
var Favorite = db.models.Favorite;
module.exports = (router) => {

    router.get('/user-favorite/toggle', function*() {
        var user = yield auth.user(this);
        var storeid = this.query.storeid;
        var action = this.query.action;
        if (action == 'add') {
            var store = yield Store.findById(storeid);
            if (store) {
                var isExisted = yield Favorite.count({
                    where: {
                        UserId: user.id,
                        StoreId: storeid
                    }
                });
                if (!isExisted) {
                    yield Favorite.create({
                        UserId: user.id,
                        StoreId: storeid
                    })
                }
            }
        } else {
            yield Favorite.destroy({
                where: {
                    UserId: user.id,
                    StoreId: storeid
                }
            });
        }

        this.body = 'ok';
    });

    router.get('/user-favorite/list', function*() {
        var user = yield auth.user(this);
        //var user=yield User.findOne();

        var list = yield Favorite.findAll({
            where: {
                UserId: user.id,
            },
            include: {
                model: Store,
                include: User
            }
        });
        this.body = yield render('phone/favorite.html', {
            list, title: "我的收藏"
        });
    });
};
