const { app, BrowserWindow, BrowserView, Menu, dialog, session } = require('electron');
const path = require('path');

//const os = require('os');

//发布时改为非dev的值
const env = 'dev';

//运行平台win32/linux
//const platform = os.platform();

let mainWindow;

//主窗口返回首页/重置页面
function reloadMainwindow() {
    mainWindow.reload();
}

//主窗口最大化/缩小
function maximizeMainwindow() {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
    }
    else {
        mainWindow.maximize();
    }
}

//主窗口最小化
function minimizeMainwindow() {
    if (mainWindow) {
        mainWindow.minimize();
    }
}

//打开主窗口的调试
function openMainwindowDevTools() {
    mainWindow.webContents.openDevTools();
}

//弹出dialog
function openDialog(level, title, message) {
    dialog.showMessageBox(mainWindow, {
        type: level, //none,info,error,question,warning
        title: title,
        message: message,
        buttons: ['确定', '取消']
    }).then(result => {
        console.log(result.response);
    });
}

//程序退出
function exitMainwindow() {
    app.quit();
}


function createMainWindowView() {

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        frame: false, // 去掉窗口边框
        titleBarStyle: 'hidden', // 隐藏标题栏
        webPreferences: {
            preload: path.join(__dirname, '/preload.js'),
            //渲染进程配置
            nodeIntegration: false, //可以引入node和electron相关的API
            contextIsolation: true, //可以使用require方法
            enableRemoteModule: false, //可以使用remote方法
        },
    });

    // 配置热更新
    if (env == 'dev') {
        //开发环境
        const elePath = path.join(__dirname, '../node_modules/electron');
        require('electron-reload')('../', {
            electron: require(elePath),
        });
        mainWindow.loadURL('http://localhost:8890');
        mainWindow.webContents.openDevTools();
    } else {
        //生产环境中要加载文件，打包的版本
        mainWindow.loadFile(path.resolve(__dirname, '../dist/index.html'));
        //mainWindow.webContents.openDevTools()
    }

    //隐藏菜单
    Menu.setApplicationMenu(null)

    // 监听窗口从最小化状态恢复时触发的事件
    mainWindow.on('restore', () => {
        console.log('窗口已从最小化状态恢复');
    });

    return mainWindow;
}

// 导出所有函数
module.exports = {
    createMainWindowView, openDialog, openMainwindowDevTools,
    maximizeMainwindow, minimizeMainwindow, exitMainwindow, reloadMainwindow
};