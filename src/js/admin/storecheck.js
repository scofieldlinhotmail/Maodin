/**
 * Created by lxc on 16-1-16.
 */
require('../admin-base/common.js');


var $ = jQuery;

$(".group-checkable").click(function(){
    var has=$(".group-checkable").parent().hasClass("checked");
    if(has){
        $(".checkboxes").parent().removeClass("checked");
        $(".checkboxes").removeAttr("checked");
    }else{
        $(".checkboxes").parent().addClass("checked");
        $(".checkboxes").prop("checked","checked");
    }


})

$("#btn1").click(function(){
    var has=$(".group-checkable").parent().hasClass("checked");
    if(has){
        $(".checkboxes").parent().removeClass("checked");
        $(".checkboxes").removeAttr("checked");
    }else{
        $(".checkboxes").parent().addClass("checked");
        $(".checkboxes").prop("checked","checked");
    }

})

$("#focus").focusout(function(){
    var page=$("#page").val();

    var get=$(this).val();
    if(get<0){
        alert("请输入正确页数")
    }else if(page!=get&&get!=0){
        var url = window.location.href;
        var ed=changeURLPar(url,"page",get);
        window.location.href=ed;
    }



})


$("#btn2").click(function(){
    var obj=$(".many");
    var list=[];
    obj.each(function(){
        if($(this).parent().hasClass("checked"))
        {
            var tid=$(this).attr("data-id");
            list.push(tid);}
    })
    var val=1;
    manychange(list,val);
})
$("#btn3").click(function(){
    var obj=$(".many");
    var list=[];
    obj.each(function(){
        if($(this).parent().hasClass("checked"))
        {
            var tid=$(this).attr("data-id");
            list.push(tid);}
    })
    var val=-1;
    manychange(list,val);
})

function manychange(list,s) {
    $.ajax({
        type: 'get',

        url: "ChangeManyS" ,

        data: {
            list:JSON.stringify(list),s:s
        } ,

        success: function(){
            var ano=(s+1)%2;
            $.each(list,function(i,v){
                $("tr[data-id='"+v+"']").remove();
            })

        } ,
        dataType: "json"

    });

}


$(".pass").click(function(){

    var id=$(this).attr("data-id");
    var s=1;
    $.ajax({
        type: 'get',

        url: "ChangeOneS" ,

        data: {
            id:id,s:s
        } ,

        success: function(){
            $("tr[data-id='"+id+"']").remove();
        } ,

        dataType: "json"

    });

});
$(".refuse").click(function(){

    var id=$(this).attr("data-id");
    var s=-1;
    $.ajax({
        type: 'get',

        url: "ChangeOneS" ,

        data: {
            id:id,s:s
        } ,

        success: function(){
            $("tr[data-id='"+id+"']").remove();
        } ,

        dataType: "json"

    });

});

