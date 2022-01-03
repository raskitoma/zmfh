const axios = require('axios');
const Store = require('electron-store');
const store = new Store();
let $ = require('jquery');

zm_groups = store.get('zm_groups');
console.log(zm_groups);
zm_token = '';
zm_auth = '';

// This setttings must be changed accordingly to the devices and moved to json file
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
    zm_protocol = zm_parsed.protocol
    zm_host = zm_parsed.hostname
    zm_port = zm_parsed.port
    zm_path = zm_parsed.path
}

var zm_url_base = '' 

if (store.get('zmToken') != null) {
    var zm_auth = store.get('zmAuth');
    var zm_token = store.get('zmToken');
    var zm_usr = store.get('zmUsr');
}

if (zm_token) {
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
}

// Checking session status    
const check_session = async () => {
    try {
        const resp = await axios.get(zm_url, {headers: headers});
    } catch (err) {
        // Handle Error Here
        console.error(err);
    }
}
