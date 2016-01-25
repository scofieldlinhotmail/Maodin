var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');
var utilx = require('../../lib/util.js');
var fs = require('fs');


module.exports = (router) => {

    var Goods = db.models.Goods;
    var User = db.models.User;
    var Order = db.models.Order;
    var OrderItem = db.models.OrderItem;

    /**
     * 综合查询
     */
    router.get('/adminer-order/order-list', orderListView);
    /**
     * 通过状态和类型来筛选
     */
    router.get('/adminer-order/order-list/ts/:type/:status', orderListView);
    /**
     * 通过类型来筛选
     */
    router.get('/adminer-order/order-list/t/:type', orderListView);
    /**
     * 通过状态来筛选
     */
    router.get('/adminer-order/order-list/s/:status', orderListView);

    function *orderListView() {

        var goods = yield Goods.findAll({
            attributes: ['id', 'title']
        });

        this.body = yield render('order/list', {
            goods,
            type: typeof this.params.type !== 'undefined' ? this.params.type : 'null',
            status: typeof this.params.status  !== 'undefined' ? this.params.status : 'null',
        });

    }

    router.post('/adminer-order/get-order', function *() {

        var body = this.request.body;
        this.body = yield getOrders(body);
    });

    /**
     * 获取订单详情
     */
    router.get('/adminer-order/get-orderitem/:id', function *() {

        this.body = (yield OrderItem.findAll({
            where: {
                OrderId: this.params.id
            }
        })).map(function (item) {
            item.goods = JSON.parse(item.goods);
            return item;
        });
    });

    /**
     * 订单操作
     */
    router.post('/adminer-order/order/status', function *() {

        this.checkBody('ids').notEmpty();
        this.checkBody('status').notEmpty();

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var body = this.request.body;

        var status = body.status;

        if (status == 2) {
            // 发货
            this.body = yield Order.update({
                status: 2,
                sendTime: Date.now()
            }, {
                where: {
                    id: {
                        in: body.ids
                    },
                    status: 1
                }
            });
        } else if(status == 3) {
            // 收到发货
            this.body = yield Order.update({
                status: 10,
                returnTime: Date.now(),
                returnStatus: 2
            }, {
                where: {
                    id: {
                        in: body.ids
                    },
                    returnStatus: 1
                }
            });
        }


    });

    function * getOrders(body, withItem) {

        if (!body.page || body.page < 0) {
            body.page = 1;
        }
        body.page = parseInt(body.page);


        var conditions = {
            where: {
            },
            include: [
                {
                    model: User
                }
            ]
            //offset: (body.page - 1) * body.limit,
            //limit: body.limit
        };

        if (body.status < 0) {
            conditions.where.returnStatus =  - body.status;
        } else {
            conditions.where.status = body.status ? (body.status) : {
                $gt: 0
            };
        }

        if (body.type) {
            conditions.where.type = body.type;
        }

        if (body.goodsIds && body.goodsIds.length !== 0) {
            conditions.where.id = {
                in: (yield OrderItem.findAll({
                    attributes: ['OrderId'],
                    where: {
                        GoodId: {
                            in: body.goodsIds
                        }
                    }
                })).map((item) => item.OrderId)
            };
        }

        if (body.limit !== 'none') {
            if (!body.limit || body.limit < 0) {
                body.limit = 25;
            }
            body.limit = parseInt(body.limit);
            conditions.offset = (body.page - 1) * body.limit;
            conditions.limit = body.limit;
        }

        if (body.startDate && body.startDate.length !== 0) {
            conditions.where.payTime = {
                between: [new Date(Date.parse(body.startDate)), body.endDate ? new Date(Date.parse(body.endDate)) : new Date(Date.now())]
            }
        }

        if (body.recieverName && body.recieverName.length !== 0) {
            conditions.where.recieverName = body.recieverName;
        }

        if (body.limit === 'none' && !body.startDate && body.startDate.length !== 0) {
            var today = new Date(Date.now());
            today.setHours(0);
            today.setMinutes(0);
            today.setSeconds(0);
            today.setMilliseconds(0);
            conditions.where.payTime = {
                between: [today, body.endDate ? new Date(Date.parse(body.endDate)) : new Date(Date.now())]
            }
        }

        if (body.phone && body.phone.length !== 0) {
            conditions.where.phone = body.phone;
        }

        var num = 0;
        if (body.first && body.limiet !== 'none') {
            num = yield Order.count(conditions);
        }

        if (withItem) {
            conditions.include.push({
                model: OrderItem,
            });
        }
        var orders = yield Order.findAll(conditions);

        return {
            num,
            orders
        };
    }

};