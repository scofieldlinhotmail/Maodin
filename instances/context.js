/**
 * Created by me on 12/21/15.
 */

var context;
module.exports = {
    get: () => {
        return context;
    },
    set: (ctx) => {
        context = ctx;
    }
};