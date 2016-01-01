/**
 * Created by OurEDA on 15/12/3.
 */
require('../../../src/css/admin-base/common.js');

/* js */
require('../admin/index');
window.show  = function show(index){
    if(index=='1'){
        document.getElementById("firsthidden").className="form-group hidden";
        document.getElementsByName("topid").value=3;
    }else if(index=='2'){
        document.getElementById("firsthidden").className="form-group";
        document.getElementsByName("topid").value=0;
    }else{
        document.getElementById("firsthidden").className="form-group hidden";
        document.getElementsByName("topid").value=3;
    }
}

var $ = jQuery;

require('imports?$=jquery!jquery-validation');

// for more info visit the official plugin documentation:
// http://docs.jquery.com/Plugins/Validation

var form1 = $('#form_sample_1');

form1.validate({
    errorElement: 'span', //default input error message container
    errorClass: 'help-block', // default input error message class
    focusInvalid: false, // do not focus the last invalid input
    ignore: "",
    rules: {
        title: {
            required: true
        },
        type: {
            required: true
        },
        topid:{
            required: true
        }
    },
    highlight: function (element) { // hightlight error inputs
        $(element)
            .closest('.form-group').addClass('has-error'); // set error class to the control group
    },

    unhighlight: function (element) { // revert the change done by hightlight
        $(element)
            .closest('.form-group').removeClass('has-error'); // set error class to the control group
    },

    success: function (label) {
        label
            .closest('.form-group').removeClass('has-error'); // set success class to the control group
    },

    submitHandler: function (form) {
        form.submit();
    }
});