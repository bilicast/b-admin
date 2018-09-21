/*************************************************************************************************
 *
 * INITIALIZE
 *
 *************************************************************************************************/
$(document).ready(function (e) {
    _common.init();
});

var _common = {

    init: function () {
        this.init_userProfile();
        this.init_alink();
    },

    init_userProfile: function () {
        globalInfo.userProfile = sessionStorage.getItem('review-login-info');
        console.log("session: " + location.pathname);
        if (location.pathname == '/login/login.html')
            return;

        if (!globalInfo.userProfile) {
            (location.pathname != '/login/login.html') && (location.href = '/login/login.html');
        } else {
            globalInfo.userProfile = JSON.parse(globalInfo.userProfile);
            // this.checkUser();
        }
    },

    clear_userProfile: function () {
        sessionStorage.setItem('review-login-info', null);
    },


    init_alink: function () {
        var owner = this;
        $("#logout").on('click', function (e) {
            owner.executeLogout();
        })
    },

    checkUser: function () {
        var owner = this;
        $.ajax(URI.User.Check())
            .done(function (res) {
            })
            .fail(function (res) {
                // showLogin();
            });

    },

    executeLogout: function () {
        var owner = this;
        $.ajax(URI.User.Logout())
            .done(function (res) {
                showLogin();
            })
            .fail(function (res) {
                showLogin();
            });
    },
}

var globalInfo = {
    userProfile: null,
}


function replaceAll(find, replace, str) {
    try {
        find = find.replace('{', '\\{');
        find = find.replace('}', '\\}');
        return str.replace(new RegExp(find, 'g'), replace);
    }
    catch (err) {
        return "";
    }
}

function timestampToDate(timestamp) {
    if (timestamp == null) return ('-');

    var date = new Date(timestamp);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    var retVal = year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day) + " "
        + (hours < 10 ? "0" + hours : hours) + ":"
        + (minutes < 10 ? "0" + minutes : minutes) + ":"
        + (seconds < 10 ? "0" + seconds : seconds);
    ;
    return (retVal);
}

function timestampToTime(timestamp) {
    if (timestamp == null) return ('');

    var date = new Date(timestamp);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();

    var retVal = (hours < 10 ? "0" + hours : hours) + ":"
        + (minutes < 10 ? "0" + minutes : minutes) + ":"
        + (seconds < 10 ? "0" + seconds : seconds);
    return (retVal);
}


var URI = {
    Hello: {
        Init: function (params) {
            return build('/hello', params, {type: 'GET'});
        }
    },

    User: {
        Login: function (params) {
            return build('/accounts/users/login', params, {type: 'POST'});
        },
        Logout: function (params) {
            return build('/accounts/users/logout', params, {type: 'DELETE'});
        },
        Check: function (params) {
            return build('/accounts/users', params, {type: 'GET'});
        },
        List: function (params) {
            return build('/users', params, {type: 'GET'});
        },
        Join: function (params) {
            return build('/users', params, {type: 'POST'});
        },
        Update: function (params) {
            return build('/users/{userId}', params, {type: 'PUT'});
        }
    },

    Tag: {
        Trends: function (params) {
            return build('/hashtags/trends', params, {type: 'GET'});
        },
        Update: function (params) {
            return build('/hashtags/trends', params, {type: 'POST'});
        },

    },
    Post: {
        List: function (params) {
            return build('/reviews', params, {type: 'GET'});
        },
        Add: function (params) {
            return build('/reviews', params, {type: 'POST'});
        },
        Update: function (params) {
            return build('/reviews/{postId}', params, {type: 'PUT'});
        },
    },
    Keywords: {
        List: function (params) {
            return build('/searchs/keywords', params, {type: 'GET'});
        },
    },
}


var X_REVIEW_CHANNEL = 'WEB';

var VERSION = '/private/v1';
var LEVEL = {
    NORMAL: 'NORMAL',
    ADMIN: 'ADMIN',
};

function build(endPoint, params, reqInfo) {
    var matches = endPoint.match(/\{[\w\-]+\}/g);
    var uri = VERSION;

    reqInfo.dataType = 'json';
    reqInfo.contentType = 'application/json; charset=UTF-8';

    if (reqInfo.type == 'GET') {
        reqInfo.data = params;
    } else {
        reqInfo.data = JSON.stringify(params);
    }

    if (!!params) {
        $(matches).each(function (index, m) {
            endPoint = endPoint.replace(m, params[m.match(/[\w\-\_]+/)[0]]);
        });
    }

    return $.extend({
        url: uri + endPoint,
        headers: {
            'X-REVIEW-CHANNEL': X_REVIEW_CHANNEL,
            'X-REVIEW-TOKEN': getReivewToken(),
        }
    }, reqInfo);
}

function getReivewToken() {
    if (!!globalInfo.userProfile)
        return globalInfo.userProfile.token;
    return '';
}

function isValidEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function prtStatus(status) {
    if (status == 'ACTV') {
        return ("<option value='ACTV' selected>ACTV</option><option value='HIDD'>HIDDEN</option>");
    } else {
        return ("<option value='ACTV'>ACTV</option><option value='HIDD' selected>HIDDEN</option>");
    }
}

function showLogin() {
    _common.clear_userProfile();
    location.href = '/login/login.html';
}

function checkToken(jqXHR) {
    var json = jqXHR.responseJSON;
    var errorCode;
    if (json) {
        errorCode = json['errorCode'];
    }
    switch (errorCode) {
        case 'A100207':
            showLogin();
            break;
    }
}

function showMessage(status, text) {
    $('.notification-alert').removeClass('alert-danger');
    $('.notification-alert').removeClass('alert-success');
    if (status) {
        $('.notification-alert').addClass('alert-success');
    } else {
        $('.notification-alert').addClass('alert-danger');
    }
    $('.notification-alert').html(text);
    $('.notification-alert').fadeIn("slow");
    $('.notification-alert').delay(1000).fadeOut("slow");

}


