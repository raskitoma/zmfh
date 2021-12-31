let $ = require('jquery');
const ipc = require('electron').ipcRenderer;
const Store = require('electron-store');
const store = new Store();
const axios = require('axios');

if (store.get('zmServer') != null) {
    $('#zmServer').val(store.get('zmServer'))
    var zm_parsed = require('url').parse(store.get('zmServer'))
    zm_protocol = zm_parsed.protocol
    zm_host = zm_parsed.hostname
    zm_port = zm_parsed.port
    zm_path = zm_parsed.path
}

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
            ipc.send('login-success', response.statusText)
        } else {
            console.log('Token is invalid, logging out')
            store.delete('zmToken')
            ipc.send('login-out', 'LOGOUT')
        }
    })

}

$('#btn-cancel').on('click', () => {
    ipc.send('exit-app', 'GOODBYE')
})

$('#btn-login').on('click', () => {
    
    let txtUser=$('#txtUsr').val();
    let txtPwd=$('#txtPwd').val();
    let txtZmServer=$('#zmServer').val();

    var zm_parsed = require('url').parse(txtZmServer);
    zm_protocol = zm_parsed.protocol
    zm_host = zm_parsed.hostname
    zm_port = zm_parsed.port
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

    $('#zmmsg').text('Logging in...')
    $('#zmmsg').html('<img src="assets/img/loading.gif" width="20" height="20" />')
    
    axios.post(zm_url, params, headers)
    .then(function (response) {
        console.log(response)
        if (response.statusText == 'OK') {
            console.log('login success')
            store.set('zmServer', $('#zmServer').val())
            store.set('zmToken', response.data.access_token)
            store.set('zmAuth', response.data.credentials)
            store.set('zmUsr', txtUser)
            ipc.send('login-success', response.statusText)
        } else {
            $('#zmmsg').text('Login failed')
        }
    })
    .catch(function (error) {
        console.log(error)
        $('#zmmsg').text('Login failed: ' + error)
    })

}) 
