/**
 * Created by lxc on 16-1-11.
 */
var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

var Rank = db.models.Rank;
var b=1;
module.exports = (router) => {


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
            yield check(this.query.min,this.query.max,this.query.name);
            if(b==1){
                yield Rank.create({
                    name: this.query.name,
                    min: this.query.min,
                    max: this.query.max
                });
            }

        }else{
            var r= yield Rank.findById(this.query.id);
            yield check(this.query.min,this.query.max,r.name);
            if(b==1){
                r.name=this.query.name;
                r.min=this.query.min;
                r.max=this.query.max;
                yield r.save();
            }

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

    router.get('/adminer-vip/checkname',  function *() {
        if(this.query.id==0) {
            var r= yield Rank.findOne({
                where:{
                    name:this.query.name
                }
            });
            if(r!=null){
                this.body = 0;
            }else{
                this.body = 1;
            }

        }else{
            var r= yield Rank.findOne({
                where:{
                    id:{$ne:this.query.id},
                    name:this.query.name
                }
            });
            if(r!=null){
                this.body = 0;
            }else{
                this.body = 1;
            }
        }
    });

    function *check (min,max,name){
        min=Number(min);
        max=Number(max);
        b=1;
        var list = yield Rank.findAll();
        for(var i=0;i<list.length;i++)
        {
            if(list[i].min<=min&&list[i].max>=min&&name!=list[i].name){
                console.log("false"+"--"+"min="+min+"v:"+list[i].name);
                b=0;
            }else if(list[i].min<=max&&list[i].max>=max&&name!=list[i].name){
                console.log("false"+"--"+"max="+max+"v:"+list[i].name);
                b=0;
            }
        }


    }




};
