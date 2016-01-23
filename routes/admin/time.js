/**
 * Created by lxc on 16-1-23.
 */

var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

var Container = db.models.Container;
module.exports = (router) => {


    router.get('/adminer-time/index',  function *() {

        var overduetime =  yield Container.findOne({
            where: {
                key: 'overduetime'
            }
        });
        var autoaccepttime =  yield Container.findOne({
            where: {
                key: 'autoaccepttime'
            }
        });
        var extendaccepttime =  yield Container.findOne({
            where: {
                key: 'extendaccepttime'
            }
        });

        this.body = yield render('admin/time', {
            overduetime,autoaccepttime,extendaccepttime
        });
    });

    router.get('/adminer-time/change',  function *() {

        this.checkQuery('num').notEmpty().isInt().gt(-1).toInt();
        this.checkQuery('value').notEmpty().isInt().gt(-1).toInt();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var name;
        if(this.query.num==1){
            name="overduetime";
        }else if(this.query.num==2){
            name="autoaccepttime";
        }else if(this.query.num==3){
            name="extendaccepttime";
        }else{return ;}

        var con =  yield Container.findOne({
            where: {
                key: name
            }
        });
        con.value=this.query.value;
        yield con.save();
        this.body = 1;
    });





};
