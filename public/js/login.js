/**
 * Created by pikicast on 17/2/16.
 */
$(document).ready(function () {
    setBtn();
});

$("body").on('keydown', function () {
    setBtn();
});
$("body").on('keyup', function () {
    setBtn();
});
$("body").on('change', function () {
    setBtn();
});

$("#username").on('keydown', function () {
    onEnterPressed();
});

$("#password").on('keydown', function () {
    onEnterPressed();
});

$("#btn-login").on('click', function (e) {
    onOK();
});

function onEnterPressed() {
    var form = document.form;
    if (event.keyCode == 13 && event.srcElement.name == "email") {
        if ($.trim(form.username.value) == '') {
            setMsg('Please enter your email.');
            event.preventDefault();
            return;
        }
        form.password.focus();
        event.preventDefault();
    }
    if (event.keyCode == 13 && event.srcElement.name == "password") {
        onOK();
        event.preventDefault();
    }
}

function onOK() {
    var params = {
        channel: X_REVIEW_CHANNEL,
        loginId: $('#username').val(),
        hashedPassword: $.md5($('#password').val()),
        snsType: 'email'
    };

    if ($.trim($("#username").val()) == '') {
        setMsg("Please enter your email.");
        return;
    }
    if (!isValidEmail($.trim($("#username").val()))) {
        setMsg("Invalid email.");
        return;
    }
    if ($.trim($("#password").val()) == '') {
        setMsg("Please enter your password.");
        return;
    }
    onLogin(params);
}

function isValidFormData() {
    if ($.trim($("#username").val()) == '') {
        setMsg("Please enter your email.");
        return false;
    }
    if (!isValidEmail($.trim($("#username").val()))) {
        setMsg("Invalid email.");
        return false;
    }
    if ($.trim($("#password").val()) == '') {
        setMsg("Please enter your password.");
        return false;
    }
    return (true);
}

function setBtn() {
    $('#btn-login').removeClass('btn-login-active');
    $('#btn-login').removeClass('btn-login-inactive');
    if (isValidFormData()) {
        $('#msg-section').hide();
        $('#btn-login').addClass('btn-login-active');
    } else {
        $('#msg-section').show();
        $('#btn-login').addClass('btn-login-inactive');
    }
}

function setMsg(text) {
    $('#msg-section').show();
    $('#msg').html(text);
}

function onLogin(params) {
    if (!params) return false;
    $.ajax(URI.User.Login(params))
        .done(function (res) {
            sessionStorage.setItem('review-login-info', JSON.stringify(res));
            location.href = '/admin/index.html';
        })
        .fail(function (jqXHR) {
            var json = jqXHR.responseJSON;
            var errorCode;
            var errorMessage;
            if (json) {
                errorCode = json['errorCode'];
                errorMessage = json['errorMessage'];
            }
            console.log(json);
            switch (errorCode) {
                case 'A100101':
                    alert("Request User Not Found!!");
                    break;
                case 'A100102':
                    alert("Password error, please re-enter!!");
                    break;
                default:
                    alert(errorMessage);
                    break;
            }
        });
}
