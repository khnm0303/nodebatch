const fs = require('fs');
const oracledb = require('oracledb');
const util = require('util');
const mapper = require('mybatis-mapper');
const csv = require('fast-csv');
const path = require('path');
const dbset = require('./DbConfig');
const comm_gfs = require('./GetFileName');
const comm_mail = require('./SendMail');
const logger =require('./Logger');
const _FILE = '/common/Download2Csv.js';
//logger.info(`[${_FILE}] TASK Start ********************************* `);

const CHUNK_SIZE      = 7777777;  // 100만 ROW 마다 다른파일에 저장
const _SUFFIX = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 랜덤 3자리 숫자
//var centerQuery = mapper.getStatement('SQLMapper002', 'GetCenterCD', {}, false);


async function Download2Csv(_Query, _Filename ){
  logger.info(`[${_FILE}] Download2Csv() Start ********************************* `);  

  let connection;
  let fileCnt = 1; // 쿼리를 통한 파일 개수 		  
  
  let rowCount = 0;
  let resultDatas = [];  

  var rowCnt = 0;
  
  const currentDir = __dirname;
  const parentDir = path.join(currentDir, '..');
  
  try{
        connection = await oracledb.getConnection(dbset.setting);
        const result = await connection.execute(_Query);
        
        if ( result.rows.length > 0 ){

            const createNewCsvStream = () => {
                const csvFilePath = path.join(parentDir, `/data/${_Filename}_${_SUFFIX}_${fileCnt}.csv`);
                writableStream = fs.createWriteStream(csvFilePath, { encoding: 'utf8' });
                writableStream.write('\uFEFF'); // BOM 추가
                csvStream = csv.format({ headers: true });
                csvStream.pipe(writableStream);
                
                //컬럼 헤더 추가 
                const headers = result.metaData.map((field) => field.name);
                csvStream.write(headers);
                fileCnt++;
                return csvFilePath;
            };
            // 첫 번째 CSV 파일 생성
            let currentCsvFilePath = createNewCsvStream();
            var firstfileRowCnt = 0;
            if ( result.rows.length < CHUNK_SIZE){
                firstfileRowCnt = result.rows.length;
            }else{
                firstfileRowCnt = CHUNK_SIZE;
            }
            var r1 = {row:firstfileRowCnt, file: currentCsvFilePath};
            resultDatas.push(r1);

            for (const row of result.rows) {
                if (rowCnt > 0 && rowCnt % CHUNK_SIZE === 0) {// 100만 행마다 새로운 파일 생성
                    csvStream.end();
                    currentCsvFilePath = createNewCsvStream();
                    const r = { 
                        row: rowCnt, 
                        file: currentCsvFilePath 
                    };
                    resultDatas.push(r);
                    rowCnt = 0; // 행 수 초기화
                }
                csvStream.write(row);
                rowCnt++;
            }

            logger.info(`[${_FILE}] Download2Csv() END ********************************* `);  

        } // if
    } catch (err) {
        logger.error(`[${_FILE} ERROR ] ${err}`);  
    } finally {
        if (connection){
            connection.close((err) => {
                if (err) {
                    logger.error(`[${_FILE} ERROR ] ${err}`);  
                } else {
                    logger.info(`[${_FILE} ] Oracle connection closed successfully. `);                  
                }
            })
        }
    } // finally
    return resultDatas;
}

//Download2Csv 함수와 동일 하지만 파라미터로 데이터소스를 받아서 해당 데이터소스로 오라클 접속
async function Down2Csv4DS( datasource , _Query, _Filename ){
  logger.info(`[${_FILE}] Download2Csv() Start ********************************* `);  

  let connection;
  let fileCnt = 1; // 쿼리를 통한 파일 개수 		  
  
  let rowCount = 0;
  let resultDatas = [];  

  var rowCnt = 0;
  
  const currentDir = __dirname;
  const parentDir = path.join(currentDir, '..');
  
  try{
        connection = await oracledb.getConnection(datasource);
        const result = await connection.execute(_Query);
        
        if ( result.rows.length > 0 ){

            const createNewCsvStream = () => {
                const csvFilePath = path.join(parentDir, `/data/${_Filename}_${_SUFFIX}_${fileCnt}.csv`);
                writableStream = fs.createWriteStream(csvFilePath, { encoding: 'utf8' });
                writableStream.write('\uFEFF'); // BOM 추가
                csvStream = csv.format({ headers: true });
                csvStream.pipe(writableStream);
                
                //컬럼 헤더 추가 
                const headers = result.metaData.map((field) => field.name);
                csvStream.write(headers);
                fileCnt++;
                return csvFilePath;
            };
            // 첫 번째 CSV 파일 생성
            let currentCsvFilePath = createNewCsvStream();
            var firstfileRowCnt = 0;
            if ( result.rows.length < CHUNK_SIZE){
                firstfileRowCnt = result.rows.length;
            }else{
                firstfileRowCnt = CHUNK_SIZE;
            }
            var r1 = {row:firstfileRowCnt, file: currentCsvFilePath};
            resultDatas.push(r1);

            for (const row of result.rows) {
                if (rowCnt > 0 && rowCnt % CHUNK_SIZE === 0) {// 100만 행마다 새로운 파일 생성
                    csvStream.end();
                    currentCsvFilePath = createNewCsvStream();
                    const r = { 
                        row: rowCnt, 
                        file: currentCsvFilePath 
                    };
                    resultDatas.push(r);
                    rowCnt = 0; // 행 수 초기화
                }
                csvStream.write(row);
                rowCnt++;
            }

            logger.info(`[${_FILE}] Download2Csv() END ********************************* `);  

        } // if
    } catch (err) {
        logger.error(`[${_FILE} ERROR ] ${err}`);  
    } finally {
        if (connection){
            connection.close((err) => {
                if (err) {
                    logger.error(`[${_FILE} ERROR ] ${err}`);  
                } else {
                    logger.info(`[${_FILE} ] Oracle connection closed successfully. `);                  
                }
            })
        }
    } // finally
    return resultDatas;
}

module.exports = {
    'Download2Csv': Download2Csv,
    'Down2Csv4DS' : Down2Csv4DS
}

