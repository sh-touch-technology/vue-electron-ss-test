const { app } = require('electron')
const log = require('electron-log/main');
const path = require('path');

//日志目录
const logFilePath = path.resolve(app.getPath('home'), '首环日志\\神思读卡测试');

//初始化日志
function initLog() {
    log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}]{scope} {text}'
    let date = new Date();
    date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    //log.transports.file.resolvePath = () => platform === 'win32' ? ('C:\\shkj-log\\shkj-client\\' + date + '.txt') : ('~/shkj/log/shkj-client/' + date + '.txt');
    log.transports.file.resolvePathFn = () => path.resolve(logFilePath, `${date}.txt`);
    console.log('log file path:', path.resolve(logFilePath, `${date}.txt`));
}

//日志函数
function printLog(message) {
    log.info(message);
}

module.exports = { initLog, printLog };