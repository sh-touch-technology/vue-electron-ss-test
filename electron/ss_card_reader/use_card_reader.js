const { app } = require('electron');
const { fork } = require('child_process');
const path = require('path');

let read_card_child_process = null;
let view = null;

// 创建或重启子进程的函数
function createChildProcess() {
    read_card_child_process = fork(path.join(__dirname, 'device.js')); // 启动子进程

    // 监听子进程退出事件
    read_card_child_process.on('exit', (code, signal) => {
        console.log(`子进程退出，退出码: ${code}, 信号: ${signal}`);
        read_card_child_process = null;
    });

    // 监听来自子进程的消息
    read_card_child_process.on('message', (msg) => {
        console.log('主进程收到子进程消息:', msg);
        if(msg.type && msg.type === 'ss_result'){
            view.webContents.send('ss-message', msg.data);
        }
        if(msg.type && msg.type === 'get_app_exe_path'){
            read_card_child_process.send(app.getPath('exe'));
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