var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var util = require('util');

module.exports = (router) => {

    var DeliverAddress = db.models.DeliverAddress;
    var User = db.models.User;

    router.get('/adminer-adminer/user-list',  function *() {
        this.body = yield render('admin/user-list.html');
    });

    //router.post('/adminer-adminer/user-admin-action', function *() {
    //
    //    this.checkBody('id').notEmpty();
    //    this.checkBody('status').notEmpty();
    //
    //    var body = this.request.body;
    //    if (this.errors) {
    //        this.body = this.errors;
    //        return;
    //    }
    //
    //    var status = body.status;
    //    if (status == 1) {
    //        yield User.update({
    //            status: 1
    //        }, {
    //            where: {
    //                id: body.id
    //            }
    //        });
    //    } else if (status == -3) {
    //        yield DeliverAddress.destroy({
    //            where: {
    //                UserId: body.id
    //            }
    //        });
    //        yield User.destroy({
    //            where: {
    //                id: body.id
    //            }
    //        });
    //    }
    //
    //    this.body = {
    //        status: true
    //    };
    //
    //});

    router.post('/adminer-adminer/user-integral-reward', function *() {
        this.checkBody('id').notEmpty();
        this.checkBody('integralReward').notEmpty().isInt().gt(0).toInt();

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var body = this.request.body;
        var user = yield User.findById(body.id)

        if(util.isNullOrUndefined(user)) {
            this.body = 'invalid id';
            return;
        }

        user.integral += body.integralReward;
        user.totalIntegral += body.integralReward;

        this.body = yield user.save();

    });

    router.get('/adminer-adminer/user-data',  function *() {

        this.body = yield User.findAll();

    });

};