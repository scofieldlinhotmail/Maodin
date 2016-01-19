/**
 * Created by nobody on 2016/1/19.
 */

var db = require('./../models/db/index.js');

module.exports = {
    isSaler : function *(id) {
        return (yield db.models.Store.findOne({
            where: {
                UserId: id
            }
        })) != null;
    }
};