var verifyCode = require('../helpers/verifyCode');

module.exports = (router) => {

    router.get('/verifyCode/:phone', function *() {
        this.checkParams('phone').notEmpty();
        this.checkParams('phone').match(/^1[3-8]+\d{9}$/);
        if (this.errors) {
            this.body = -1;
            return;
        }
        var code = yield verifyCode.send(this.params.phone);
        this.body = code;
    });

    router.get('/verifyCode', function *() {
        this.checkQuery('phone').notEmpty();
        this.checkQuery('phone').match(/^1[3-8]+\d{9}$/);
        this.checkQuery('code').notEmpty();
        this.checkQuery('code').optional().len(6);
        if (this.errors) {
            this.body = this.errors;
            return;
        }
        var result = yield verifyCode.verify(this.query.phone, this.query.code);
        this.body = result;
    });

};