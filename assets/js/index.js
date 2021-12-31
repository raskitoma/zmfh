let $ = require('jquery');
const ipc = require('electron').ipcRenderer;
const Store = require('electron-store');
const store = new Store();
const axios = require('axios');

zm_groups = store.get('zm_groups');

zm_token = '';
zm_auth = '';

let main_width = 800 // $(window).width();
let main_height = 600 // $(window).height();
let sub_width = 400;
let sub_height = 300;
let zm_bufm = '100';
let zm_bufs = '10';
let zm_fpsm = '30';
let zm_fpss = '5';    

function dimOff() {
    document.getElementById("darkLayer").style.display = "none";
}

function dimOn() {
    document.getElementById("darkLayer").style.display = "";
}

// Getting vars from store
if (store.get('zmServer') != null) {
    $('#zmServer').val(store.get('zmServer'))
    var zm_parsed = require('url').parse(store.get('zmServer'))
    console.log(zm_parsed)
    zm_protocol = zm_parsed.protocol
    zm_host = zm_parsed.hostname
    zm_port = zm_parsed.port
    zm_path = zm_parsed.path
}

var zm_url_base = '' 

if (store.get('zmToken') != null) {
    // Token exists, confirm it and login
    let options = {
        method: 'GET',
        protocol: zm_protocol,
        host: zm_host,
        port: zm_port,
        path: zm_path
    }

    zm_url_base = options.protocol + '//'  + options.host + ':' + options.port + options.path
    
    headers = {
        'Authorization': 'Basic ' + store.get('zmToken'),
        'Content-Type': 'application/json'
    }

    zm_url = zm_url_base + '/api/groups.json?token=' + store.get('zmToken')

    // checking if token is valid, if not, logout from app
    axios.get(zm_url, {headers: headers})
    .then(function (response) {
        if (response.statusText == 'OK') {
            console.log('Token is valid, logging in')
            zm_token = store.get('zmToken')
            zm_auth = store.get('zmAuth')
            ipc.send('login-success', response.statusText)
            dimOff();
        } else {
            dimOn();
            console.log('Token is invalid, logging out')
            store.delete('zmToken')
            ipc.send('login-out', 'LOGOUT')
        }
    })

}

