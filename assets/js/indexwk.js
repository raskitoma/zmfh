const ipc = require('electron').ipcRenderer;

function check_obj(obj){
    if (obj == null) {
        return false;
    }
    return true;
}

function zm_draw_group_list(my_group, html_obj) {
    for (var key_group in my_group) {
        zm_group_html = '<button class="btn btn-outline-dark no-drag" onclick="zm_open_group(zm_groups, \'' + key_group + '\',\'v_main\',\'v_sub\');"><i class="fa fa-circle"></i> ' + my_group[key_group].name + '</button><br>';
        zm_group_html += '<br />'; 
        zm_output_obj = html_obj;
        document.getElementById(html_obj).innerHTML += zm_group_html;
    }
    return true;
}

function zm_get_monitors_from_group(my_group, group_name) {
    return my_group[group_name].monitors;
}

function zm_open_group(my_group, group_name, v_main, v_sub) {
    if (current_group == group_name) {
        zm_live_mode = true;
        return
    } else {
        current_group = group_name;
    }

    cached_subs.forEach(
        function(sub_obj) {
            $(sub_obj).remove();
        }
    )
    monitors = zm_get_monitors_from_group(my_group, group_name);
    var video_sub = document.getElementById(v_sub);
    video_sub.innerHTML = '';
    var first_monitor = monitors[0];
    cached_subs = [];
    for (var monitor in monitors) {
        zm_connkey = Math.floor(100000 + Math.random() * 900000)
        zm_rand = Math.floor(10000 + Math.random() * 90000)
        monitor_id = monitors[monitor];
        vsub_href = '<a onclick="zm_upd_main(' + monitor_id + ',\''+ v_main + '\')" href="#" id="vsub_' + monitor_id + '"></a>';
        video_sub.innerHTML += vsub_href;
        var vsub_obj = document.getElementById('vsub_' + monitor_id);
        sub_img = new Image(); 
        vsub_src = zm_url_base + "/cgi-bin/nph-zms?scale=50&mode=single&maxfps=" + zm_fpss + "&monitor=" + monitor_id + "&token=" + zm_token + "&connkey=" + zm_connkey + "&rand=" + zm_rand;
        console.log(vsub_src);
        vsub_class = 'video-sub no-drag shadow';
        sub_img.setAttribute('class', vsub_class);
        sub_img.setAttribute('src', vsub_src);
        sub_img.setAttribute('id', 'vv_' + monitor_id);
        sub_img.setAttribute('on_load', function(){
            setTimeout(function(){
                document.getElementById('vv_' + monitor_id).src = vsub_src;
            }, zm_subreel_request);
        });
        vsub_obj.appendChild(sub_img);
        cached_subs.push('vsub_' + monitor_id);
    }
    zm_upd_main(first_monitor, v_main);
    return true;
}

function zm_upd_main(monitor, v_main) {
    var video_main = document.getElementById(v_main);
    if (current_monitor == monitor) {
        ready_events();
        return true;
    } else {
        current_monitor = monitor;
        $('#v_main_x').remove();
    }
    ready_events();
    if (zm_live_mode) {
        zm_Live();
    } else {        
        launch_event();
        return true;
    }
    var zm_connkey = Math.floor(100000 + Math.random() * 900000)
    var zm_main_img = new Image();
    zm_main_img.setAttribute('class', 'video-main no-drag' ); // app-draggable');
    var zm_img_src = zm_url_base + "/cgi-bin/nph-zms?scale=100&width=" + main_width + "px&height=" + main_height + "px&mode=jpeg&maxfps=" + zm_fpsm + "&monitor=" + monitor + "&token=" + zm_token + "&connkey=" + zm_connkey;
    zm_main_img.src = zm_img_src;
    zm_main_img.setAttribute('id', 'v_main_x');
    video_main.appendChild(zm_main_img);
    //refresh_main();
    return true;
}

function zm_main_playback() {  
    $('#v_main_x').remove();
    $('#v_main_vid_x').remove();
    var video_obj = document.getElementById('v_main_vid');
    var source = document.createElement('source');
    var zm_connkey = Math.floor(100000 + Math.random() * 900000)
    var zm_rand = Math.floor(10000 + Math.random() * 90000)
    video_src = zm_url_base + "/index.php?eid=" + current_event + "&view=view_video&token=" + zm_token;
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

function refresh_main () {
    console.log('refresh_main');
    var obj = document.getElementById('v_main_x');
    if (!obj) {
        setTimeout( refresh_main(), zm_mainreel_request );
        return true;
    }
    if (!obj.complete){
        console.log('refresh_main: not completed');
        setTimeout( refresh_main(), zm_mainreel_request );
        return true;
    }
    var zm_rand = Math.floor(10000 + Math.random() * 90000)
    obj.src = zm_img_src + '#rand=' + zm_rand;
    return true;
}

// Window ready functions
$(window).on('load', function() {
    zm_Live();
    zm_select_disable();
    setTimeout(function(){
        // draw the group list
            zm_draw_group_list(zm_groups, "zm_groups");
            zm_draw_events();
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
    if (current_monitor == 0) {
        return;
    }
    launch_event();
})

$('#btn-record').on('click', function() {
    zm_live_mode = true;
    zm_Live();
    zm_upd_main(current_monitor, 'v_main');
})

$('#zm_events').on('change', function() {
    launch_event();
})