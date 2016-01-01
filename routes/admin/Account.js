/**
 * Created by lxc on 15-12-17.
 */
var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/index.js');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');


module.exports = (router) => {

    var Admins = db.models.Adminer;

    router.get('/adminer-super/accountlist',  function *() {
        var admin=yield Admins.findAll({
            where: {
                status: 0
            }
        });
        this.body = yield render('admin/AccountList', {
            admin
        });
    });

    router.post('/adminer/accountadd',  function *() {
        var body=this.request.body;
        debug(body);

        var nickname=body.nickname;
        ///修改
        if(body.id!=""){
            var is=yield Admins.findOne({
                where:{
                    nickname:nickname,
                    id:{
                        $ne: body.id
                    }
                }
            });
            if(is==null){
                console.log("修改");
                var th=yield Admins.findOne({
                    where:{
                        id:body.id
                    }
                });

                th.nickname=body.nickname,
                    th.type=body.type,
                    th.name=body.name,
                    th.phone=body.phone,
                    th.password=body.password,
                    yield th.save();
                this.body = th.id
            }else{
                console.log("不修改");
                this.body=-1
            }
        }else{
            ///添加
            is=yield Admins.findOne({
                where:{
                    nickname:nickname
                }
            });
            debug(is);
            if(is==null){
                var e=yield Admins.create({
                    nickname:body.nickname,
                    type:body.type,
                    name:body.name,
                    phone:body.phone,
                    password:body.password,
                    status:0
                });
                this.body = e.id
            }else{
                this.body=-1;
            }
        }




    });



    router.get('/adminer/getaccount',  function *() {

        var id=this.query.id;
        var is=yield Admins.findOne({
            where:{
                id:id
            }
        });
        this.body=JSON.stringify(is);
    });

    router.get('/adminer/delaccount',  function *() {

        var id=this.query.id;
        var is=yield Admins.findOne({
            where:{
                id:id
            }
        });
        is.destroy();
        yield is.save();
        this.body=1;
    });

};