const { app, BrowserWindow, ipcMain } = require('electron')
const { createMainWindowView, openDialog, openMainwindowDevTools, maximizeMainwindow, minimizeMainwindow, exitMainwindow, reloadMainwindow } = require('./functions');
const { printLog, initLog } = require('./utils');
const { openDevice, closeDevice, queryHeartBeat, readCard, findCard } = require('./ss');
//const { openDevice, readCard} = require('./ss');
const { callChildProcessFunc } = require('./ss_card_reader/use_card_reader');

initLog();

let mainWindow;

function createWindow() {
    //加载vue devtools拓展
    //session.defaultSession.loadExtension('C:/Users/admin/AppData/Local/Google/Chrome/User Data/Default/Extensions/fjjopahebfkmlmkekebhacaklbhiefbn/6.5.1_0').then(({ id }) => { })
    //session.defaultSession.loadExtension('C:/Users/admin/AppData/Local/Google/Chrome/User Data/Default/Extensions/fjjopahebfkmlmkekebhacaklbhiefbn/6.5.1_1').then(({ id }) => {})

    //创建浏览器窗口
    mainWindow = createMainWindowView();

    //获取应用的exe路径
    ipcMain.handle('get-app-exe-apth', () => {
        return app.getPath('exe');
    });

    //渲染进程调用应用程序重启
    ipcMain.handle('app-relaunch', () => {
        app.relaunch();  // 触发重新启动
        app.exit();  // 退出当前应用进程
    })

    //渲染进程设置最小化
    ipcMain.on('minimize-window', () => {
        minimizeMainwindow();
    });

    //设置最大化
    ipcMain.on('maximize-window', () => {
        maximizeMainwindow();
    });

    //渲染进程打开调试工具
    ipcMain.on('open-devtools', () => {
        openMainwindowDevTools();
    });

    //渲染进程调用关闭app
    ipcMain.on('window-exit', () => {
        exitMainwindow();
    });

    //渲染进程调用页面刷新
    ipcMain.on('window-reload', () => {
        reloadMainwindow();
    });

    //设置最前端 
    ipcMain.on('toggle-window', () => {
        const isAlwaysOnTop = mainWindow.isAlwaysOnTop();
        mainWindow.setAlwaysOnTop(!isAlwaysOnTop);
    });

    //获取版本号
    ipcMain.handle('get-app-version', () => {
        const version = app.getVersion();
        console.log('调用version', version);
        return version;
    });

    //打开神思设备
    ipcMain.on('open-ss-device', (event, data) => {
        //openDevice(mainWindow, data);
        callChildProcessFunc(mainWindow, 'openDevice()');
    });

    //关闭神思设备
    ipcMain.on('close-ss-device', () => {
        //closeDevice(mainWindow);
        callChildProcessFunc(mainWindow, 'closeDevice()');
    });

    //查询神思设备心跳
    ipcMain.on('query-ss-device-heart-beat', () => {
        //queryHeartBeat(mainWindow);
        callChildProcessFunc(mainWindow, 'queryHeartBeat()');
    });

    //神思读卡
    ipcMain.on('read-ss-card', () => {
        //readCard(mainWindow);
        callChildProcessFunc(mainWindow, 'readCard()');
    });

    //神思寻卡
    ipcMain.on('find-ss-card', () => {
        //findCard(mainWindow);
        callChildProcessFunc(mainWindow, 'findCard()');
    });
}

// 这段程序将会在 Electron 结束初始化和创建浏览器窗口的时候调用部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
    printLog('程序启动');
    createWindow();
    printLog('创建主窗体');
    app.on('activate', function () {
        // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他打开的窗口，那么程序会重新创建一个窗口。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    });
}).catch((error) => {
    openDialog('error', '启动失败', '启动失败：' + error.message);
})

//非 macOS 当所有窗口关闭时都直接退出
app.on('window-all-closed', function () {
    //if (process.platform !== 'darwin') app.quit()
    app.quit()
})