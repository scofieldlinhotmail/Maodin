var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

module.exports = (router) => {

    router.get('/user-wait', function *() {
        this.body = yield render('/phone/alert', {
            content: '正在等待后台审核，请等候...'
        });
    });

    router.get('/user-msg/:msg', function *() {
        this.body = yield render('/phone/alert', {
            content: this.params.msg
        });
    });

};