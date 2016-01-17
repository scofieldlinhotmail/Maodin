var fileParse = require('co-busboy');
var fs = require('fs');
var os = require('os');
var path = require('path');
var utilx = require('../lib/util');

module.exports = (router) => {

    var uploadDir = path.join(__dirname, '..', 'public', 'upload');

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    var newFileName = (filename) => {
        var ret;
        do {
            var newfilename = `${utilx.randomNum(6)}-${filename}`;
            ret = path.join(uploadDir, newfilename);
        } while(fs.exists(ret));
        return {
            path: ret,
            url: `/upload/${newfilename}`
        };
    };

    router.post('/upload', function *() {
        var parts = fileParse(this);
        var part;

        var ret = [];
        while (part = yield parts) {
            if (!part.pipe) {
                continue;
            }
            var filename = newFileName(part.filename);
            var stream = fs.createWriteStream(filename.path);
            part.pipe(stream);
            ret.push({
                success: true,
                file_path: filename.url
            });
        }

        this.body = ret.length === 1 ? ret[0] : ret;
    });



};