/**
 * Created by lxc on 16-1-20.
 */
var Sequelize = require('sequelize');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

var sequelizex = require('../../lib/sequelizex.js');


var Store = db.models.Store;
var User = db.models.User;
var Favorite = db.models.Favorite;
module.exports = (router) => {

    router.get('/user-favorite/add', function *() {
        var user= yield auth.user(this);
        var storeid=this.query.storeid;
        var store=yield Store.findById(storeid);
        if(store!=null){
            var has=yield Favorite.findOne({
                where:{
                    UserId:user.id,
                    StoreId:storeid
                }
            });
            if(has==null){
                yield Favorite.create({
                    UserId:user.id,
                    StoreId:storeid
                });
            }
        }
        this.body =1;
    });
    router.get('/user-favorite/del', function *() {
        var user= yield auth.user(this);
        var storeid=this.query.storeid;
        var store=yield Store.findById(storeid);
        if(store!=null){
            var has=yield Favorite.findOne({
                where:{
                    UserId:user.id,
                    StoreId:storeid
                }
            });
            if(has!=null){
               yield has.destroy();
            }
        }
        this.body =1;
    });


    router.get('/user-favorite/list',  function *() {
        var user=yield auth.user(this);
        //var user=yield User.findOne();

        var list=yield Favorite.findAll({
            where:{
                UserId:user.id,
            },
            include:{
                model:Store,
                include:User
            }
        });
        this.body = yield render('phone/favorite.html', {
           list,title:"我的收藏"
        });
    });
};
function changeURLPar(destiny, par, par_value) {
    var pattern = par + '=([^&]*)';
    var replaceText = par + '=' + par_value;
    if (destiny.match(pattern)) {
        var tmp = '/\\' + par + '=[^&]*/';
        tmp = destiny.replace(eval(tmp), replaceText);
        return (tmp);
    }
    else {
        if (destiny.match('[\?]')) {
            return destiny + '&' + replaceText;
        }
        else {
            return destiny + '?' + replaceText;
        }
    }
    return destiny + '\n' + par + '\n' + par_value;
}