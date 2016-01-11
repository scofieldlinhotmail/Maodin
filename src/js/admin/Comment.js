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
    console.log(list);
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
    console.log(list);
    var val=0;
    manychange(list,val);
})

function manychange(list,s) {
    $.ajax({
        type: 'get',

        url: "/adminer/ChangeManyS" ,

        data: {
            list:JSON.stringify(list),s:s
        } ,

        success: function(){
            var ano=(s+1)%2;
            $.each(list,function(i,v){
                $("input[data-id='"+v+"'][type='radio'][value='"+s+"']").parent().addClass("checked");
                $("input[data-id='"+v+"'][type='radio'][value='"+ano+"']").parent().removeClass("checked");

            })

        } ,
        dataType: "json"

    });

}


$("input[type=radio]").click(function(){

    var id=$(this).attr("data-id");
    var s=$(this).attr("value");
    $.ajax({
        type: 'get',

        url: "/adminer/ChangeOneS" ,

        data: {
           id:id,s:s
        } ,

        success: function(){

        } ,

        dataType: "json"

    });

});

function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}

function changeURLPar(destiny, par, par_value)
{
    var pattern = par+'=([^&]*)';
    var replaceText = par+'='+par_value;
    if (destiny.match(pattern))
    {
        var tmp = '/\\'+par+'=[^&]*/';
        tmp = destiny.replace(eval(tmp), replaceText);
        return (tmp);
    }
    else
    {
        if (destiny.match('[\?]'))
        {
            return destiny+'&'+ replaceText;
        }
        else
        {
            return destiny+'?'+replaceText;
        }
    }
    return destiny+'\n'+par+'\n'+par_value;
}