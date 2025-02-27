const koffi = require('koffi');
const os = require('os');
const path = require('path');
//const { printLog } = require('../utils');

let app_exe_path;

process.on('message', (msg) => {
    console.log('Received message from parent:', msg);
    if (msg.includes('()')) {
        try {
            process.send({
                type: 'ss_result',
                data: eval(msg)
            });
        }
        catch (error) {
            process.send({
                type: 'ss_result',
                data: {
                    type: 'func_exec_exception',
                    state: false, message: '身份证接口函数执行失败：' + error
                }
            })
        }
    }
    else {
        app_exe_path = msg;
    }
});

const platform = os.platform();
let dll_path;
let dll_name;
let load_state;
let load_error;
if (false) {//platform === 'win32'
    const arch = process.arch;
    dll_name = 'CommonInterface';
    if (arch === 'x64') {
        dll_path = path.resolve('assets/win_64/CommonInterface.dll');
    }
    else if (arch === 'ia32') {
        dll_path = path.resolve('assets/win_32/CommonInterface.dll');
    }
    else {
        //printLog('当前系统架构不支持连接读卡器操作：win_' + arch);
        load_error = '当前系统架构不支持连接读卡器操作：win_' + arch;
    }
}
else {
    const arch = process.arch;
    dll_name = 'libCommonInterface';
    if (!app_exe_path) {
        process.send({
            type: 'get_app_exe_path'
        });
        setTimeout(() => {
            console.log("延迟 1 秒后执行");
        }, 1000);
    }
    if (true) {//arch === 'arm64'
        dll_path = path.join(path.dirname(app_exe_path), 'assets', 'linux_arm', 'libCommonInterface.so');
    }
    else if (arch === 'x64') {
        dll_path = path.join(path.dirname(app_exe_path), 'assets', 'linux_x86', 'libCommonInterface.so');
    }
    else {
        load_error = '当前系统架构不支持连接读卡器操作：linux_' + arch;
    }
    console.log('sp dll_path:' + dll_path);
}

let CommonInterface; //动态库
let ssOpenDevice; //打开设备
let ssCloseDevice; //关闭设备
let ssQueryHeartBeat; //心跳查询
let ssFindCard; //寻卡
let ssIdReadCard; //读卡

//加载动态库
const ssLoadLibrary = () => {
    if (!dll_path) {
        return false;
    }
    //printLog('加载读卡器动态库：' + dll_path);
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
        //printLog('读卡器动态库加载成功');
        return true;
    }
    catch (error) {
        load_error = error;
        //printLog('加载读卡器动态库失败，错误：' + error);
        return false;
    }
}

function openDevice() {
    if (!load_state) {
        if (!ssLoadLibrary()) {
            return { type: 'open_device', state: false, message: '打开设备异常，' + '读卡器动态库加载失败，错误：' + load_error };
        }
    }

    try {
        const result = ssOpenDevice('AUTO', '', '');
        if (result > 0) {
            return { type: 'open_device', state: true, message: '打开设备成功，设备句柄：' + result };
        }
        return { type: 'open_device', state: false, message: '打开设备失败，返回值：' + result };
    }
    catch (error) {
        return { type: 'open_device', state: false, message: '打开设备异常，错误：' + error };
    }
}

function closeDevice() {
    if (!load_state) {
        return { type: 'open_device', state: false, message: '请先打开设备' };
    }

    try {
        const result = ssCloseDevice();
        if (result === 0) {
            return { type: 'close_device', state: true, message: '关闭设备成功' }
        }
        return { type: 'close_device', state: false, message: '关闭设备失败，返回值：' + result }
    }
    catch (error) {
        return { type: 'close_device', state: false, message: '关闭设备异常，错误：' + error }
    }
}

function queryHeartBeat() {
    if (!load_state) {
        return { type: 'open_device', state: false, message: '请先打开设备' };
    }

    try {
        const result = ssQueryHeartBeat();
        if (result === 0) {
            return { type: 'device_heart_beat', state: true, message: '设备心跳成功' }
        }
        return { type: 'device_heart_beat', state: false, message: '设备心跳失败，返回值：' + result }
    }
    catch (error) {
        return { type: 'device_heart_beat', state: false, message: '设备心跳查询失败，异常：' + error }
    }
}

function findCard() {
    if (!load_state) {
        return { type: 'open_device', state: false, message: '请先打开设备' };
    }

    try {
        const result = ssFindCard();
        if (result === 0) {
            return { type: 'find_card', state: true, message: '寻卡成功' }
        }
        return { type: 'find_card', state: false, message: '寻卡失败，返回值：' + result }
    }
    catch (error) {
        return { type: 'find_card', state: false, message: '寻卡失败，错误：' + error }
    }
}

function readCard() {
    if (!load_state) {
        return { type: 'open_device', state: false, message: '请先打开设备' };
    }

    let idCardInfo = Buffer.alloc(10240);
    try {
        const result = ssIdReadCard(0x00, 0x03, idCardInfo, 5000);
        if (result === 0) {
            return { type: 'read_card', state: true, message: '读取成功', data: parseStringToObject(idCardInfo.toString('utf-8', 0, idCardInfo.indexOf(0))) }
        }
        return { type: 'read_card', state: false, message: '读卡失败，返回值：' + result }
    } catch (error) {
        return { type: 'read_card', state: false, message: '读卡异常，错误：' + error }
    }
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