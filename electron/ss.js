const koffi = require('koffi');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { printLog } = require('./utils');

const platform = os.platform();
let dll_path;
let dll_name;
let load_state;
let load_error;
if (platform === 'win32') {
    const arch = process.arch;
    dll_name = 'CommonInterface';
    if (arch === 'x64') {
        //dll_path = path.join(__dirname, '..', 'assets', 'win_64', 'CommonInterface.dll');
        //dll_path = path.resolve(__dirname, '..\\..\\..\\assets\\win_64\\CommonInterface.dll');
        dll_path = path.resolve('assets/win_64/CommonInterface.dll');
    }
    else if (arch === 'ia32') {
        //dll_path = path.join(__dirname, '..', 'assets', 'win_32', 'CommonInterface.dll');
        //dll_path = path.resolve(__dirname, '..\\..\\..\\assets\\win_32\\CommonInterface.dll');
        dll_path = path.resolve('assets/win_32/CommonInterface.dll');
    }
    else {
        printLog('当前系统架构不支持连接读卡器操作：win_' + arch);
        load_error = '当前系统架构不支持连接读卡器操作：win_' + arch;
    }
}
else {
    const arch = process.arch;
    dll_name = 'libCommonInterface';
    //dll_path = '/opt/ss-test/assets/linux/libCommonInterface.so';
    //dll_path = path.resolve(app.getAppPath(),'assets','linux','libCommonInterface.so');
    if (arch === 'arm64') {
        dll_path = path.join(path.dirname(app.getPath('exe')), 'assets', 'linux_arm', 'libCommonInterface.so');
    }
    else if (arch === 'x64') {
        dll_path = path.join(path.dirname(app.getPath('exe')), 'assets', 'linux_x86', 'libCommonInterface.so');
    }
    else {
        load_error = '当前系统架构不支持连接读卡器操作：linux_' + arch;
    }
}

let CommonInterface; //动态库
let ssOpenDevice; //打开设备
let ssCloseDevice; //关闭设备
let ssQueryHeartBeat; //心跳查询
let ssFindCard; //寻卡
let ssIdReadCard;//读卡
//加载动态库
const ssLoadLibrary = () => {
    if (!dll_path) {
        return false;
    }
    printLog('加载读卡器动态库：' + dll_path);
    try {
        //动态库
        CommonInterface = koffi.load(dll_path);
        //打开设备
        ssOpenDevice = CommonInterface.func('long OpenDevice(const char *PortType, const char *PortPara, const char *ExtendPara)');
        //关闭设备
        ssCloseDevice = CommonInterface.func('long CloseDevice()');
        //心跳查询
        ssQueryHeartBeat = CommonInterface.func('long TerminalHeartBeat()');
        //寻卡
        ssFindCard = CommonInterface.func('long IdFindCard()');
        //读卡
        ssIdReadCard = CommonInterface.func('long IdReadCard(uint8_t CardType, uint8_t InfoEncoding, char *IdCardInfo, long TimeOutMs)');

        load_state = true;
        printLog('读卡器动态库加载成功');
        return true;
    }
    catch (error) {
        load_error = error;
        printLog('加载读卡器动态库失败，错误：' + error);
        return false;
    }
}

function openDevice(view) {
    if (!load_state) {
        if (!ssLoadLibrary()) {
            view.webContents.send('ss-message', {
                type: 'open_device', state: false, message: '打开设备异常，' + '读卡器动态库加载失败，错误：' + load_error
            });
        }
    }

    ssOpenDevice.async('AUTO', '', '', (error, result) => {
        if (error) {
            view.webContents.send('ss-message', {
                type: 'open_device', state: false, message: '打开设备异常，错误：' + error
            });
            return 0;
        }
        if (result > 0) {
            view.webContents.send('ss-message', {
                type: 'open_device', state: true, message: '打开设备成功，设备句柄：' + result
            });
        }
        else {
            view.webContents.send('ss-message', {
                type: 'open_device', state: false, message: '打开设备失败，返回值：' + result
            });
        }
    });

    // const result = ssOpenDevice('AUTO', '', '');
    // if (result > 0) {
    //     view.webContents.send('ss-message', {
    //         type: 'open_device', state: true, message: '打开设备成功，设备句柄：' + result
    //     })
    //     //readCard(view);
    // }
}

