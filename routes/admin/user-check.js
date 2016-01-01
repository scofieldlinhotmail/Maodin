var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/index.js');
var render = require('../../instances/render.js');

module.exports = (router) => {

    var DeliverAddress = db.models.DeliverAddress;
    var User = db.models.User;

    router.get('/adminer/user-list',  function *() {
        this.body = yield render('admin/user-list.html');
    });

    router.post('/adminer/user-admin-action', function *() {

        this.checkBody('id').notEmpty();
        this.checkBody('status').notEmpty();

        var body = this.request.body;
        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var status = body.status;
        if (status == 1) {
            yield User.update({
                status: 1
            }, {
                where: {
                    id: body.id
                }
            });
        } else if (status == -3) {
            yield DeliverAddress.destroy({
                where: {
                    UserId: body.id
                }
            });
            yield User.destroy({
                where: {
                    id: body.id
                }
            });
        }

        this.body = {
            status: true
        };

    });

    router.get('/adminer/user-admin/:status',  function *() {

        this.checkParams('status').notEmpty().isInt().toInt();
        if(this.errors) {
            this.body = this.errors;
            return;
        }
        var conditions = {
            where: {
                status: this.params.status
            },
            attributes: ['id', 'name', 'nickname', 'phone', 'joinTime', 'status']
        };
        var user = yield auth.user(this);
        // 业务员
        if (user.type != 100 && user.type != 1 && user.type != 3) {
            this.body = [];
            return;
        }
        if (user.type == 3) {
            conditions.where.AdminerId = user.id;
        }
        this.body = yield User.findAll(conditions);

    });

};