const { systemPreferences } = require('electron');

function check_obj(obj){
    if (obj == null){ return false; }
    return true;
}

function zm_draw_group_list(my_group, html_obj) {
    for (var key_group in my_group) {
        var zm_group_html = '<button class="btn btn-light no-drag" onclick="zm_open_group(zm_groups, \'' + key_group + '\',\'v_main\',\'v_sub\');"><i class="fa fa-circle"></i> ' + my_group[key_group].name + '</button><br>';
        zm_group_html += '<br />'; 
        document.getElementById(html_obj).innerHTML += zm_group_html;
    }
    return true;
} // end zm_draw_group_list

function zm_get_monitors_from_group(my_group, group_name) {
    return my_group[group_name].monitors;
} // end zm_get_monitors_from_group

function zm_open_group(my_group, group_name) {
    if (current_group == group_name) {
        zm_live_mode = true;
        return
    } else {
        var current_group = group_name;
    }

    if (cached_subs) {
        cached_subs.forEach(
            function(sub_obj) {
                $(sub_obj).remove();
            }
        )
    }
    var monitors = zm_get_monitors_from_group(my_group, group_name);
    var video_sub = document.getElementById('monitors');
    video_sub.innerHTML = '';
    window.stop(); // to kill any mjpeg actually running before starting a new one
    var current_monitor = monitors[0];
    var cached_subs = [];
    for (var monitor in monitors) {
        var zm_connkey = new Date().getTime();
        var zm_rand = new Date().getTime();
        var monitor_id = monitors[monitor];
        var vsub_href = '<a onclick="zm_upd_main(' + monitor_id + ')" href="#" id="vsub_' + monitor_id + '"></a>';
        video_sub.innerHTML += vsub_href;
        var vsub_obj = document.getElementById('vsub_' + monitor_id);
        var sub_img = new Image(); 
        var vsub_src = zm_url_base + "/cgi-bin/nph-zms?scale=50&mode=single&maxfps=" + zm_fpss + "&monitor=" + monitor_id + "&token=" + zm_token + "&connkey=" + zm_connkey + "&rand=" + zm_rand;
        var vsub_class = 'video-sub no-drag shadow';
        sub_img.setAttribute('class', vsub_class);
        sub_img.setAttribute('src', vsub_src);
        sub_img.setAttribute('id', 'vv_' + monitor_id);
        vsub_obj.appendChild(sub_img);
        cached_subs.push('vsub_' + monitor_id);
    }
    zm_upd_main(current_monitor);
    reload_img();
    return true;
} // end zm_open_group

function zm_upd_main(monitor) {
    var video_main = document.getElementById('v_main');	
    if (monitor == current_monitor) {
        console.log('same monitor');
        return;
    } else {
        ready_events();
        video_main.innerHTML = '';
        var current_monitor = monitor;
    }
    if (zm_live_mode) {
        zm_Live();
    } else {        
        launch_event();
        return true;
    }

    var zm_connkey = new Date().getTime();
    var zm_main_src_mjpeg = zm_url_base + "/cgi-bin/nph-zms?scale=100&width=" + main_width + "px&height=" + main_height + "px&mode=jpeg&maxfps=" + zm_fpsm + "&monitor=" + monitor + "&token=" + zm_token + "&connkey=" + zm_connkey;
    window.stop(); // to kill any mjpeg actually running before starting a new one
    var zm_main_img = new Image();
    zm_main_img.setAttribute('class', 'video-main no-drag img-fluid' );
    zm_main_img.src = zm_main_src_mjpeg;
    zm_main_img.setAttribute('id', 'v_main_x');
    video_main.appendChild(zm_main_img);
    return true;
} // end zm_upd_main

function reload_img() {
    for (var monitor in monitors) {
        var my_obj = document.getElementById('vv_' + monitorPt[monitor]);
        zm_rand = new Date().getTime();
        my_obj.src = zm_url_base + "/cgi-bin/nph-zms?scale=50&mode=single&maxfps=" + zm_fpss + "&monitor=" + monitorPt[monitor] + "&token=" + zm_token + "&connkey=" + zm_connkey + "&rand=" + zm_rand;
    }
    setTimeout("reload_img()", zm_subreel_request);
    return true;
}

function zm_main_playback() {  
    $('#v_main_x').remove();
    $('#v_main_vid_x').remove();
    window.stop(); // to kill any mjpeg actually running before starting a new one
    var video_obj = document.getElementById('v_main_vid');
    var source = document.createElement('source');
    var video_src = zm_url_base + "/index.php?eid=" + current_event + "&view=view_video&token=" + zm_token;
    source.setAttribute('src', video_src);
    source.setAttribute('type', 'video/mp4');
    source.setAttribute('id', 'v_main_vid_x');
    video_obj.appendChild(source);
    video_obj.play();
    console.log({
        src: source.getAttribute('src'),
        type: source.getAttribute('type'),
    });    
    return true;
}

