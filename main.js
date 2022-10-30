const electron = require('electron');
const { app, BrowserWindow, ipcMain, protocol } = electron;
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const { all } = require('electron-json-config');
const store = new Store();

let win

let rawdata = fs.readFileSync(path.resolve(__dirname, './assets/config/groups.json'));
let zm_groups = JSON.parse(rawdata);
store.set('zm_groups', zm_groups)

protocol.registerSchemesAsPrivileged([{
    scheme: 'app',
    privileges: { secure: true } 
}]);

const createWindow = () => {
  // Create the browser window. 
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        show: true,
        frame: false,
        icon: path.join(__dirname, 'assets/img/bot.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.loadFile('index.html')
    // child = new BrowserWindow({
    //     parent: win,
    //     width: 995,
    //     height: 550,
    //     frame: false,
    //     resizable: false,
    //     show: false,
    //     icon: path.join(__dirname, 'assets/img/bot.png'),
    //     webPreferences: {
    //         nodeIntegration: true,
    //         contextIsolation: false
    //     }
    // })
    win.openDevTools()
}

ipcMain.on('exit-app', (event, arg) => {
    if(arg=='GOODBYE'){
        app.quit()
    }
})

ipcMain.on('login-success', (event, arg) => {
    if(arg=='THANKS'){
        alert('Great!');
    }
})

ipcMain.on('refresh-window', (event, arg) => {
    if(arg=='REFRESH'){
        win.reload()
    }
})

app.whenReady(). then(() => {
    createWindow()
})

// quit app when all windows are closed
app.on('window-all-closed', () => {
    app.quit()
})