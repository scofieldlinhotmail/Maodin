/**
 * Created by bian on 15-12-6.
 */

require('./base.js');
require('../../css/phone/addaddress.scss');

require('imports?$=jquery, define=>false, exports=>false, ChineseDistricts=distpicker/dist/distpicker.data.js!distpicker/dist/distpicker.js');

var $ = jQuery;

var result = [];
function limit(rev, tel, code, province, city, addr) {
    var reg;
    result['rev'] = (rev.length !== 0);

    reg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/g;
    result['tel'] = !!reg.test(tel);

    reg = /^[0-9]{6}$/g;
    result['code'] = !!reg.test(code);

    result['addr'] = (addr.length !== 0
    && province !== "—— 省 ——"
    && city !== "—— 市 ——");
}

function validate() {
    var receiver = $('#receiver').val();
    var tel = $('#tel').val();
    var code = $('#code').val();
    var province = $("#province").val();
    var city = $('#city').val();
    var addr = $('#addr').val();
    limit(receiver, tel, code, province, city, addr);
    var count = 0;
    if (!result['rev']) {
        $('.a').removeClass('hide');
        $('.a').addClass('show');
        count += 1;
    } else {
        $('.a').addClass('hide');
    }

    if (!result['tel']) {
        $('.b').removeClass('hide');
        $('.b').addClass('show');
        count += 1;
    } else {
        $('.b').addClass('hide');
    }

    if (!result['code']) {
        $('.c').removeClass('hide');
        $('.c').addClass('show');
        count += 1;
    } else {
        $('.c').addClass('hide');
    }

    if (!result['addr']) {
        $('.e').removeClass('hide');
        $('.e').addClass('show');
        count += 1;
    } else {
        $('.e').addClass('hide');
    }

    if (count > 0) {
        $('#danger').removeClass('hide');
        return false;
    } else {
        $('#danger').addClass('hide');
        return true;
    }
}


window.onload = function () {
    $('#danger').setAttribute('class', 'hide');
};


var yes = $('#yes');
yes.click(function () {
    if (validate()) {
        var receiver = $('#receiver').val();
        var tel = $('#tel').val();
        var code = $('#code').val();
        var province = $("#province").val();
        var city = $('#city').v();
        var addr = $('#addr').val();
        var data = {
            recieverName: receiver,
            phone: tel,
            province: province,
            city: city,
            address: addr,
            id: $('[name=id]').val()
        };

        $.ajax({
            url: '/user/address/add',
            type: 'POST',
            data: data,
            success: function (data) {
                if (data) {
                    alert('添加成功');
                }
            }
        })
    }
});