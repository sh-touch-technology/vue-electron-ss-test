const { load, DataType, open, close, arrayConstructor, define } = require('ffi-rs');
const os = require('os');
const { printLog } = require('./utils')

const platform = os.platform();
let dll = '../assets/CommonInterface.dll';
if (platform === 'win32') {
    const arch = process.arch;
    if (arch === 'x64') {
        dll = '../assets/win_64/CommonInterface.dll';
    }
    else if (arch === 'ia32') {
        dll = '../assets/win_32/CommonInterface.dll';
    }
    else {
        printLog('当前系统架构不支持：' + arch);
        process.exit(1);
    }
}
else {
    dll = '../assets/linux/CommonInterface.dll';
}

//使用前需要打开
printLog('加载动态库：' + dll);
open({
    library: "CommonInterface",
    path: dll,
});

//打开设备
const ssOpenDevice = () => {
    try {
        const result = load({
            library: "CommonInterface",  // 动态库名称
            funcName: "OpenDevice",  // 函数名称
            retType: DataType.I64,   // 返回类型为 long（通常为 I64）
            paramsType: [
                DataType.String,  // PortType 类型为字符串
                DataType.String,  // PortPara 类型为字符串
                DataType.String,  // ExtendPara 类型为字符串
            ],
            paramsValue: ['AUTO', '', 'extendPara'],  // 传递的参数值
        });
        if (result > 0) {
            return {
                type: 'open_device',
                state: true,
                message: '打开设备成功，设备句柄：' + result
            }
        }
        else {
            return {
                type: 'open_device',
                state: false,
                message: '打开设备失败，返回值：' + result
            }
        }
    }
    catch (error) {
        return {
            type: 'open_device',
            state: false,
            message: '打开设备失败，异常：' + error
        }
    }
};

const ssReadCard = (cardType, infoEncoding, timeOutMs) => {
    try {
        let idCardInfo = Buffer.alloc(10240);  // 至少分配10240字节的内存来存储读取的卡信息
        const result = load({
            library: "CommonInterface",  // 动态库名称
            funcName: "IdReadCard",    // 函数名称
            retType: DataType.I64,     // 返回值类型：long
            paramsType: [
                DataType.U8,            // CardType：字节
                DataType.U8,            // InfoEncoding：字节
                DataType.U8Array,        // IdCardInfo：字符串（读取的身份证信息）
                DataType.I64,           // TimeOutMs：超时时间
            ],
            paramsValue: [
                cardType,               // 传递的 CardType 参数
                infoEncoding,           // 传递的 InfoEncoding 参数
                idCardInfo,             // 传递的 IdCardInfo 参数
                timeOutMs,              // 传递的 TimeOutMs 参数
            ],
        });

        if (result === 0) {
            return {
                type: 'read_card',
                state: true,
                message: '读取成功',
                data: parseStringToObject(idCardInfo.toString('utf-8', 0, idCardInfo.indexOf(0)))
            };
        } else {
            return {
                type: 'read_card',
                state: false,
                message: '读卡失败，返回值：' + result
            }
        }
    }
    catch (error) {
        return {
            type: 'read_card',
            state: false,
            message: '读卡失败，异常：' + error
        }
    }
};


function openDevice(view) {
    view.webContents.send('ss-message', ssOpenDevice());
}

function readCard(view) {
    view.webContents.send('ss-message', ssReadCard(0x00, 0x03, 5000));
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