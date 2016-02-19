var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var util = require('util');

module.exports = (router) => {

    var DeliverAddress = db.models.DeliverAddress;
    var User = db.models.User;
    var Rank = db.models.Rank;

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

        var ids = `(${body.id.join(',')})`;

        this.body = (yield db.query(`update Users set integral = integral + ${body.integralReward}, totalIntegral = totalIntegral + ${body.integralReward} where id in ${ids}`)).affectedRows;

        //user.integral += body.integralReward;
        //user.totalIntegral += body.integralReward;
        //
        //this.body = yield user.save();

    });

    router.get('/adminer-adminer/user-data',  function *() {

        var users = yield User.findAll();

        var ranks = yield Rank.findAll();

        users.forEach((user, index, userSrc) => {
            var userRank = ranks.filter((rank) => {
                return rank.min >= user.totalIntegral && rank.max >= user.totalIntegral;
            });
            if (userRank.length !== 0) {
                userSrc[index].dataValues.rank = userRank[0].name;
            }
        });

        this.body = users;

    });

};
