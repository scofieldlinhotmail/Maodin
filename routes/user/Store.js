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
var GoodsShortcutView = db.models.GoodsShortcutView;
var Slideshow = db.models.Slideshow;
var Goods = db.models.Goods;

var User = db.models.User;
module.exports = (router) => {

    router.get('/user-store/apply', function *() {
        var upstore = this.query.id;

        this.body = yield render('phone/storeapply.html', {
            upstore
        });

    });

    router.post('/user-store/apply', function *() {
        var body = this.request.body;
        debug(body);
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

        if (body.upstore == "") {
            yield Store.create({
                name: body.username + "的店铺",
                username: body.username,
                phone: body.phone,
                UserId: user.id
            });
        } else {
            yield Store.create({
                name: body.username + "的店铺",
                username: body.username,
                phone: body.phone,
                UserId: user.id,
                StoreId: body.upstore
            });
        }

        this.redirect('/user-wait');
    });
    router.get('/user-store/home', function *() {
        var id = (yield auth.user(this)).id;
        var s = yield Store.findOne({
            where: {
                id: id,
            },
            include: [User]
        });
        this.body = yield render('phone/storehome.html', {
            s
        });
    });

    router.get('/user-store/redirect', function *() {
        var id = this.query.id;

        var user = yield auth.user(this);

        this.redirect('/user-store/index?id=' + user.id);

    });

    router.get('/user-store/group', function *() {
        var id = this.query.id;
        var list = yield Store.findAll({
            where: {
                StoreId: id
            },
            include: [User]
        });
        debug(list);
        this.body = yield render('phone/group.html', {
            list,
            title: "我的团队"
        });
    });
    router.get('/user-store/index', function *() {
        var id = this.query.id; //店铺id
        if (id) {
            var s = yield Store.findOne({
                where: {
                    id: id,
                },
                include: [User]
            });
        }

        var pros = yield GoodsShortcutView.findAll({limit: 10, order: 'compoundSoldNum DESC'});
        var imgs = yield Slideshow.findAll();
        var ps = yield Goods.findAll();
        var pcount = ps.length;
        this.body = yield render('phone/storeindex.html', {
            s, pros, imgs, noHeaderTpl: true, pcount
        });
    });


    router.get('/adminer-store/check', function *() {

        var key = this.query.key;
        var list = yield Store.findAll({
            where: {
                status: 0
            }
        });
        if (key != null) {
            list = yield Store.findAll({
                where: {
                    username: {$like: '%' + key + '%'},
                    status: 0
                }
            })
        }
        var page = this.query.page;
        ///每页几个
        var pre = 10;
        var preurl = "#";
        var nexturl = "#";
        if (page == null) {
            page = 1;
        } else if (page > 1) {
            var prepage = Number(page) - 1;
            preurl = changeURLPar(this.url, "page", prepage);
        }
        var l = list.length;
        var next;
        if (page * pre < l) {
            list = list.slice((page - 1) * pre, (page - 1) * pre + pre);
            next = Number(page) + 1;
            nexturl = changeURLPar(this.url, "page", next);
        } else if (page * pre == l) {
            list = list.slice((page - 1) * pre, (page - 1) * pre + pre);
            next = 0;
        } else {
            list = list.slice((page - 1) * pre);
            next = 0;
        }

        var allpage = ((l % pre == 0) ? (l / pre) : (l / pre + 1));
        this

        this.body = yield render('admin/storecheck.html', {
            preurl, nexturl, list, page, next, allpage
        });
    });
    router.get('/adminer-store/ChangeOneS', function *() {
        var id = this.query.id;
        var s = this.query.s;
        yield cstatus(id, s);
        this.body = 1;
    });
    router.get('/adminer-store/ChangeManyS', function *() {
        var ids = JSON.parse(this.query.list);
        var s = this.query.s;

        for (var i = 0; i < ids.length; i++) {
            yield cstatus(ids[i], s);
        }
        this.body = 1;
    });


    ///拒绝或通过
    function * cstatus(id, s) {
        debug(id);
        var one = yield Store.findById(id);
        if (one != null) {
            if (s == 1) {
                one.status = s;
                yield one.save();
            } else {
                one.destroy();
            }
        }
    }

};
function changeURLPar(destiny, par, par_value) {
    var pattern = par + '=([^&]*)';
    var replaceText = par + '=' + par_value;
    if (destiny.match(pattern)) {
        var tmp = '/\\' + par + '=[^&]*/';
        tmp = destiny.replace(eval(tmp), replaceText);
        return (tmp);
    }
    else {
        if (destiny.match('[\?]')) {
            return destiny + '&' + replaceText;
        }
        else {
            return destiny + '?' + replaceText;
        }
    }
    return destiny + '\n' + par + '\n' + par_value;
}