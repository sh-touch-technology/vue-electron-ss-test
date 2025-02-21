const { load, DataType, open, close, arrayConstructor, define } = require('ffi-rs');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { printLog } = require('./utils');

const platform = os.platform();
let dll_path;
let dll;
let load_state;
let load_error;
if (platform === 'win32') {
    const arch = process.arch;
    dll = 'CommonInterface';
    if (arch === 'x64') {
        //dll_path = path.join(__dirname, '..', 'assets', 'win_64', 'CommonInterface.dll');
        dll_path = path.resolve(__dirname, '..\\..\\..\\assets\\win_64\\CommonInterface.dll');
    }
    else if (arch === 'ia32') {
        //dll_path = path.join(__dirname, '..', 'assets', 'win_32', 'CommonInterface.dll');
        dll_path = path.resolve(__dirname, '..\\..\\..\\assets\\win_32\\CommonInterface.dll');
    }
    else {
        printLog('当前系统架构不支持连接读卡器操作：win_' + arch);
        load_error = '当前系统架构不支持连接读卡器操作：win_' + arch;
    }
}
else {
    dll = 'libCommonInterface';
    dll_path = '/opt/ss-test/assets/linux/libCommonInterface.so';
}
console.log('dll path test1:' + dll_path + fs.existsSync(dll_path));

//使用前需要打开
const ssLoadLibrary = () => {
    if (!dll_path) {
        return false;
    }

    printLog('加载读卡器动态库：' + dll_path);
    try {
        open({
            library: dll,
            path: dll_path,
        });
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

//打开设备
const ssOpenDevice = async (PortType, PortPara, ExtendPara) => {
    if (!load_state) {
        if (!ssLoadLibrary()) {
            return new Promise((_, reject) => {
                reject('读卡器动态库加载失败，错误：' + load_error);
            });
        }
    }

    if (!PortType) {
        PortType = 'AUTO';
    }

    return load({
        library: dll,  // 动态库名称
        funcName: "OpenDevice",  // 函数名称
        retType: DataType.I32,   // 返回类型为 long（通常为 I64）
        paramsType: [
            DataType.String,  // PortType 类型为字符串
            DataType.String,  // PortPara 类型为字符串
            DataType.String,  // ExtendPara 类型为字符串
        ],
        paramsValue: [PortType, PortPara, ExtendPara],  // 传递的参数值
        runInNewThread: true,
    })
}

//关闭设备
const ssCloseDevice = () => {
    if (!load_state) {
        return new Promise((_, reject) => {
            reject('读卡器动态库未正确加载，请先连接设备');
        });
    }
    return load({
        library: dll,
        funcName: "CloseDevice",
        retType: DataType.I32,
        paramsType: [],
        paramsValue: [],
        runInNewThread: true,
    });
}

//神思轮询心跳
function ssQueryHeartBeat() {
    if (!load_state) {
        return new Promise((_, reject) => {
            reject('读卡器动态库未正确加载，请先连接设备');
        });
    }
    return load({
        library: dll,
        funcName: "TerminalHeartBeat",
        retType: DataType.I32,
        paramsType: [],
        paramsValue: [],
        runInNewThread: true,
    });
}

//神思寻卡
function ssFindCard() {
    if (!load_state) {
        return new Promise((_, reject) => {
            reject('读卡器动态库未正确加载，请先连接设备');
        });
    }
    return load({
        library: dll,
        funcName: "IdFindCard",
        retType: DataType.I32,
        paramsType: [],
        paramsValue: [],
        runInNewThread: true,
    });
}

//神思读取二代证
const ssReadCard = (cardType, infoEncoding, timeOutMs) => {
    if (!load_state) {
        return {
            idCardInfo: '',
            promise_: new Promise((_, reject) => {
                reject('读卡器动态库未正确加载，请先连接设备');
            })
        }
    }
    let idCardInfo = Buffer.alloc(10240);  //至少分配10240字节的内存来存储读取的卡信息
    return {
        idCardInfo: idCardInfo,
        promise_: load({
            library: dll,
            funcName: "IdReadCard",
            retType: DataType.I32,
            paramsType: [
                DataType.U8,            //证件类型
                DataType.U8,            //返回值字符编码
                DataType.U8Array,       //待返回证件信息
                DataType.I32,           //超时时间ms
            ],
            paramsValue: [
                cardType,
                infoEncoding,
                idCardInfo,
                timeOutMs,
            ],
            runInNewThread: true,
        })
    }
};

function openDevice(view, data) {
    //view.webContents.send('ss-message', ssOpenDevice(data.PortType, data.PortPara, data.ExtendPara));
    ssOpenDevice(data.PortType, data.PortPara, data.ExtendPara).then((res) => {
        if (res > 0 && res <= 100000) {
            view.webContents.send('ss-message', {
                type: 'open_device', state: true, message: '打开设备成功，设备句柄：' + res
            });
        }
        else {
            view.webContents.send('ss-message', {
                type: 'open_device', state: false, message: '打开设备失败，返回参数：' + res
            });
        }
    }).catch((err) => {
        view.webContents.send('ss-message', {
            type: 'open_device', state: false, message: '打开设备失败，异常：' + err
        });
    })
}

function closeDevice(view) {
    ssCloseDevice().then((res) => {
        if (res === 0) {
            view.webContents.send('ss-message', {
                type: 'close_device', state: true, message: '设备关闭成功'
            });
        }
        else {
            view.webContents.send('ss-message', {
                type: 'close_device', state: false, message: '设备关闭失败，返回值：' + res
            });
        }
    }).catch((err) => {
        view.webContents.send('ss-message', {
            type: 'close_device', state: false, message: '设备关闭失败，异常：' + err
        });
    })

}

function queryHeartBeat(view) {
    ssQueryHeartBeat().then((res) => {
        if (res === 0) {
            view.webContents.send('ss-message', {
                type: 'device_heart_beat', state: true, message: '设备心跳成功'
            });
        }
        else {
            view.webContents.send('ss-message', {
                type: 'device_heart_beat', state: false, message: '设备心跳查询失败，返回值：' + res
            });
        }
    }).catch((err) => {
        view.webContents.send('ss-message', {
            type: 'device_heart_beat', state: false, message: '设备心跳查询失败，异常：' + err
        });
    })

}

function findCard(view) {
    ssFindCard().then((res) => {
        if (res === 0) {
            view.webContents.send('ss-message', {
                type: 'find_card', state: true, message: '已发现卡片'
            });
        }
        else {
            view.webContents.send('ss-message', {
                type: 'find_card', state: false, message: '未发现卡片，返回值：' + res
            });
        }
    }).catch((err) => {
        view.webContents.send('ss-message', {
            type: 'find_card', state: false, message: '寻卡失败，异常：' + err
        });
    });
}

function readCard(view) {
    const result = ssReadCard(0x00, 0x03, 5000);
    const idCardInfo = result.idCardInfo;
    result.promise_.then((res) => {
        if (res === 0) {
            view.webContents.send('ss-message', {
                type: 'read_card', state: true, message: '读取成功', data: parseStringToObject(idCardInfo.toString('utf-8', 0, idCardInfo.indexOf(0)))
            });
        } else {
            view.webContents.send('ss-message', {
                type: 'read_card', state: false, message: '读卡失败，返回值：' + res
            });
        }
    }).catch((err) => {
        view.webContents.send('ss-message', {
            type: 'read_card', state: false, message: '读卡失败，异常：' + err
        });
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