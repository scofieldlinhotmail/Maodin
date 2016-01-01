/**
 * Created by me on 15-12-29.
 */

var xlsx = require('node-xlsx');
var path = require('path');
var co = require('co');
var db = require('../models/index.js');

var filePath = process.argv[2];
var GoodsType = db.models.GoodsType;
var Goods = db.models.Goods;

var sheet = xlsx.parse(path.join(__dirname, filePath));

var goodsSheet = sheet[1].data;
var goodsTypeCache = {};
co(function *(){
    var imgs = JSON.stringify(['/ad.png']);
    goodsSheet.slice(1).forEach(function (goods) {
        co(function *() {
            console.log(goods[1]);
            var type = goodsTypeCache[goods[1]];
            if (!type) {
                type = yield GoodsType.findOne({
                    where: {
                        type: 2,
                        title: goods[1]
                    }
                });
                goodsTypeCache[goods[1]] = type;
            }
            console.log(goods[0]);
            if (type) {
                yield Goods.create({
                    title: goods[0],
                    mainImg: '/logo.jpg',
                    imgs,
                    price: goods[2],
                    oldPrice: goods[3],
                    capacity: goods[9],
                    perNum: goods[4],
                    perStr: goods[5],
                    GoodsTypeId: type.id,
                    brief: goods[6],
                    soldNum: goods[10],
                    content: goods[7],
                    status: 1
                });
            } else {
                console.log('no type', goods[1]);
            }
        }).catch(function (err) {
            console.log(err)
        });;
    });
}).catch(function (err) {
    console.log(err)
});
