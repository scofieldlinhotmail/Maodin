// parties
var koa = require('koa');
var session = require('koa-generic-session');
//var redistore = require('koa-redis');
var koaBody = require('koa-body');
var staticServer = require('koa-static');
var favicon = require('koa-favicon');
var koaValidate = require('koa-validate');

// local module
var path = require('path');

// my module
var cache = require('./instances/cache');
var router = require('./routes/index');
var log = require('./instances/log.js');

// ------------------------------------------------
var app = koa();
var port = 8765;
app.env = 'development';

// static file
app.use(staticServer(path.join(__dirname, 'public')));
// favicon
app.use(favicon(__dirname + '/public/favicon.ico'));
// http parse
app.use(koaBody());
// redis session
//app.use(session({
//	store: redistore()
//}));

app.use(koaValidate());
// route
app.use(router);

// app.on('error', (err, ctx) => {
//     //todo: error handle
//     // todo: for test
//     console.log(err);
//     log.error('--------------------------');
//     log.error('server error', err.toString());
//     log.error('server error content', ctx);
//     log.error('--------------------------');
// });

app = app.listen(port);
module.exports = app;
