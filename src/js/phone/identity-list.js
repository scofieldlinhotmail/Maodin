require('./base.js');
require('../../css/phone/address.scss');

var $  = jQuery;

$(function(){
    $('.addr').dblclick(function(){
        var $this = $(this);
        changeDefault($this);
    });

    $('.del').click(function(){
        var $this = $(this);
        var id = $this.data('id');
        if (confirm('您确认要删除吗？')) {
            var url = '/user/identity/del/' + id;
            $.ajax({
                url: url,
                type: 'GET',
                success: function (data) {
                    $this.parents('.addr').remove();
                }
            });
        }
    });

    function changeDefault(ele){
        $('.default').addClass('am-hide');
        var id = ele.data('id');
        $.ajax({
            url:'/user/identity/changeDefault',
            type:'POST',
            data:{
                id:id
            }
        });
        var def = $(ele.find('.default'));
        def.removeClass('am-hide');
    }
});





