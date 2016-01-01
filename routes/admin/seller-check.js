var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/index.js');
var render = require('../../instances/render.js');

module.exports = (router) => {

    //var Seller = db.models.Seller;
    //
    //router.get('/adminer/checkList',  function *() {
    //    this.body = yield render('admin/checkList.html');
    //});
    //
    //router.post('/adminer/seller-admin-action', function *() {
    //
    //    this.checkBody('id').notEmpty();
    //    this.checkBody('status').notEmpty();
    //
    //    var body = this.request.body;
    //    if (this.errors) {
    //        this.body = this.errors;
    //        return;
    //    }
    //
    //    var status = body.status;
    //    if (status == 0) {
    //        yield Seller.update({
    //            status: 0
    //        }, {
    //            where: {
    //                id: body.id
    //            }
    //        });
    //    } else if (status == -2) {
    //        yield Seller.destroy({
    //            where: {
    //                id: body.id
    //            }
    //        });
    //    }
    //
    //    this.body = {
    //        status: true
    //    };
    //
    //});
    //
    //
    ///**
    // * 获取未审核数据
    // */
    //router.get('/adminer/seller-admin/:status',  function *() {
    //
    //    this.checkParams('status').notEmpty().isInt().toInt();
    //    if(this.errors) {
    //        this.body = this.errors;
    //        return;
    //    }
    //    var data = yield Seller.findAll({
    //        where: {
    //            status: this.params.status
    //        },
    //        attributes: ['id', 'shopName', 'name', 'city', 'country', 'address', 'province', 'phone']
    //    });
    //    data = data.map(function (item) {
    //        return {
    //            id: item.id,
    //            shopName: item.shopName,
    //            name: item.name,
    //            phone: item.phone,
    //            fullAddress: item.fullAddress
    //        };
    //    });
    //    this.body = data;
    //});

};