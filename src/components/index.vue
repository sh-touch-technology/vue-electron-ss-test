<template>
    <div class="common-layout">
        <el-container class="main-container">
            <el-main class="main">
                <el-descriptions :column="3" title="证件信息" border class="id_card">
                    <template #extra>
                        <el-button type="primary" @click="ssOpenDevice">连接设备</el-button>
                        <el-button type="primary" @click="ssCloseDevice">关闭设备</el-button>
                        <el-button type="primary" @click="ssQueryDeviceHeartBeat">查询心跳</el-button>
                        <el-button type="primary" @click="ssFindCard">神思寻卡</el-button>
                        <el-button type="primary" @click="ssReadCard">神思读卡</el-button>

                    </template>
                    <el-descriptions-item :rowspan="3" label="人像照片" align="center" min-width="100px">
                        <p v-if="!card_date.photo" style="color: darkgray;">暂无照片</p>
                        <el-image style="width: 100px; height: 120px" :src="'data:image/jpeg;base64,' + card_date.photo"
                            v-if="card_date.photo" />
                    </el-descriptions-item>
                    <el-descriptions-item label="姓名" align="center"
                        min-width="100px">{{ card_date.name }}</el-descriptions-item>
                    <el-descriptions-item label="性别" align="center"
                        min-width="100px">{{ card_date.gender }}</el-descriptions-item>
                    <el-descriptions-item label="证件类型" align="center">{{ card_date.card_type }}</el-descriptions-item>
                    <el-descriptions-item label="证件号码" align="center">{{ card_date.id_num }}</el-descriptions-item>
                    <el-descriptions-item label="英文姓名" align="center">{{ card_date.en_name }}</el-descriptions-item>
                    <el-descriptions-item label="民族" align="center">{{ card_date.nation }}</el-descriptions-item>
                    <el-descriptions-item label="出生日期" align="center">{{ card_date.birthday }}</el-descriptions-item>
                    <el-descriptions-item label="住址" align="center">{{ card_date.address }}</el-descriptions-item>
                    <el-descriptions-item label="签发机关"
                        align="center">{{ card_date.issuing_authority }}</el-descriptions-item>
                    <el-descriptions-item label="发卡日期" align="center">{{ card_date.issue_date }}</el-descriptions-item>
                    <el-descriptions-item label="卡有效期" align="center">{{ card_date.expiry_date }}</el-descriptions-item>
                    <el-descriptions-item label="证件版本号"
                        align="center">{{ card_date.card_version }}</el-descriptions-item>
                </el-descriptions>
            </el-main>
            <el-footer class="footer">
                <div id="logContainer" class="logContainer">
                    <div v-for="(log, index) in logs" :key="index" class="log-entry">
                        {{ log }}
                    </div>
                </div>
            </el-footer>
        </el-container>
    </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue';

const card_date = ref({});

const logs = ref([]);

const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false }); // 格式为 HH:mm:ss
    const logMessage = `${timestamp} - ${msg}`;

    // 添加日志内容到数组
    logs.value.push(logMessage);

    // 保证日志框自动滚动到最新日志
    nextTick(() => {
        const logContainer = document.getElementById('logContainer');
        logContainer.scrollTop = logContainer.scrollHeight;
    });
};

const ssOpenDevice = () => {
    addLog('打开设备');
    window.electron.openSsDevice({
        PortType: 'AUTO',
        PortPara: '',
        ExtendPara: ''
    });
}

const ssCloseDevice = () => {
    addLog('关闭设备');
    window.electron.closeSsDevice();
}

const ssQueryDeviceHeartBeat = () => {
    addLog('查询设备心跳');
    window.electron.querySsDeviceHeartBeat();
}

const ssFindCard = () => {
    addLog('寻卡中...');
    window.electron.findSsCard();
}

const ssReadCard = () => {
    addLog('读取二代证');
    window.electron.readSsCard();
}

let cleanupFns = [];
onMounted(() => {
    // 监听神思消息
    cleanupFns.push(
        window.electron.onSsMessage((data) => {
            console.log('收到神思消息', data);
            addLog(JSON.stringify(data));
            //设备打开
            if (data.type === 'open_device') {

            }
            //设备关闭
            if (data.type === 'close_device') {

            }
            //收到证件信息
            if (data.type === 'read_card') {
                if (data.state) {
                    card_date.value = data.data;
                }
            }
        })
    );
});

onBeforeUnmount(() => {
    console.log('before unmounted');
    cleanupFns.forEach((cleanup) => cleanup());
    cleanupFns = [];
});
</script>
<script>

</script>

<style lang="scss" scoped>
.common-layout {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    padding: 10px 10px;

    .main-container {
        .head {
            height: auto;
            display: flex;
        }

        .main {
            flex: unset;
            padding: 0;
        }

        .footer {
            flex: 1;
            padding: 0;
            height: auto;
            padding-top: 25px;
            overflow: auto;
        }
    }
}
</style>

<style lang="scss" scoped>
.id_card {
    .el-descriptions__body .el-descriptions__table.is-bordered .el-descriptions__cell {
        padding: 16px 6px;
    }
}

.logContainer {
    background-color: rgb(240, 240, 240);
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 5px;
    display: flex;
    flex-direction: column;
    gap: 3;
}

.log-entry {
    word-break: break-all;
}
</style>