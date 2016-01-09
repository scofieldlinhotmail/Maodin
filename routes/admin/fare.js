/**
 * Created by lxc on 15-12-10.
 */
var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

module.exports = (router) => {

    var Container = db.models.Container;

    router.get('/adminer/fare',  function *() {
        var fare = yield Container.fare();
        this.body = yield render('admin/fare', {
            fare: fare
        });
    });

    router.post('/adminer/fare',  function *() {

        this.checkBody('basicFare').notEmpty().isFloat().toFloat();
        this.checkBody('basicFare').notEmpty().isFloat().toFloat();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var body=this.request.body;
        yield Container.fare({
            basicFare: body.basicFare,
            freeLine: body.freeLine
        });

        this.redirect('/adminer/fare');
    });

};