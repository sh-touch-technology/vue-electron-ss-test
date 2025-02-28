const os = require('os');
const { app } = require('electron');
const { fork } = require('child_process');
const path = require('path');
const { printLog } = require('../utils');

const platform = os.platform();
let dll_path;

let read_card_child_process = null;
let view = null;

if (platform === 'win32') {
    const arch = process.arch;
    if (arch === 'x64') {
        dll_path = path.resolve('assets/win_64/CommonInterface.dll');
    }
    else if (arch === 'ia32') {
        dll_path = path.resolve('assets/win_32/CommonInterface.dll');
    }
    else {
        printLog('当前系统架构不支持连接读卡器操作：win_' + arch);
        dll_path = '当前系统架构不支持连接读卡器操作：win_' + arch;
    }
}
else {
    const arch = process.arch;
    if (arch === 'arm64') {
        dll_path = path.join(path.dirname(app.getPath('exe')), 'assets', 'linux_arm', 'libCommonInterface.so');
    }
    else if (arch === 'x64') {
        dll_path = path.join(path.dirname(app.getPath('exe')), 'assets', 'linux_x86', 'libCommonInterface.so');
    }
    else {
        printLog('当前系统架构不支持连接读卡器操作：linux_' + arch);
        dll_path = '当前系统架构不支持连接读卡器操作：linux_' + arch;
    }
}

// 创建或重启子进程的函数
function createChildProcess() {
    read_card_child_process = fork(path.join(__dirname, 'device.js'), ['--dll_path=' + dll_path]); // 启动子进程

    // 监听子进程退出事件
    read_card_child_process.on('exit', (code, signal) => {
        console.log(`子进程退出，退出码: ${code}, 信号: ${signal}`);
        read_card_child_process = null;
    }); 

    // 监听来自子进程的消息
    read_card_child_process.on('message', (msg) => {
        console.log('主进程收到子进程消息:', msg);
        if (msg.type && msg.type === 'ss_result') {
            view.webContents.send('ss-message', msg.data);
        }
        if (msg.type && msg.type === 'ss_log') {
            printLog(msg.data);
        }
    });
}

// 向子进程发送消息的函数
function callChildProcessFunc(view_, func) {
    view = view_;
    if (read_card_child_process === null || read_card_child_process.killed) {
        console.log('子进程已退出或未启动，重新创建子进程');
        createChildProcess();
    }

    try {
        read_card_child_process.send(func);
    } catch (error) {
        console.error('无法向子进程发送消息:', err);
    }
}

module.exports = { callChildProcessFunc }