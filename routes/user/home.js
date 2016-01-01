var Sequelize = require('sequelize');

var auth = require('../../helpers/auth.js');
var db = require('../../models/index.js');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

var GoodsType = db.models.GoodsType;

module.exports = (router) => {

    router.get('/user/index',  function *() {
        var types = yield GoodsType.findAll({
            where: {
                type: 1
            },
            attributes: ['title', 'type', 'id'],
            include: [GoodsType]
        });

        this.body = yield render('phone/index.html', {
            types: JSON.stringify(types)
        });
    });

    router.get('/user/center',  function *() {

        this.body = yield render('phone/user.html', {
            user: yield auth.user(this),
            title: '个人中心'
        });
    });

    //router.get('/all-ltype', function *() {
    //    var types = yield GoodsType.allLtype();
    //    this.body = types;
    //});

};