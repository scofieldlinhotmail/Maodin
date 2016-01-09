var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');
var utilx = require('../../lib/util.js');
var xlsx = require('node-xlsx');
var fs = require('fs');

var excelbuilder = require('msexcel-builder');

module.exports = (router) => {

    var Goods=db.models.Goods;
    var Order = db.models.Order;
    var OrderItem = db.models.OrderItem;
    var Area = db.models.Area;

    router.get('/adminer/order-list',  function *() {

        var goods = yield Goods.findAll({
            where: {
                status: 0
            },
            attributes: ['id', 'title']
        });

        var areas = yield Area.findAll({
            where: {
                type: 1
            }
        });

        this.body = yield render('order/list', {
            goods,
            areas
        });

    });

    router.post('/adminer/get-order', function *() {

        //this.checkBody('status').notEmpty().isInt().toInt();

        var body = this.request.body;
        this.body = yield getOrders(body);
    });

    router.get('/adminer/get-orderitem/:id', function *() {

        this.body = (yield OrderItem.findAll({
            where: {
                OrderId: this.params.id
            }
        })).map(function (item) {
            item.goods = JSON.parse(item.goods);
            return item;
        });
    });

    router.post('/adminer/order/status', function *() {

        this.checkBody('ids').notEmpty();
        this.checkBody('status').notEmpty();

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var body = this.request.body;

        debug(body);

        this.body = yield Order.update({
            status: 2,
            sendTime: Date.now()
        },{
            where: {
                id: {
                    in: body.ids
                },
                status: 1
            }
        });
    });

    router.post('/adminer/order/export', function *() {

        var body = this.request.body;
        this.checkBody('ids').notEmpty();
        this.checkBody('type').notEmpty();

        if (this.errors) {
            this.body = this.errors;
            return;
        }

        var orders;
        body.ids = JSON.parse(body.ids);
        if (body.exportAll == 'false') {

            orders = yield Order.findAll({
                where: {
                    id: {
                        in: body.ids
                    }
                },
                include: [
                    {
                        model: OrderItem
                    },
                    {
                        model: Area,
                        include: [
                            {
                                model: Area,
                                as: 'TopArea'
                            }
                        ]
                    }
                ]
            });
        } else {
            orders = (yield getOrders(body.ids, true)).orders;
        }

        this.response.type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        this.response.set('Content-Disposition', 'attachment;filename=order.xlsx');
        this.body = toXlsx(orders, body.type);
    });


    function toXlsx(orders, type) {

        var totalRow = 20;
        var totalCol = 30;
        orders.forEach(function (item) {
            totalRow += item.num;
        });

        var workbook = excelbuilder.createWorkbook('./', 'orders.xlsx');

        var sheet = workbook.createSheet('sheet1', totalCol, totalRow);
        // set title

        var titles = type == 'all' ? [
            '订单号',
            '收货人姓名',
            '收货人手机号',
            '区域',
            '地址',
            '数量',
            '总价',
            '运费',
            '支付时间',
            '订单状态',
            '备注',
            '商品id',
            '标题',
            '单价',
            '总价',
            '数量'
        ] : [
            '订单号',
            '数量',
            '总价',
            '备注',
            '商品id',
            '标题',
            '数量'
        ];

        titles.forEach(function (str, index) {
            sheet.set(index + 1, 1, str);
        });
        //body.type == 'all' ?
        var attrs = type == 'all' ? [
            'id',
            'recieverName',
            'phone',
            (obj) => {
                return obj.Area.TopArea.title + '-' + obj.Area.title;
            },
            (obj) => {
                return obj.province + obj.city + obj.area + obj.address;
            },
            'num',
            'price',
            'fare',
            'payTime',
            (obj) => {
                var val = obj.status;
                switch (val) {
                    case 0:
                        return '';
                    case 1:
                        return '待发货';
                    case 2:
                        return '已发货';
                    case 3:
                        return '已签收';
                }
            },
            'message'
        ] : [
            'id',
            'num',
            'price',
            'message'
        ];

        var itemAttrs = type == 'all' ? [
            'GoodId',
            (obj) => {
                return obj.goods.title;
            },
            (obj) => {
                return obj.goods.price;
            },
            'price',
            'num'
        ] : [
            'GoodId',
            (obj) => {
                return obj.goods.title;
            },
            'num'
        ];

        var rowCounter = 2;

        // 统计
        var areas = [];
        var topAreas = [];
        var goods = [];

        orders.forEach(function (order) {
            var colCounter = 1;
            attrs.forEach((item) => {
                var val;
                if (typeof item === 'function') {
                    val = item(order);
                } else {
                    val = order[item];
                }
                sheet.set(colCounter ++, rowCounter, val);
            });

            for(var i = 1; i < colCounter; i ++) {
                sheet.merge(
                    {col: i,row: rowCounter},
                    {col: i,row: rowCounter + order.num}
                );
            }
            var tmpCol = colCounter;
            order.OrderItems.forEach((orderItem)=> {
                colCounter = tmpCol;
                orderItem.goods = JSON.parse(orderItem.goods);
                itemAttrs.forEach((item) => {
                    var val;
                    if (typeof item === 'function') {
                        val = item(orderItem);
                    } else {
                        val = orderItem[item];
                    }
                    sheet.set(colCounter ++, rowCounter, val);
                });
                rowCounter ++;
            });

            rowCounter += 1;

            var tmp = utilx.find(areas, order.Area.id, 'id');
            if (tmp) {
                areas[tmp.key].orderCount += 1;
                areas[tmp.key].orderItemCount += order.OrderItems.length;
            } else {
                areas.push({
                    id: order.Area.id,
                    title: order.Area.title,
                    orderCount: 1,
                    orderItemCount: order.OrderItems.length
                });
            }

            tmp = utilx.find(topAreas, order.Area.TopArea.id, 'id');
            if (tmp) {
                areas[tmp.key].orderCount += 1;
            } else {
                areas.push({
                    id: order.Area.TopArea.id,
                    title: order.Area.TopArea.title,
                    orderCount: 1
                });
            }
        });

        sheet = workbook.createSheet('sheet2', 10, 10 + areas.length + topAreas.length);

        titles = ['区域id', '区域名', '订单数'];
        titles.forEach(function (str, index) {
            sheet.set(index + 1, 1, str);
        });

        rowCounter = 2;
        topAreas.concat(areas).forEach((area) => {
            sheet.set(1, rowCounter, area.id);
            sheet.set(2, rowCounter, area.title);
            sheet.set(3, rowCounter, area.orderCount);
            rowCounter ++;
        });

        //this.body = 'ok';

        var ctx = this;
        var jszip = workbook.generate(function (err, jszip) {
            return jszip;
        });
        var buffer = jszip.generate({type: "nodebuffer"});
        return buffer;
    }

    function * getOrders(body, withItem) {
        if (!body.page || body.page < 0) {
            body.page = 1;
        }
        body.page = parseInt(body.page);


        var conditions = {
            where: {
                status: body.status ? body.status : {
                    in: [1, 2, 3]
                }
            },
            include: [{
                model: Area
                //as: 'SArea',
            }]
            //offset: (body.page - 1) * body.limit,
            //limit: body.limit
        };

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


        if (body.areas && body.areas.length !== 0) {
            conditions.include[0].where = {
                TopAreaId: {
                    in: body.areas
                }
            };
        }

        var num = 0;
        if (body.first && body.limiet !== 'none') {
            num = yield Order.count(conditions);
        }
        conditions.include[0].include = [{
            model: Area,
            as: 'TopArea'
        }];


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