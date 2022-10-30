const { ipcMain } = require('electron');

if (store.get('zmServer') != null) {
    $('#zmServer').val(store.get('zmServer'))
    var zm_parsed = require('url').parse(store.get('zmServer'))
    zm_protocol = zm_parsed.protocol
    zm_host = zm_parsed.hostname
    zm_port = (zm_parsed.port)?zm_parsed.port:80;
    zm_path = zm_parsed.path
}

obj_login = document.getElementById('login-entry');

if (store.get('zmToken') != null) {
    // Token exists, confirm it and login
    let options = {
        method: 'GET',
        protocol: zm_protocol,
        host: zm_host,
        port: zm_port,
        path: zm_path + '/api/monitors.json?token=' + store.get('zmToken')
    }

    zm_url = options.protocol + '//' + options.host + ':' + options.port + options.path
    
    headers = {
        'Authorization': 'Basic ' + store.get('zmToken'),
        'Content-Type': 'application/json'
    }

    axios.get(zm_url, {headers: headers})
    .then(function (response) {
        console.log(response.data)
        if (response.statusText == 'OK') {
            console.log('Token is valid, logging in')
             // hide modal obj_login
             obj_login.style.display = "none";
        } else {
            console.log('Token is invalid, logging out')
            store.delete('zmToken')
             // hide modal obj_login
             obj_login.style.display = "block";
        }
    })

} else {
    // No token, shows obj_login modal for login
    console.log('No token, showing login modal')
    obj_login.style.display = 'block';
}

$('#btn-cancel').on('click', () => {
    ipc.send('exit-app', 'GOODBYE')
})

$('#btn-login').on('click', () => {
    console.log('Logging in')
   
    let txtUser=$('#txtUsr').val();
    let txtPwd=$('#txtPwd').val();
    let txtZmServer=$('#zmServer').val();

    console.log('User: ' + txtUser, 'Pwd: ' + txtPwd, 'ZmServer: ' + txtZmServer);

    var zm_parsed = require('url').parse(txtZmServer);
    zm_protocol = zm_parsed.protocol
    zm_host = zm_parsed.hostname
    zm_port = (zm_parsed.port) ? zm_parsed.port : 80;
    zm_path = zm_parsed.path
    
    let options = {
        method: 'POST',
        protocol: zm_protocol,
        host: zm_host,
        port: zm_port,
        path: zm_path + '/api/host',
    }


    let params = new URLSearchParams();
    params.append('user', txtUser);
    params.append('pass', txtPwd);
    params.append('stateful', 1);

    let headers = {
        'Content-Type': 'application/json',
        'Content-Length': params.length
    }

    zm_url = options.protocol + '//' + options.host + ':' + options.port + options.path + '/login.json'

    console.log(zm_url);

    $('#zmmsg').text('Logging in...')
    $('#zmmsg').html('<img src="assets/img/loading.gif" width="15" height="15" />')
    
    axios.post(zm_url, params, headers)
    .then(function (response) {
        console.log(response)
        if (response.statusText == 'OK') {
            console.log('login success')
            store.set('zmServer', $('#zmServer').val())
            store.set('zmToken', response.data.access_token)
            store.set('zmAuth', response.data.credentials)
            store.set('zmUsr', txtUser)
            store.set('zmPwd', txtPwd)
            // hide login modal
            obj_login.style.display = 'none';
            zm_auth = response.data.credentials;
            zm_token = response.data.access_token;
            console.log(zm_auth, '-----------------', zm_token);
            // refresh window 
            ipc.send('refresh-window', 'REFRESH')
            // launch_event();
            return true;
        } else {
            $('#zmmsg').text('Login failed')
            return false;
        }
    })
    .catch(function (error) {
        $('#zmmsg').text('Login failed: ' + error)
        return false;
    })

}) 
