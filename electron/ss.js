const koffi = require('koffi');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { printLog } = require('./utils')

const platform = os.platform();
let dll_path;
let dll;
if (platform === 'win32') {
    const arch = process.arch;
    dll = 'CommonInterface';
    if (arch === 'x64') {
        //dll = path.resolve(__dirname, '..\\assets\\win_64\\CommonInterface.dll');
        dll_path = path.join(__dirname, '..', 'assets', 'win_64', 'CommonInterface.dll');
    }
    else if (arch === 'ia32') {
        //dll = path.resolve(__dirname, '..\\assets\\win_32\\CommonInterface.dll');
        dll_path = path.join(__dirname, '..', 'assets', 'win_32', 'CommonInterface.dll');
    }
    else {
        printLog('当前系统架构不支持：' + arch);
        process.exit(1);
    }
}
else {
    dll = 'libCommonInterface';
    dll_path = '/opt/ss-test/assets/linux/libCommonInterface.so';
}
console.log('dll path test1:' + dll_path + fs.existsSync(dll_path));

const CommonInterface = koffi.load(dll_path); // 替换为你的DLL路径

// 定义函数签名
const ssOpenDevice = CommonInterface.func('long OpenDevice(const char *param1, const char *param2, const char *param3)');
const ssIdReadCard = CommonInterface.func('long IdReadCard(uint8_t CardType, uint8_t InfoEncoding, char *IdCardInfo, long TimeOutMs)');

function openDevice(view) {
    const handle = ssOpenDevice('AUTO', '', '');
    if (handle > 0) {
        view.webContents.send('ss-message', {
            type: 'open_device', state: true, message: '打开设备成功，设备句柄：' + handle
        })
    }
    else {
        view.webContents.send('ss-message', {
            type: 'open_device', state: false, message: '打开设备失败，返回值：' + handle
        })
    }
}

function readCard(view) {
    let idCardInfo = Buffer.alloc(10240);
    const result = ssIdReadCard(0x00, 0x03, idCardInfo, 5000);
    if (result === 0) {
        console.log('读取成功，卡信息:', idCardInfo.toString());
        view.webContents.send('ss-message', {
            type: 'read_card', state: true, message: '读取成功', data: parseStringToObject(idCardInfo.toString('utf-8', 0, idCardInfo.indexOf(0)))
        });
    } else {
        view.webContents.send('ss-message', {
            type: 'read_card', state: false, message: '读卡失败，返回值：' + result
        })
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
module.exports = { openDevice, readCard }