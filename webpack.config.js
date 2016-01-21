var path = require('path');
var webpack = require('webpack');
var extend = require('util')._extend;

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

// 后台文件
var adminEnties = {
    'admin-index': ['./src/js/admin/index.js'],
    'admin-login': ['./src/js/admin/login.js'],

    'admin-evaluations':['./src/js/admin/evaluations.js'],
    'admin-order-list':['./src/js/order/list.js'],

    'admin-goods-list':['./src/js/goods/list.js'],
    'admin-goods-save': ['./src/js/goods/save.js'],
    'admin-goodstype': ['./src/js/admin/goodstype.js'],
    //'admin-orders':['./src/js/admin/orders.js'],
    'admin-adminer':['./src/js/admin/adminer.js'],
    //'admin-gooddetail':['./src/js/goods/detail.js'],
    'admin-user-list': ['./src/js/admin/user.js'],
    'admin-goodstype-save': ['./src/js/goodsType/save.js'],
    'admin-comment':['./src/js/admin/Comment.js'],
    'admin-storecheck':['./src/js/admin/storecheck.js'],
    'admin-rank':['./src/js/admin/rank.js'],
    'admin-slideshow':['./src/js/admin/slideshow.js'],
};

// 手机端文件
var phoneEntries = {
    //'goodsType': ['./src/js/goodsType/goodsType.js'],
    'phone-goods-page': ['./src/js/phone/goods-page.js'],
    'phone-order-comfirm': ['./src/js/phone/order-comfirm.js'],
    'phone-address':['./src/js/phone/user.address.js'],
    'phone-addaddress':['./src/js/phone/user.addaddress.js'],
    //'phone-index': ['./src/js/phone/index.js'],
    'phone-index': ['./src/js/phone/index.js'],
    'phone-goods-list': ['./src/js/phone/goods-list.js'],
    'phone-goods-collection': ['./src/js/phone/goods-collection.js'],
    'phone-shoppingcart': ['./src/js/phone/shoppingCart.js'],
    'phone-order-list': ['./src/js/phone/order-list.js'],
    'phone-evaluation':['./src/js/phone/evaluation.js'],
    'phone-user': ['./src/js/phone/user.js'],
    'phone-pay': ['./src/js/phone/pay.js'],
    'phone-usercenter': ['./src/js/phone/usercenter.js'],
    'phone-storehome': ['./src/js/phone/storehome.js'],
    'phone-storeapply': ['./src/js/phone/storeapply.js'],
    'phone-storeindex': ['./src/js/phone/storeindex.js'],
};

var extraEntries = {

};

var entry = extend({}, adminEnties);
entry = extend(entry, phoneEntries);


module.exports = {
    entry,
    output: {
        path: path.resolve(__dirname, 'public/dist'),
        filename: '[name].js',
        publicPath: '/dist/',
        sourceMapFileName: '[file].map'
    },
    resolve: {
        root: [path.join(__dirname, "/src/bower_components")]
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
            },
            {
                test: /\.less$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader!less-loader")
            },
            { test : /\.(ttf|eot|svg|woff(2)?)(\?[a-z=0-9\.]+)?$/, loader : 'url-loader?limit=8192'},
            { test : /\.(png|gif|svg|jpg)$/, loader : 'url-loader?limit=8192'}
        ]
    },
    plugins: [
        new webpack.ResolverPlugin(
            new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin("bower.json", ["main"])
        ),
        new ExtractTextPlugin("[name].css"),
        new CommonsChunkPlugin("admin-commons.js", Object.keys(adminEnties)),
        new CommonsChunkPlugin("phone-commons.js", Object.keys(phoneEntries))
    ],
    devtool: 'source-map'
};
