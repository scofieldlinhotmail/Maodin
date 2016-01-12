/**
 * Created by lxc on 16-1-11.
 */
var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

module.exports = (router) => {

    var Rank = db.models.Rank;

    router.get('/adminer-vip/ranks',  function *() {
        var list = yield Rank.findAll();
        this.body = yield render('admin/rank', {
            list
        });
    });

    router.get('/adminer-vip/ranksave',  function *() {
        this.checkQuery('name').empty().trim().toLow();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        if(this.query.id==0) {
            yield Rank.create({
                name: this.query.name,
                min: this.query.min,
                max: this.query.max
            });
        }else{
            var r= yield Rank.findById(this.query.id);
            r.name=this.query.name;
            r.min=this.query.min;
            r.max=this.query.max;
            yield r.save();
        }
        this.body = this.query.title ;

    });

    router.get('/adminer-vip/rankdel',  function *() {
        var r= yield Rank.findOne({
            where:{
                id:this.query.id
            }
        });
        r.destroy();
        yield r.save();
        this.body = this.query.id ;

    });



};