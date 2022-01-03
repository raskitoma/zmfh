const ipc = require('electron').ipcRenderer;
//const { set } = require("electron-json-config");

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
        zm_output_obj = "#" + html_obj;
        document.getElementById(html_obj).innerHTML += zm_group_html;
    }
}

function zm_get_monitors_from_group(my_group, group_name) {
    return my_group[group_name].monitors;
}

function zm_open_group(my_group, group_name, v_main, v_sub) {
    monitors = zm_get_monitors_from_group(my_group, group_name);
    console.log(monitors, v_main, v_sub);
    var video_sub = document.getElementById(v_sub);
    video_sub.innerHTML = "";
  
    first_monitor = monitors[0];
 
    console.log('------------- Drawing childs! --------------');

    for (var monitor in monitors) {
        zm_connkey = Math.floor(100000 + Math.random() * 900000)
        zm_rand = Math.floor(10000 + Math.random() * 90000)
        vsub_href = '<a onclick="zm_upd_main(' + monitors[monitor] + ',\''+ v_main + '\')" href="#" id="vsub_' + monitor + '"></a>';
        video_sub.innerHTML += vsub_href;
        var vsub_obj = document.getElementById('vsub_' + monitor);
        console.log('vsub_' + monitor, vsub_obj);
        vsub_src = zm_url_base + "/cgi-bin/nph-zms?scale=50&width=" + sub_width + "&height=" + sub_height + "&mode=jpeg&maxfps=" + zm_fpss + "&buffer=" + zm_bufs + "&monitor=" + monitors[monitor] + "&token=" + zm_token + "&" + zm_auth + "&connkey=" + zm_connkey + "&rand=" + zm_rand;
        var zm_sub_img = new Image();
        zm_sub_img.setAttribute('class', 'video-sub shadow-sm');
        zm_sub_img.src = vsub_src;
        vsub_obj.appendChild(zm_sub_img);
    }

    console.log('Calling main!');

    zm_upd_main(first_monitor, v_main);

    console.log('Done!');
    console.log('-------------- Done Whole Drawing Procedure ----------------------');

}

function zm_upd_main(monitor, v_main) {
    console.log('------------------ Drawing Main Monitor ' + monitor + '------------------');
    zm_connkey = Math.floor(100000 + Math.random() * 900000)
    zm_rand = Math.floor(10000 + Math.random() * 90000)
    var video_main = document.getElementById(v_main);
    var zm_main_img = new Image();
    zm_main_img.setAttribute('class', 'video-main app-draggable');
    zm_img_src = zm_url_base + "/cgi-bin/nph-zms?scale=100&width=" + main_width + "&height=" + main_height + "&mode=jpeg&maxfps=" + zm_fpsm + "&buffer=" + zm_bufm + "&monitor=" + monitor + "&token=" + zm_token + "&" + zm_auth + "&connkey=" + zm_connkey + "#rand=" + zm_rand;
    zm_main_img.src = zm_img_src;
    video_main.innerHTML = "";
    video_main.appendChild(zm_main_img);
}



// Window ready functions
$(window).on('load', function() {
    setTimeout(function(){
        // draw the group list
            zm_draw_group_list(zm_groups, "zm_groups");
            if (check_session()) {
                dimOff();
            } else {
                dimOn();
                ipc.send('login-out', 'LOGOUT');
            }
    },1500);
    setInterval(function(){
        // Check if the user is logged in
        if (check_session()) {
            dimOff();
        } else {
            dimOn();
            ipc.send('login-out', 'LOGOUT');
        }
    },15000);
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
