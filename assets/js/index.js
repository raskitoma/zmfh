const axios = require('axios');
const Store = require('electron-store');
const store = new Store();
let $ = require('jquery');

// Control variables
var zm_groups = store.get('zm_groups');
var session_live = false;
var zm_token = '';
var zm_auth = '';
var current_group = 0;
var current_monitor = '';
var current_event = 0;
var zm_StartTime = '';
var zm_EndTime = '';
var resp_debug = null;
var cached_events = null;
var zm_live_mode = true;
var cached_subs = [];
var monitors = [];
var numMonitors = 0;
var events = [];
var zm_img_src = '';
var vsub_src = '';
var liveMode=0;

// This setttings must be changed accordingly to the devices and moved to json file
let main_width = 800;
let main_height = 600;
let sub_width = 400;
let sub_height = 300;
let zm_bufm = '100';
let zm_bufs = '10';
let zm_fpsm = '30';
let zm_fpss = '5';
let zm_subreel_request = 1000;
let zm_mainreel_request = 250;
let zm_max_events = 6;
let zm_event_duration = 10;

// Handling functions
function dimOff() {
    document.getElementById("darkLayer").style.display = "none";
    return true;
}

function dimOn() {
    document.getElementById("darkLayer").style.display = "";
    return true;
}

function leftPad(value, length) { 
    return ('0'.repeat(length) + value).slice(-length); 
}

function zm_Live(){
    document.getElementById("v_main_vid").style.display = "none";
    document.getElementById("v_main").style.display = "";
    document.getElementById("btn-live").style.display = "";
    document.getElementById("btn-record").style.display = "none";
    return true;
}

function zm_Record(){
    document.getElementById("v_main").style.display = "none";
    document.getElementById("v_main_vid").style.display = "";
    document.getElementById("btn-live").style.display = "none";
    document.getElementById("btn-record").style.display = "";
    return true;
}

function zm_select_enable() {
    document.getElementById("zm_events").disabled = false;
    return true;
}

function zm_select_disable() {
    document.getElementById("zm_events").disabled = true;
}

// Getting vars from store
if (store.get('zmServer') != null) {
    $('#zmServer').val(store.get('zmServer'))
    var zm_parsed = require('url').parse(store.get('zmServer'))
    var zm_protocol = zm_parsed.protocol
    var zm_host = zm_parsed.hostname
    var zm_port = zm_parsed.port
    var zm_path = zm_parsed.path
}

var zm_url_base = '' 

if (store.get('zmToken') != null) {
    zm_token = store.get('zmToken');
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
    
    var headers = {
        'Authorization': 'Basic ' + store.get('zmToken'),
        'Content-Type': 'application/json'
    }

    var zm_url = zm_url_base + '/api/groups.json?token=' + store.get('zmToken')
}

// Checking session status    
const check_session = async () => {
    try {
        const resp = await axios.get(zm_url, {headers: headers});
        if (resp.status == 200) {
            session_live = true;
            return true;
        } else {
            session_live = false;
            return false;
        }
    } catch (err) {
        // Handle Error Here
        console.error(err);
        return false;
    }
}

const get_events = async () => {
    console.log('Getting events');
    var zm_rand = Math.floor(10000 + Math.random() * 90000)
    zm_StartTime = 'StartTime%20>=:' + zm_StartTime;
    zm_EndTime = 'EndTime%20<=:' + zm_EndTime;
    var zm_events_url = zm_url_base + '/api/events/index/MonitorId:' + current_monitor + '/' + zm_StartTime + '/' + zm_EndTime + '.json?token=' + store.get('zmToken') + '&rand=' + zm_rand +  '&sort=StartTime&direction=desc&limit=10';
    console.log('Sending request to: ' + zm_events_url);
    try {
        console.log('Launching...');
        const response = await axios.get(zm_events_url);
        console.log('Request sent');
        console.log(response.data);
        if (response.status == 200) {
            console.log('Response: ' + response.status);
            console.log(response.data);
            cached_events = response.data.events;
            var events_qty = response.data.events.length;
            if (events_qty == 0) {
                console.log('No events found');
                zm_Live();
                zm_upd_main(current_monitor, 'v_main');
                return false;
            }
            console.log(cached_events);
            var oldest_event = cached_events.length - 1;
            current_event = cached_events[oldest_event].Event.Id;
            return true;
        }
        return false;
    } catch(error) {
        console.log(error);
        return false;
    }
}

function zm_draw_events () {
    var zm_event_obj = document.getElementById('zm_events');
    zm_event_obj.innerHTML = '';
    var dt = new Date();
    var current_near_minutes = leftPad((((dt.getMinutes() + 7.5)/zm_event_duration | 0) * zm_event_duration) % 60,2);
    for (var i = 0; i <= zm_max_events; i++) {
        var normalized_date = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours(), current_near_minutes, 0, 0);
        normalized_date = new Date(normalized_date - (i * zm_event_duration * 60 * 1000));
        var date_pt01 = normalized_date.getFullYear() + '-' + leftPad(normalized_date.getMonth() + 1,2) + '-' + leftPad(normalized_date.getDate(),2)
        var date_pt02 = leftPad(normalized_date.getHours(),2) + ':' + leftPad(normalized_date.getMinutes(),2) + ':00';
        var zm_time = date_pt01 + ' ' + date_pt02;
        var zm_time_o = date_pt01 + '%20' + date_pt02;
        $(zm_event_obj).append($('<option>',
            {
                value: zm_time_o,
                text: zm_time
            }));
    }
    $(zm_event_obj).prop("selectedIndex", 0).val();
}

function select_events () {
    zm_EndTime = $('#zm_events').val();
    var endtime = new Date($('#zm_events').val().replace("%20", " "));
    endtime = new Date(endtime - (zm_event_duration * 60 * 1000));
    var date_pt01 = endtime.getFullYear() + '-' + leftPad(endtime.getMonth() + 1,2) + '-' + leftPad(endtime.getDate(),2)
    var date_pt02 = leftPad(endtime.getHours(),2) + ':' + leftPad(endtime.getMinutes(),2) + ':00';
    zm_StartTime = date_pt01 + '%20' + date_pt02;
}

function launch_event(){
    select_events();
    get_events();
    zm_Record();
    zm_main_playback();
    zm_live_mode = false;
}

function ready_events() {
    zm_draw_events();
    select_events();
    zm_select_enable();
}


