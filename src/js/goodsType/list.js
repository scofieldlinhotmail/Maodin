/* css */
require('../admin-base/common.js');
require('../../css/shared/table.scss');

var $ = jQuery;
$(function () {

    $('.toggle').click(function () {
        var $this = $(this);
        var $i = $this.find('i');
        if ($i.hasClass('fa-plus')) {
            $i.removeClass('fa-plus').addClass('fa-minus');
            $this.parents('tr').next('tr').show();
        } else {
            $i.addClass('fa-plus').removeClass('fa-minus');
            $this.parents('tr').next('tr').hide();
        }
    });

    $('.del-btn').click(function () {
        var $this = $(this);
        var $tr = $this.parentsUntil('tr');
        $.ajax({
            url: 'goodstype-del',
            type: 'post',
            data: {
                id: $tr.data('id')
            },
            success: function (ret) {
                if(ret === 0) {
                    $tr.remove();
                } else {
                    alert('该类别包含相关商品或者子类别，不能删除');
                }
            },
            error: function () {
                alert('操作失败，请刷下重试');
            }
        });
    });

});
