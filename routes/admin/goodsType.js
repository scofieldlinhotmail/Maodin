var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/index.js');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

module.exports = (router) => {

    var GoodsType = db.models.GoodsType;
    var Goods = db.models.Goods;
    router.get('/adminer/goodstype',  function *() {
        var types = yield GoodsType.all();
        debug(types);
        this.body = yield render('admin/goodstype', {
            types
        });
    });


    router.get('/adminer/addtype',  function *() {

        if(this.query.type!=1){
            this.checkQuery('fid').toInt(0);
        }
        this.checkQuery('title').empty().len(2,20,"bad name.").trim().toLow();
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        yield GoodsType.create({
            title:this.query.title,
            type:this.query.type,
            GoodsTypeId:this.query.fid
        });


        this.body = this.query.title ;


    });

    router.get('/adminer/edittype',  function *() {


        this.checkQuery('title').empty().len(2,20,"bad name.").trim().toLow();
        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var type= yield GoodsType.findById(this.query.id);

        type.title=this.query.title;

        yield type.save();


        this.body = this.query.title ;


    });

    router.get('/adminer/deltype',  function *() {

        var type= yield GoodsType.findOne({
            where:{
                id:this.query.id
            }
        });
        debug(type);
        if(type.type==2){
            var count=yield Goods.count({
                where:{
                    GoodsTypeId: this.query.id
                }
            });
            if(count==0){
                type.destroy();
            }
        }
        else{
            var count=yield GoodsType.count({
                where:{
                    GoodsTypeId:this.query.id
                }
            });
            if(count==0){
                type.destroy();
            }
        }

        yield type.save();

        this.body = this.query.title ;

    });

};