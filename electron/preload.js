const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {

    // 监听串口状态
    onSerialState: (callback) => {
        const listener = (event, state) => {
            console.log('serial-state');
            callback(state);
        };
        ipcRenderer.on('serial-state', listener);
        return () => ipcRenderer.removeListener('serial-state', listener); // 返回移除方法
    },

    // 监听串口数据
    onSerialData: (callback) => {
        const listener = (event, obj) => {
            console.log('serial-data');
            callback(obj);
        };
        ipcRenderer.on('serial-data', listener);
        return () => ipcRenderer.removeListener('serial-data', listener); // 返回移除方法
    },

    // 监听串口消息
    onSerialMessage: (callback) => {
        const listener = (event, data) => {
            console.log('serial-message');
            callback(data);
        };
        ipcRenderer.on('serial-message', listener);
        return () => ipcRenderer.removeListener('serial-message', listener); // 返回移除方法
    },

    //获取串口列表
    getSerialPortList: () => ipcRenderer.send('serial-get-port-list'),

    //打开串口
    openSerialPort: (com) => ipcRenderer.send('serial-open-port', com),

    //释放串口
    releaseSerialPort: () => ipcRenderer.send('serial-release-port'),

    //发送串口消息
    sendSerialPortMessage: (dataArray) => ipcRenderer.send('serial-send-message', dataArray),

    //弹出electron提示const { title, msg } = obj;
    clientDialog: (obj) => ipcRenderer.send('client-dialog', obj),

    // 最小化窗口
    minimizeWindow: () => ipcRenderer.send('minimize-window'),

    // 最大化窗口
    maximizeWindow: () => ipcRenderer.send('maximize-window'),

    // 打开调试工具
    openDevTools: () => ipcRenderer.send('open-devtools'),

    // 退出应用
    exitApp: () => ipcRenderer.send('window-exit'),

    // 刷新窗口
    reloadWindow: () => ipcRenderer.send('window-reload'),

    // 固定窗口在最前
    toggleWindow: () => ipcRenderer.send('toggle-window'),

    // 获取版本号
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),

    //打开神思设备
    openSsDevice: () => ipcRenderer.send('open-ss-device'),

    //神思读卡
    readSsCard: () => ipcRenderer.send('read-ss-card'),

    //神思消息返回
    onSsMessage: (callback) => {
        const listener = (event, data) => {
            console.log('ss-message');
            callback(data);
        };
        ipcRenderer.on('ss-message', listener);
        return () => ipcRenderer.removeListener('ss-message', listener); // 返回移除方法
    },
});