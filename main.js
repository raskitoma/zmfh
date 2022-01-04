// Modules to control application life and create native browser window
const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const store = new Store();

let win
let child

let rawdata = fs.readFileSync(path.resolve(__dirname, './assets/config/groups.json'));
let zm_groups = JSON.parse(rawdata);
store.set('zm_groups', zm_groups)

function createWindows () {
  // Create the browser window. 
    win = new BrowserWindow({
        width: 1920,
        height: 1080,
        show: false,
        frame: false,
        icon: path.join(__dirname, 'assets/img/bot.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.loadFile('index.html')
    child = new BrowserWindow({
        parent: win,
        width: 995,
        height: 550,
        frame: false,
        resizable: false,
        show: false,
        icon: path.join(__dirname, 'assets/img/bot.png'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    child.loadFile('login.html')
    child.once('ready-to-show', () => {
        child.show()
    })

    // child.openDevTools()
    win.openDevTools()
}


ipcMain.on('login-success', (event, arg) => {
    if(arg=='OK'){
        child.hide()
        win.show()
    }
})

ipcMain.on('login-out', (event, arg) => {
    if(arg=='LOGOUT'){
        win.hide()
        child.show()
    }
})
  
ipcMain.on('exit-app', (event, arg) => {
    if(arg=='GOODBYE'){
        app.quit()
    }
})
    
app.on('ready', createWindows)  

app.on('window-all-closed', () => {
    app.quit()
  })