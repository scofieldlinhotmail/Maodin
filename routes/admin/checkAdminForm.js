/**
 * Created by li_rz on 2015/12/4.
 */
var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/index.js');
var render = require('../../instances/render.js');

module.exports = (router) => {
    //var Adminer = db.models.Adminer;
    //
    //router.get('/adminer/checkAdminForm',  function *() {
    //    this.body = yield render('admin/checkAdminForm.html');
    //});
    //
    //router.get('/adminer/admin.json', function *() {
    //    var adminer_list = yield Adminer.findAll();
    //    this.body = adminer_list.map(function (item) {
    //        return item.dataValues;
    //    });
    //});
    //
    //router.post('/adminer/checkAdminForm', function *() {
    //    var request = this.request,
    //        data = request.body,
    //        user = yield Adminer.findAll({
    //                where : {
    //                    name : data.username
    //                }
    //            });
    //    console.log(data);
    //    console.log(user.length);
    //    if (user.length === 0) {
    //        Adminer.create({
    //            name : data.username,
    //            password : data.password,
    //            phone : data.phone,
    //            status : -1,
    //            flag : 0
    //        });
    //        this.body = {success : true}
    //    } else {
    //        this.body = {error: '该用户已存在'}
    //    }
    //    // console.log(data);
    //});
};