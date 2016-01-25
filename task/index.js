var fs = require('fs');
var path = require('path');
var util = require('util');
var co = require('co');

var ignores = [
    'index.js'
];


var tasks = [];

var loadDir = (dir) => {
    fs
        .readdirSync(dir)
        .forEach( (file) => {
            var nextPath = path.join(dir, file);
            var stat = fs.statSync(nextPath);
            if (stat.isDirectory()) {
                loadDir(nextPath);
            } else if (stat.isFile() && file.indexOf('.') !== 0 && ignores.indexOf(file) != -1) {
                co(function *() {
                    console.log(`[${file}] start ${(new Date()).toLocalString()}`);
                    yield require(nextPath)()();
                    console.log(`[${file}] end ${(new Date()).toLocalString()}`);
                }).catch(function (err) {
                    console.log(`[Error][${file}] ${err} ${(new Date()).toLocalString()}`);
                });

            }
        });
};

loadDir(__dirname);