// Window ready functions
$(window).on('load', function() {
    zm_Live();
    zm_select_disable();
    setTimeout(function(){
        // draw the group list
            zm_draw_group_list(zm_groups, "zm_groups");
            ready_events();
            if (check_session()) {
                dimOff();
            } else {
                dimOn();
                // ipc.send('login-out', 'LOGOUT');
            }
    },1500);
    setInterval(function(){
        // Check if the user is logged in
        check_session();
        if (session_live) {
            dimOff();
        } else {
            dimOn();
        }
    },120000);

})

$('#btn-logoff').on('click', function() {
    dimOn();
    store.delete('zmToken');
    // refresh window 
    ipc.send('refresh-window', 'REFRESH')
})

$('#btn-live').on('click', function() {
    console.log('btn-live');
    if (current_monitor == 0) {
        return;
    }
    launch_event();
})

$('#btn-record').on('click', function() {
    zm_live_mode = true;
    zm_Live();
    zm_upd_main(current_monitor);
})

$('#zm_events').on('change', function() {
    launch_event();
})

$('#btn-qrback').on('click', function() {
    // hide modal myqrscan
    var qrmodal = document.getElementById('myqrscan');
    qrmodal.style.display= 'none';
    qrstream.getTracks()[0].stop();
})


var qrvideo = document.createElement("video");
var canvasElement = document.getElementById("qrcanvas");
var canvas = canvasElement.getContext("2d");
var loadingMessage = document.getElementById("loadingMessage");
var outputContainer = document.getElementById("output");
var outputMessage = document.getElementById("outputMessage");
var outputData = document.getElementById("outputData");
var qrstream;

function drawLine(begin, end, color) {
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.lineWidth = 4;
  canvas.strokeStyle = color;
  canvas.stroke();
}

function tick() {
  loadingMessage.innerText = "⌛ Loading video..."
  if (qrvideo.readyState === qrvideo.HAVE_ENOUGH_DATA) {
    loadingMessage.hidden = true;
    canvasElement.hidden = false;
    outputContainer.hidden = false;

    // canvasElement.height = qrvideo.videoHeight;
    // canvasElement.width = qrvideo.videoWidth;
    canvasElement.height = 240;
    canvasElement.width = 320;
    canvas.drawImage(qrvideo, 0, 0, canvasElement.width, canvasElement.height);
    var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);
    var code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    if (code) {
      drawLine(code.location.topLeftCorner, code.location.topRightCorner, "#FF3B58");
      drawLine(code.location.topRightCorner, code.location.bottomRightCorner, "#FF3B58");
      drawLine(code.location.bottomRightCorner, code.location.bottomLeftCorner, "#FF3B58");
      drawLine(code.location.bottomLeftCorner, code.location.topLeftCorner, "#FF3B58");
      outputMessage.hidden = true;
      outputData.parentElement.hidden = false;
      outputData.innerText = code.data;
      // Check if code.data is a valid json
        try {
            var json = JSON.parse(code.data);
            if (json.usr) {
                console.log(json);
                login_qr(json);
                // hide modal myqrscan
                var qrmodal = document.getElementById('myqrscan');
                qrmodal.style.display= 'none';
                qrstream.getTracks()[0].stop();
                return true;
            }
        } catch (e) {
            console.log(e, 'not a valid json');
        }
    } else {
      outputMessage.hidden = false;
      outputData.parentElement.hidden = true;
    }
  }
  requestAnimationFrame(tick);
}

$('#btn-qrcode').on('click', function() {
    // show modal myqrscan
    var qrmodal = document.getElementById('myqrscan');
    qrmodal.style.display= 'block';

    // electronjs request access to camera
    navigator.mediaDevices.getUserMedia({video: true})
    .then(function(stream) {
            qrstream = stream;
            qrvideo.srcObject = stream;
            qrvideo.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
            qrvideo.play();
            requestAnimationFrame(tick);
        }).catch(function(err) {
            console.log('Access denied');
        });
                    
    return true;
})

 
function login_qr(my_json) {
    console.log('Logging in')
    
    let txtUser=my_json.usr;
    let txtPwd=my_json.pwd;
    let txtZmServer=my_json.srv;

    console.log('QR --> User: ' + txtUser, 'Pwd: ' + txtPwd, 'ZmServer: ' + txtZmServer);

    var zm_parsed = require('url').parse(txtZmServer);
    zm_protocol = zm_parsed.protocol
    zm_host = zm_parsed.hostname
    zm_port = (zm_parsed.port) ? zm_parsed.port : 80;
    zm_path = zm_parsed.path
    
    console.log('ZmProtocol: ' + zm_protocol, 'ZmHost: ' + zm_host, 'ZmPort: ' + zm_port, 'ZmPath: ' + zm_path);

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

    console.log('QR Login:', zm_url);

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
            // hide modal obj_login
            console.log('Session is valid');
            obj_login.style.display = "none";
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
        $('#zmmsg').text('Invalid QR Data: ' + error)
        return false;
    })

}