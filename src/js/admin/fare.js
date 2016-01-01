/**
 * Created by lxc on 15-12-10.
 */
require('../admin-base/common.js');


var $ = jQuery;

$('#edit').click(function(){
    $('input').removeAttr("disabled")
    $('#savebtn').removeAttr("disabled")
});