function closeDevice(view) {
    if(!load_state){
        view.webContents.send('ss-message', {
            type: 'open_device', state: false, message: '请先打开设备'
        });
        return 0;
    }
    ssCloseDevice.async((error, result) => {
        if (error) {
            view.webContents.send('ss-message', {
                type: 'close_device', state: false, message: '关闭设备异常，错误：' + error
            });
            return 0;
        }
        if (result === 0) {
            view.webContents.send('ss-message', {
                type: 'close_device', state: true, message: '关闭设备成功'
            });
            load_state = false;
        }
        else {
            view.webContents.send('ss-message', {
                type: 'close_device', state: false, message: '关闭设备失败，返回值：' + result
            });
        }
    })
}

function queryHeartBeat(view) {
    if(!load_state){
        view.webContents.send('ss-message', {
            type: 'open_device', state: false, message: '请先打开设备'
        });
        return 0;
    }
    ssQueryHeartBeat.async((error, result) => {
        if (error) {
            view.webContents.send('ss-message', {
                type: 'device_heart_beat', state: false, message: '设备心跳查询失败，异常：' + error
            });
            return 0;
        }
        if (result === 0) {
            view.webContents.send('ss-message', {
                type: 'device_heart_beat', state: true, message: '设备心跳成功'
            });
        }
        else {
            view.webContents.send('ss-message', {
                type: 'device_heart_beat', state: false, message: '设备心跳失败，返回值：' + result
            });
        }
    })
}

function findCard(view) {
    if(!load_state){
        view.webContents.send('ss-message', {
            type: 'open_device', state: false, message: '请先打开设备'
        });
        return 0;
    }
    ssFindCard.async((error, result) => {
        if (error) {
            view.webContents.send('ss-message', {
                type: 'find_card', state: false, message: '寻卡失败，错误：' + error
            });
            return 0;
        }
        if (result === 0) {
            view.webContents.send('ss-message', {
                type: 'find_card', state: true, message: '寻卡成功'
            })
        }
        else {
            view.webContents.send('ss-message', {
                type: 'find_card', state: false, message: '寻卡失败，返回值：' + result
            })
        }
    })
}

function readCard(view) {
    if(!load_state){
        view.webContents.send('ss-message', {
            type: 'open_device', state: false, message: '请先打开设备'
        });
        return 0;
    }
    let idCardInfo = Buffer.alloc(10240);
    // const result = ssIdReadCard(0x00, 0x03, idCardInfo, 5000);
    // if (result === 0) {
    //     view.webContents.send('ss-message', {
    //         type: 'read_card', state: true, message: '读取成功', data: parseStringToObject(idCardInfo.toString('utf-8', 0, idCardInfo.indexOf(0)))
    //     });
    // }
    ssIdReadCard.async(0x00, 0x03, idCardInfo, 5000, (error, result) => {
        if (error) {
            view.webContents.send('ss-message', {
                type: 'read_card', state: false, message: '读卡异常，错误：' + error
            });
            return 0;
        }
        if (result === 0) {
            console.log('读取成功，卡信息:', idCardInfo.toString());
            view.webContents.send('ss-message', {
                type: 'read_card', state: true, message: '读取成功', data: parseStringToObject(idCardInfo.toString('utf-8', 0, idCardInfo.indexOf(0)))
            });
        } else {
            view.webContents.send('ss-message', {
                type: 'read_card', state: false, message: '读卡失败，返回值：' + result
            });
        }
    });
}

function parseStringToObject(str) {
    const fields = [
        'card_type', 'name', 'en_name', 'gender', 'gender_code', 'nation',
        'nation_code', 'birthday', 'address', 'id_num', 'issuing_authority', 'issue_date',
        'expiry_date', 'card_version', 'photo', 'fingerprint'
    ];
    const values = str.split(':');
    let result = {};
    for (let i = 0; i < fields.length; i++) {
        result[fields[i]] = values[i] || '';
    }
    return result;
}
module.exports = { openDevice, closeDevice, queryHeartBeat, readCard, findCard }