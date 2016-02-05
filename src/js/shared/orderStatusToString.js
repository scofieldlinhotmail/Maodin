
module.exports = function (order) {

    if (order.returnStatus != 0) {
        switch (order.returnStatus) {
            case 1:
                return '退货中';
            case 2:
                return '退货完成';
        }
    } else if (order.status <= 2){
        switch (order.status) {
            case -2 :
                return '付款过期';
            case -1:
                return '用户取消';
            case 0:
                return '待付款';
            case 1:
                return '待发货';
            case 2:
                return '已发货';
        }
    } else if (order.status >= 10 && order.returnStatus == 0) {
        return '已签收';
    }
};