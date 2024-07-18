const cron = require('node-cron');
const logger =require('./common/Logger');
//const sca001 = require('./job/sc/sca/sca001');
const ifa001 = require('./job/if/ifa/ifa001');
// * * * * *
//| | | | |
//| | | | └─ 요일 (0 - 7) (0 또는 7은 일요일)
//| | | └─── 월 (1 - 12)
//| | └───── 일 (1 - 31)
//| └─────── 시 (0 - 23)
//└───────── 분 (0 - 59)
// 매 분마다: * * * * *           // 3분마다 : */3 * * * *    //매 시간 0분마다: 0 * * * *      //매일 오전 9시: 0 9 * * *
//매주 월요일 오전 9시: 0 9 * * 1 //매월 1일 오전 9시: 0 9 1 * * //주말 오전 9시: 0 9 * * 6,0 (토요일과 일요일)  //
const _FILE = 'scheduler.js';


// sca001.js
cron.schedule('*/1 * * * *', () => {
    logger.info(`[${_FILE}] SCA001 JOB START ********************************* `);
    ifa001.ifa001service();
    logger.info(`[${_FILE}] SCA001 JOB END ********************************* `);
});


logger.info(`[${_FILE}] ##### ##### ##### SCHEDULER START ##### ##### ##### `);
