var path = require('path');
var webpack = require('webpack');
var extend = require('util')._extend;

var ExtractTextPlugin = require("extract-text-webpack-plugin");
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

// 后台文件
var adminEnties = {
    //'admin-index': ['./src/js/admin/index.js'],
    //'admin-login': ['./src/js/admin/login.js'],
    //'admin-evaluations':['./src/js/admin/evaluations.js'],
    //'admin-order-list':['./src/js/order/list.js'],
    //'admin-user-assign':['./src/js/admin/user-assign.js'],
    //'admin-goods-list':['./src/js/goods/list.js'],
    //'admin-goods-save': ['./src/js/goods/save.js'],
    //'admin-goodstype': ['./src/js/admin/goodstype.js'],
    //'admin-orders':['./src/js/admin/orders.js'],
    //'admin-fare':['./src/js/admin/fare.js'],
    ////'admin-form' : ['./src/js/admin/admin.js'],
    'admin-adminer':['./src/js/admin/adminer.js'],
    //'admin-gooddetail':['./src/js/goods/detail.js'],
    //'admin-user-list': ['./src/js/admin/user.js'],
    'admin-goodstype-save': ['./src/js/goodsType/save.js']
};

// 手机端文件
var phoneEntries = {
    //'goodsType': ['./src/js/goodsType/goodsType.js'],
    //'phone-goods': ['./src/js/phone/goods.js'],
    //'phone-order-comfirm': ['./src/js/phone/order-comfirm.js'],
    //'phone-address':['./src/js/phone/user.address.js'],
    //'phone-addaddress':['./src/js/phone/user.addaddress.js'],
    //'phone-index': ['./src/js/phone/index.js'],
    //'phone-shoppingcart': ['./src/js/phone/shoppingCart.js'],
    //'phone-order-list': ['./src/js/phone/order-list.js'],
    //'phone-register': ['./src/js/phone/register.js'],
    //'phone-evaluation':['./src/js/phone/evaluation.js'],
    //'phone-user': ['./src/js/phone/user.js'],
    //'phone-pay': ['./src/js/phone/pay.js'],
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
