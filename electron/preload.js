const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {

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
    openSsDevice: (data) => ipcRenderer.send('open-ss-device', data),

    //关闭神思设备
    closeSsDevice: () => ipcRenderer.send('close-ss-device'),

    //神思设备心跳查询
    querySsDeviceHeartBeat: () => ipcRenderer.send('query-ss-device-heart-beat'),

    //神思读卡
    readSsCard: () => ipcRenderer.send('read-ss-card'),

    //神思寻卡
    findSsCard: () => ipcRenderer.send('find-ss-card'),

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