require('./base.js');
require('../../css/phone/address.scss');

var $  = jQuery;

$(function(){
    $('.addr').dblclick(function(){
        var $this = $(this);
        changeDefault($this);
    });
    $('.del').each(function(){
        $(this).click(function(){
            var $this = $(this);
            var id = $this.attr('id');
            var contentID = '#'+id;
            var content = $(contentID);
            if(delValidate()) {
                if (confirm('您确认要删除吗？')) {
                    content.hide();
                    var url = '/user/address/del/' + id;
                    $.ajax({
                        url: url,
                        type: 'GET',
                        success: function (data) {
                        }
                    })
                }
            }else{
                alert('至少有一条收货地址');
            }
        });
    });
    function delValidate(){
        var count = $('.addr:visible').length;
        return count !== 1;
    }

    function changeDefault(ele){
        $('.default').addClass('am-hide');
        var id = ele.attr('id');
        $.ajax({
            url:'/user/address/changeDefault',
            type:'POST',
            data:{id:id}
        });
        var def = $(ele.find('.default'));
        def.removeClass('am-hide');
    }
});





