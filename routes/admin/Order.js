/**
 * Created by lxc on 15-12-10.
 */
var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/index.js');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

module.exports = (router) => {

    var Goods=db.models.Goods;
    var Orders = db.models.Order;
    var OrderItem = db.models.OrderItem;
    var User= db.models.User;

    router.get('/adminer/orders',  function *() {
        var t=this.query.t;
        var s=this.query.s;

        var page=this.query.page;
        if(s==null){
            if(t==null){
                var orders = yield Orders.findAll({
                    include: [{
                        model: OrderItem,
                        include: [Goods]
                    }]
                });
                t=0;
            }else{
                var orders = yield Orders.findAll({
                    where: {
                        status:t
                    },
                    include: [{
                        model: OrderItem,
                        include: [Goods]
                    }]

                });
            }
        }else if(s==1){
            //按订单号查找
            var num=this.query.num;

            var orders = yield Orders.findAll({
                where: {
                    id:{
                        $like: '%'+num+'%',
                    }
                },
                include: [{
                    model: OrderItem,
                    include: [Goods]
                }]

            });
        }else if(s==2){
            //按成交时间
            var stime=this.query.stime;
            var etime=this.query.etime;
            var orders = yield Orders.findAll({
                where: {
                    payTime:{
                        $gte: stime ,//大于=
                        $lte: etime ,//小于=
                    }
                },
                include: [{
                    model: OrderItem,
                    include: [Goods]
                }]

            });
        }else if(s==3){
            //按下单时间
            var stime=this.query.stime;
            var etime=this.query.etime;
            var orders = yield Orders.findAll({
                where: {
                    createdAt:{
                        $gte: stime ,//大于=
                        $lte: etime ,//小于=
                    }
                },
                include: [{
                    model: OrderItem,
                    include: [Goods]
                }]

            });
        }else if(s==4){
            //按物品名称查找
            var name=this.query.name;
            var orders = yield Orders.findAll({
                //offset: 0,
                //limit: 5,
                include: [{
                    model: OrderItem,
                    include: [{
                        model: Goods,
                        where: {title:{
                            $like: '%'+name+'%',
                        }}
                    }]
                }],
            });
        }

        var preurl="#";
        var nexturl="#";
        if(page==null) {
            page=0;
        }else{
            var prepage=Number(page)-1;
            if(this.url.toString().indexOf("?")>0){
                if(this.url.toString().indexOf("page")>0){
                    preurl=this.url.toString().substring(0,this.url.toString().indexOf("page"))+"page="+prepage;
                }else{
                    preurl=this.url+"&page="+prepage;
                }
            }else{
                preurl=this.url+"?page="+prepage;
            }

        }
        var l=orders.length;
        var next;
        if(page*5+5<l){
            orders=orders.slice(page*5,page*5+5);
            next= Number(page)+1;
            if(this.url.toString().indexOf("?")>0){
                if(this.url.toString().indexOf("page")>0){
                    nexturl=this.url.toString().substring(0,this.url.toString().indexOf("page"))+"page="+next;
                }else{
                    nexturl=this.url+"&page="+next;
                }
            }else{
                nexturl=this.url+"?page="+next;
            }
        }else if(page*5+5==l) {
            orders=orders.slice(page*5,page*5+5);
            next=0;
        }else{
            orders=orders.slice(page*5);
            next=0;
        }

        debug(orders);
        debug(preurl);
        debug(nexturl);


        this.body = yield render('admin/orders', {
            orders,t,next,nexturl,page,preurl
        });
    });

    router.get('/adminer/getorderinfor',function *() {
        var id=this.query.id;
        var order=yield Orders.findById(id);
        this.body=order;
    });

    router.post('/adminer/orderrefuge', function *(){
        var id=this.query.id;
        var reason=this.query.reason;
        debug("id="+id+"reason="+reason);
    });
    router.post('/adminer/ordersend', function *(){

        var id=this.query.id;
        var sendtime=this.query.time;
        debug("id="+id+"time="+sendtime);
    });

    router.get('/adminer/order',  function *() {
        var id=this.query.id;

        var order= yield Orders.findAll({
            where:{
                id:id
            },
            include: [{
                model: OrderItem,
                include: [Goods]
            },User]
        });;
        debug(order);

        this.body = yield render('admin/order', {
            order
        });
    });

};