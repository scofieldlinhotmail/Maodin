var Sequelize = require('sequelize');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

var sequelizex = require('../../lib/sequelizex.js');

var User = db.models.User;
var Area = db.models.Area;
var DeliverAddress = db.models.DeliverAddress;


module.exports = (router) => {

    router.get('/user-register',  function *() {
        this.body = yield render('phone/register', {
        });
    });

    router.post('/user-register', function *() {
        var body = this.request.body;
        var ctx = this;
        this.checkBody('name').notEmpty();
        this.checkBody('phone').notEmpty().match(/^1[3-8]+\d{9}$/);
        this.checkBody('address').notEmpty();
        this.checkBody('province').notEmpty();
        this.checkBody('city').notEmpty();
        this.checkBody('country').notEmpty();
        this.checkBody('area').notEmpty();
        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var user = yield auth.user(this);
        if (!user) {
            this.redirect('/wechat/login');
            return;
        }

        user = yield User.findById(user.id);

        user.name= body.name;
        user.phone= body.phone;
        user.name= body.name;
        user.status = -1;
        yield user.save();
        yield DeliverAddress.create({
            address: body.address,
            province: body.province,
            city: body.city,
            area: body.country,
            AreaId: body.area,
            isDefault: true,
            recieverName: body.name,
            phone: body.phone,
            UserId: user.id
        });
        auth.login(this, user);
        this.redirect('/user-wait');
    });

    router.get('/user-wait', function *() {
        this.body = yield render('/phone/alert', {
            content: '正在等待后台审核，请等候...'
        });
    });

};