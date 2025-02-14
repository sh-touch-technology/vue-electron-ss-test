const ffi = require('ffi-napi');
const ref = require('ref-napi');

const dll = '../assets/CommonInterface.dll';

const int = ref.types.int;
const long = ref.types.long;
const string = ref.types.CString;

const CommonInterface = ffi.Library(dll, {
    'OpenDevice': [long, [string, string, string]]  // 函数签名
});

function openDevice() {
    const handle = CommonInterface.OpenDevice('AUTO', '', '');
    if (handle > 0) {
        console.log('设备打开成功' + handle);
    }
    else {
        console.log('设备打开失败'+handle);
    }
}

module.exports = { openDevice }