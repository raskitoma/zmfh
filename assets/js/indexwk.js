const ipc = require('electron').ipcRenderer;

function check_obj(obj){
    if (obj == null) {
        return false;
    }
    return true;
}

function zm_draw_group_list(my_group, html_obj) {
    for (var key_group in my_group) {
        var zm_group_html = '<button class="btn btn-outline-dark no-drag" onclick="zm_open_group(zm_groups, \'' + key_group + '\',\'v_main\',\'v_sub\');"><i class="fa fa-circle"></i> ' + my_group[key_group].name + '</button><br>';
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

    cached_subs.forEach(
        function(sub_obj) {
            $(sub_obj).remove();
        }
    )
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
    zm_main_img.setAttribute('class', 'video-main no-drag' );
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
                ipc.send('login-out', 'LOGOUT');
            }
    },1500);
    setInterval(function(){
        // Check if the user is logged in
        check_session();
        if (session_live) {
            dimOff();
        } else {
            dimOn();
            ipc.send('login-out', 'LOGOUT');
        }
    },120000);

})

// App button control
$('#btn-exit').on('click', function() {
    dimOn();
    ipc.send('exit-app', 'GOODBYE');
})

$('#btn-logoff').on('click', function() {
    dimOn();
    store.delete('zmToken');
    ipc.send('login-out', 'LOGOUT');
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
