function check_obj(obj){
    if (obj == null) {
        return false;
    }
    return true;
}

function zm_draw_group_list(my_group, html_obj) {
    for (var key_group in my_group) {
        zm_group_html = '<button class="btn btn-outline-dark" onclick="zm_open_group(zm_groups, \'' + key_group + '\',\'v_main\',\'v_sub\');"><i class="fa fa-circle"></i> ' + my_group[key_group].name + '</button><br>';
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
    console.log('Cleaning containers');
    document.getElementById(v_sub).innerHTML = ' ';
  
    first_monitor = monitors[0];
 
    console.log('------------- Drawing childs! --------------');

    for (var monitor in monitors) {
        zm_connkey = Math.floor(100000 + Math.random() * 900000)
        zm_rand = Math.floor(10000 + Math.random() * 90000)
        html_obj_vsub = '<a onclick="zm_upd_main(' + monitors[monitor] + ',\''+ v_main + '\')" href="#"><img class="video-sub shadow-sm" src="' + zm_url_base + "/cgi-bin/nph-zms?scale=50&width=" + sub_width + "&height=" + sub_height + "&mode=jpeg&maxfps=" + zm_fpss + "&buffer=" + zm_bufs + "&monitor=" + monitors[monitor] + "&token=" + zm_token + "&" + zm_auth + "&connkey=" + zm_connkey + "&rand=" + zm_rand + '" /></a>';
        document.getElementById(v_sub).innerHTML += html_obj_vsub;
        console.log('Drawing monitor: ' + monitors[monitor]);
        console.log(html_obj_vsub);
    }

    console.log('Calling main!');

    zm_upd_main(first_monitor, v_main);

    console.log('Done!');
    console.log('-------------- Done Whole Drawing Procedure ----------------------');

}

function zm_upd_main(monitor, v_main) {
    console.log('------------------ Drawing Main ------------------');
    console.log(v_main);
    console.log(zm_auth);  
    console.log(document.getElementById(v_main).innerHTML.length);
    console.log(monitor);
    console.log('Cleaning containers');
    document.getElementById(v_main).innerHTML = '';
    console.log(document.getElementById(v_main).innerHTML.length);
    zm_connkey = Math.floor(100000 + Math.random() * 900000)
    zm_rand = Math.floor(10000 + Math.random() * 90000)
    html_obj_vmain = '<img class="video-main shadow-sm" src="' + zm_url_base + "/cgi-bin/nph-zms?scale=100&width=" + main_width + "&height=" + main_height + "&mode=jpeg&maxfps=" + zm_fpsm + "&buffer=" + zm_bufm + "&monitor=" + monitor + "&token=" + zm_token + "&" + zm_auth + "&connkey=" + zm_connkey + "&rand=" + zm_rand + '" />';
    // html_obj_vmain = '<img class="v-main" src="' + zm_url_base + "/cgi-bin/nph-zms?scale=100&mode=jpeg&maxfps=30&buffer=1000&monitor=" + monitor + "&token=" + zm_token + "&connkey=" + zm_connkey + "&rand=" + zm_rand + '" />';
    console.log(html_obj_vmain);
    console.log('Drawing main!');
    if (document.getElementById(v_main).innerHTML.length == 0) {
        document.getElementById(v_main).innerHTML = html_obj_vmain;
        console.log('done with  main!');
    }
    console.log('Done! ------------------');
}

// if window is ready
$(window).on('load', function() {
    // delay 1 seconds
    setTimeout(function(){
        // draw the group list
            zm_draw_group_list(zm_groups, "zm_groups");
        },3000);
    
})

$('#btn-exit').on('click', function() {
    dimOn();
    ipc.send('exit-app', 'GOODBYE')
})

$('#btn-logoff').on('click', function() {
    dimOn();
    store.delete('zmToken')
    ipc.send('login-out', 'LOGOUT')
})
