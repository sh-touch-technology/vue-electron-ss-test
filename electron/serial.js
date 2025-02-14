//const SerialPort = require('serialport');
const { SerialPort } = require('serialport');
const { printLog } = require('./utils');

const logs = true;

let port;
let parser;

function openSerialPort(com, view) {
    // 确保传递的是一个有效的串口路径
    if (typeof com !== 'string' || com.trim() === '') {
        logs && console.error('串口路径无效');
        printLog(`[打开串口]错误：指定的串口名称无效,port:${com}`);
        view.webContents.send('serial-state', { flag: 'error', msg: '指定的串口名称无效' });
        return;
    }
    port = new SerialPort({
        path: com,            // 串口路径
        baudRate: 9600,       // 波特率
        autoOpen: false       // 不自动打开
    });
    // 3. 打开串口
    port.open(err => {
        if (err) {
            printLog(`[打开串口]错误：串口打开失败:${err.message}`);
            view.webContents.send('serial-state', { flag: 'error', msg: '串口打开失败：' + err.message });
            return logs && console.error('打开串口失败:', err.message);
        }
        printLog(`[打开串口]port:${com}`);
        logs && console.log('串口已打开');
        view.webContents.send('serial-data', { type: 'com-port-open', msg: '串口已打开' });

        // 监听串口数据
        port.on('data', data => {
            printLog(`[串口接收]${data}`);
            logs && console.log('接收到的数据字节:', data);  // 打印接收到的字节数据
            view.webContents.send('serial-message', data); // 发送到界面
        });
    });

    // 6. 错误处理
    port.on('error', err => {
        printLog(`[串口错误]${err.message}`);
        logs && console.error('串口错误：', err.message);
        view.webContents.send('serial-state', { flag: 'error', msg: '串口错误：' + err.message });
    });
}

function releaseSerialPort(view) {
    if (port && port.isOpen) {
        port.close(err => {
            if (err) {
                printLog(`[串口释放]释放串口失败：${err.message}`);
                logs && console.error('释放串口失败：', err.message);
                view.webContents.send('serial-state', { flag: 'error', msg: '释放串口失败：' + err.message });
            } else {
                port = null;
                printLog(`[串口释放]串口已释放`);
                logs && console.log('串口已释放');
                view.webContents.send('serial-data', { type: 'com-port-release', msg: '串口已释放' });
            }
        });
    } else {
        printLog(`[串口释放]串口未打开，无需释放`);
        logs && console.log('串口未打开');
        view.webContents.send('serial-state', { flag: 'success', msg: '串口未打开，无需释放' });
    }
}

// 5. 发送数据到串口
function sendSerialPortMessage(dataArray, view) {
    if (!port || !port.isOpen) {
        logs && console.error('串口未打开，无法发送数据');
        view.webContents.send('serial-state', { flag: 'error', msg: '串口未打开，无法发送数据' });
        return;
    }

    const byteData = Buffer.from(dataArray);

    port.write(byteData, err => {
        if (err) {
            printLog(`[串口发送]发送失败：${err.message}`);
            logs && console.error('发送失败：', err.message);
            view.webContents.send('serial-state', { flag: 'error', msg: '发送失败：' + err.message });
        }
        printLog(`[串口发送]${dataArray}`);
        logs && console.log('已发送:', dataArray);
        view.webContents.send('serial-state', { flag: 'success', msg: '已发送：' + dataArray + `(${dataArray.map(num => num.toString(16).padStart(2, '0').toUpperCase()).join(' ')})` });
    });
}

async function getSerialPortList(view) {
    try {
        const ports = await SerialPort.list();  // 获取所有串口列表
        if (ports.length === 0) {
            printLog(`[获取串口列表]设备上没有可用的串口`);
            logs && console.log('没有找到可用的串口');
            view.webContents.send('serial-data', { type: 'com_port_list', data: [] });
            view.webContents.send('serial-state', { flag: 'warning', msg: '设备上没有可用的串口' });
        } else {
            logs && console.log('可用的串口列表:');
            const port_list = [];
            ports.forEach(port => {
                logs && console.log(`路径: ${port.path}, 名称: ${port.manufacturer || '未知'}`);
                port_list.push({ name: port.manufacturer, port: port.path });
            });
            printLog(`[获取串口列表]${JSON.stringify(port_list)}`);
            view.webContents.send('serial-data', { type: 'com_port_list', data: port_list });
        }
    } catch (error) {
        printLog(`[获取串口列表]错误：${error}`);
        logs && console.error('获取串口列表时出错：', error);
        view.webContents.send('serial-state', { flag: 'error', msg: '串口列表获取失败：' + error });
    }
}

module.exports = {
    openSerialPort, releaseSerialPort, sendSerialPortMessage, getSerialPortList
}