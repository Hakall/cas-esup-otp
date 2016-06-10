var code_send = false;
var last_transport = '';
var auth_div;
var user_hash='changeit';

function request(opts, callback, next) {
    var req = new XMLHttpRequest();
    req.open(opts.method, opts.url, true);
    req.onerror = function(e) { 
        console.log(e);
        code_send = false;
    };
    req.onreadystatechange = function(aEvt) {
        if (req.readyState == 4) {
            if (req.status == 200) {
                var responseObject = JSON.parse(req.responseText);
                if (typeof(callback) === "function") callback(responseObject);
            }
            if (typeof(next) === "function") next();
        }
    };
    req.send(null);
}


function send_code(transport, method) {
    if (!code_send) {
        if (document.getElementById('usernameLabel').innerHTML != '') {
            code_send = true;
            last_transport = transport;
            request({ method: 'POST', url: url_esup_otp + '/users/'+ document.getElementById('usernameLabel').innerHTML +'/methods/'+ method +'/transports/'+ transport +'/'+ user_hash }, function(response) {
                if (response.code == "Ok") {
                    success_message(strings.success.transport + transport);
                    hide_methods();
                } else {
                    errors_message(strings.error.message + response.message);
                }
                code_send = false;
            });
        } else errors_message(strings.error.login_needed);
    } else {
        errors_message(strings.error.transport_wait + ' ' + last_transport);
    }
};



function get_user_auth() {
	if(document.getElementById('username')){
    if (document.getElementById('username').value != '') {
    		user_hash = getUserHash();
            get_user_infos();
    } else errors_message(strings.error.login_needed);
    }
}

function get_user_infos() {
    $('#auth-option').hide();
    request({ method: 'GET', url: url_esup_otp + '/users/' + document.getElementById('username').value + '/' + user_hash }, function(response) {
        if (response.code == "Ok") {
        	$('#own-code').show();
        	$('#instructions_username').hide();
        	$('#instructions_transport').show();
        	methods_labels(response);
        	transports_labels(response);
        } else {
            errors_message(strings.error.message + response.message);
        }
    });
};

function transports_labels(data){
	if (!data.user.transports.sms) {
        $('.sms').remove();
    } else {
        $('.label-sms').val(strings.label.sms + data.user.transports.sms+' '+'\uf10b');
    }
    if (!data.user.transports.mail) {
        $('.mail').remove();
    } else {
        $('.label-mail').val(strings.label.mail + data.user.transports.mail+' '+'\uf0e0');
    }
    $('#list-methods').show();
    var username = document.getElementById('username').value;
    $('#username').hide();
    document.getElementById("buttonMethods").style.display="none";
    $('#usernameLabel').empty();
    $('#usernameLabel').html(username);
    //document.getElementById("resetUsername").style.display="inline-block";
    reset_message();
}

function methods_labels(data) {
    var methods_exist = false;
    for (method in data.user.methods) {
        if (data.user.methods[method].active) {
            methods_exist = true;
            if (data.user.methods[method].transports.indexOf('sms') >= 0 || data.user.methods[method].transports.indexOf('mail') >= 0) {
                $('#list-methods').append("<h3 style='margin-top:15px;'>" + strings.method[method] + "</h3>");
                if (data.user.methods[method].transports.indexOf('sms') >= 0) $('#list-methods').append("<div class='method-row sms'><input class='button transport label-sms' type='button' value='"+strings.button.send.sms+" &#xf10b;' onclick='send_code(\"sms\", \"" + method + "\");'></div>");
                if (data.user.methods[method].transports.indexOf('mail') >= 0) $('#list-methods').append("<div class='method-row mail'><input class='button transport label-mail' type='button' value='"+strings.button.send.mail+" &#xf0e0;' onclick='send_code(\"mail\", \"" + method + "\");'></div>");
            }
            $('#list-methods').show();
        }
        if (!methods_exist) show_auth_option();
    }
}


function init() {
    auth_div = $('#auth');
    $('#auth').remove();
    $('#auth-option').hide();
    $('#list-methods').hide();
    $('#resetUsername').hide();
    get_user_auth();
};

function success_message(message) {
    $('#msg2').attr('class', 'alert alert-success');
    $('#msg2').html(message);
    $('#msg2').show();
    $("#msg2").fadeTo(3500, 500).slideUp(300, function(){
        $("#msg2").hide();
    });
}

function errors_message(message) {
    $('#msg2').attr('class', 'alert alert-danger');
    $('#msg2').html(message);
    $("#msg2").fadeTo(3500, 500).slideUp(300, function(){
        $("#msg2").hide();
    });
}

function reset_message() {
    $('#msg2').html('');
    $('#msg2').hide();
}

function reset_username() {
	$('#lost-code').hide();
    $('#list-methods').hide();
    $('#list-methods').empty();
    $('#auth').hide();
    $('#auth-option').hide();
    $('#msg2').hide();
    $('#submit').attr('type', '');
    document.getElementById("resetUsername").style.display="none";
    $('#usernameLabel').html('');
    $('#username').show();
    document.getElementById("buttonMethods").style.display="inline-block";
}

function hide_methods() {
	show_auth_form();
    $('#list-methods').hide();
    $('#own-code').hide();
}

function show_methods() {
	$('#list-methods').show();
	$('#auth-option').hide();
	$('#auth').hide();
	$('#lost-code').hide();
	$('#own-code').show();
    $('#instructions_transport').show();
    $('#instructions_code').hide();
}

function show_auth_form(){
	show_auth_option();
    $('#auth').show();
    $('#lost-code').show();
    $('#instructions_transport').hide();
    $('#instructions_code').show();
}

function show_auth_option(){
    $('#auth-option').show();
    auth_div.insertAfter('#list-methods');
    $('#auth').hide();
    $('#submit').attr('type', 'submit');
}