/**
 * Created by bian on 15-12-6.
 */

var render = require('../../instances/render');
var db = require('../../models/db/index');
var deliverAddress = db.models.DeliverAddress;
var Area = db.models.Area;
var auth = require('../../helpers/auth');

module.exports = (router) => {
    router.get('/user/address',function *(){
        var user = (yield auth.user(this));

        var data = yield deliverAddress.findAll({
            where:{
                UserId: user.id
<<<<<<< HEAD
            },
=======
            }
>>>>>>> lxc
        });

        this.body = yield render('phone/address.html',{
            datas:data,
            title: '收货地址'
        });
    });

    router.get('/user/addaddress',function *(){

        this.body = yield render('phone/addaddress.html',{
            title: '添加收货地址'
        });
    });

    router.get('/user/address/del/:id',function *(){
        var id = this.params.id;
        yield deliverAddress.destroy({
            where:{
                id:id
            }
        });
        this.body = '1';
    });

    router.post('/user/address/add',function *(){
        var data = this.request.body;
        console.log(data);
        data.UserId = (yield auth.user(this)).id;
        data.isDefault = false;
        yield deliverAddress.create(data);
        this.body = '1';
    });

    router.post('/user/address/changeDefault',function *(){
        try {
            var data = this.request.body;
            var addrid = data.id;

            var UserID = (yield auth.user(this)).id;

            yield deliverAddress.update({
               isDefault:false
            },{
                where:{
                    UserID:UserID
                }
            });

            yield deliverAddress.update({
                isDefault: true
            }, {
                where: {
                    id: addrid
                }
            });

            this.body = '1';
        }catch(err){
            console.log(err);
            this.body = '0';
        }
    });
};