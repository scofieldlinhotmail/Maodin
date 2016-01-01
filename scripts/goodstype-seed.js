/**
 * Created by me on 15-12-29.
 */

var xlsx = require('node-xlsx');
var path = require('path');
var co = require('co');
var db = require('../models/index.js');

var filePath = process.argv[2];
var GoodsType = db.models.GoodsType;

var sheet = xlsx.parse(path.join(__dirname, filePath));

var goodsTypeSheet = sheet[0].data;
co(function *(){
    goodsTypeSheet.slice(2).forEach(function (goodsTypes) {
        if (!goodsTypes[0]) {
            return;
        }
        co(function *() {
            console.log(goodsTypes[0]);
            var ltype = yield GoodsType.create({
                title: goodsTypes[0],
                type: 1
            });
            goodsTypes.slice(1).forEach(function(stype){
                console.log(stype);
                co(function *() {
                    yield GoodsType.create({
                        title: stype,
                        type: 2,
                        GoodsTypeId: ltype.id
                    });
                });
            });
        });

    });
}).catch(function (err) {
    console.log(err.stack)
});
