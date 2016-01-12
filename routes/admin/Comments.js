/**
 * Created by lxc on 16-1-9.
 */

var util = require('util');

var auth = require('../../helpers/auth.js');
var db = require('../../models/db/index');
var render = require('../../instances/render.js');
var debug = require('../../instances/debug.js');

module.exports = (router) => {

    var Comment = db.models.Comment;
    var Goods=db.models.Goods;
    var User = db.models.User;


    router.get('/adminer/comment/:id',  function *() {

        var key=this.query.key;
        var list= yield Comment.findAll({
            include: [User,Goods]
        });
        if(key!=null){
           list=yield Comment.findAll({
               where:{
                   message:{$like: '%'+key+'%'}
               },
               include: [User,Goods]
           })
        }
        var page=this.query.page;

        debug(list);

        ///每页几个
        var pre=10;
        var preurl="#";
        var nexturl="#";
        if(page==null) {
            page=1;
        }else if(page>1){
            var prepage=Number(page)-1;
            preurl=changeURLPar(this.url,"page",prepage);
        }
        var l=list.length;
        var next;
        if(page*pre<l){
            list=list.slice((page-1)*pre,(page-1)*pre+pre);
            next= Number(page)+1;
            nexturl=changeURLPar(this.url,"page",next);
        }else if(page*pre==l) {
            list=list.slice((page-1)*pre,(page-1)*pre+pre);
            next=0;
        }else{
            list=list.slice((page-1)*pre);
            next=0;
        }

        var allpage=((l%pre==0)?(l/pre):(l/pre+1));
        this.body = yield render('admin/Comments', {
            preurl,nexturl,list,page,next,allpage
        });
    });


    router.get('/adminer/ChangeOneS',function *(){
        var id =this.query.id;
        var s =this.query.s;
        yield cstatus(id,s);
        this.body=1;
    });
    router.get('/adminer/ChangeManyS',function *(){
        var ids = JSON.parse(this.query.list);
        var s =this.query.s;

        for(var i=0;i<ids.length;i++)
        {
            yield cstatus(ids[i],s);
        }
        this.body=1;
    });
    ///隐藏或显示
    function * cstatus(id,s){
        debug(id);
        var one=yield Comment.findById(id);
        if(one!=null) {
            one.status = s;
            yield one.save();
        }
    }

};


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
