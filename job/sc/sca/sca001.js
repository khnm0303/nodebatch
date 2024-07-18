const fs = require('fs');
const logger =require('../../../common/Logger');
const db = require('../../../common/DbHelper');
const Download2Csv = require('../../../common/Download2Csv');
const mapper = require('mybatis-mapper');

// 현재 파일의 디렉토리 경로를 구합니다
const _FILE = 'sca001.js';
const _PATH = '/job/sc/sca/';
const _MAPPERPATH = '../../../mapper/SCA001.xml'
const _STATUS = ['WAIT','START','END','ERROR']

if (!fs.existsSync(_MAPPERPATH)) {
  console.error('Mapper file not found:', _MAPPERPATH);
  process.exit(1);
}else{
  mapper.createMapper([ _MAPPERPATH ]);
}

// 작업 대상 가지고 오기 
async function act1() {
  logger.info(`[${_FILE}] act1() start `);
  var act1  = {};
      act1.error_cd = '';
      act1.error_msg = '';
      act1.batch_id = '';
  var param = {};

  try {
      act1.query1 = mapper.getStatement('SCA001', 'ACT1', {}, false);
      act1.query1_result = await db.select(act1.query1);
      act1.query1_rowcount = act1.query1_result.length;
      
      if(act1.query1_result.length > 0){
        var data = act1.query1_result[0];
        
        for (var i = 1; i <= 10; i++) {
          var keyName = data[`P0${i}NM`];
          var paramValue = data[`PARAM0${i}`];
          
          if (keyName != null) {
            param[keyName] = paramValue;
          }
        }

        act1.batch_id = data["BATCH_ID"];
        act1.batch_nm = data["BATCH_NM"];
        act1.export_param = param;
        act1.export_query = mapper.getStatement('SCA001', act1.batch_id , act1.export_param, false);
        act1.flag = true;
      }else{
        act1.flag = false;
        act1.error_cd = 'act1_001';
        act1.error_msg = '작업대상이 없습니다.';

      }
      console.log(act1);

  } catch (error) {
      logger.error('Error executing query:', error);
  }
  logger.info(`[${_FILE}] act1() END `);
  return act1;
}

// 상태변경
async function updateStatus( _seqno, _status , _errmsg) {
  let query = ''; 
  let updatedCount = 0 ;
  const param = { STATUS: _status, SEQNO: _seqno ,ERRMSG:_errmsg };

  try {
      query = mapper.getStatement('SCA001', 'updateStatus', param, false);
      updatedCount = await db.update(query,true);
  } catch(error){
    logger.error('Error executing query:', error);
  }
  return updatedCount;
}

// 작업 상태 변경
async function act2( act1 ) {
  let act2 = {};
  logger.info(`[${_FILE}] act2() start `);
  act2.flag = true;
  act2.errmsg = '';

  try {
    var seq = act1.query1_result[act1.query1_result.length - 1].SEQNO;
    act2.seqno = seq

    var r = await updateStatus(seq, 'START' ,'');
    
    if ( r > 0 ){
      act2.UPDATE_STATUS = 'START';
    }else{
      act2.flag = false;
      act2.errcd = 'act02-01';
      act2.errmsg = '진행 가능한 작업이 없습니다.';
    } 

    var exported = await Download2Csv.Download2Csv(act1.export_query,act1.batch_id+"_"+act1.batch_nm);
    act2.exported = exported;

  } catch (error) {
      logger.info(`[${_FILE}] act2() ERROR ${error} `);
      act2.flag = false;
      act2.errcd = 'act02-02';
      act2.errmsg = error;
  }
  
  return act2;
}



var sca001service = async () => {

    let pro = {};  
        pro.act1.flag = false;
        pro.act2.flag = false;
        pro.act3.flag = false;
        pro.act4.flag = false;
        pro.act5.flag = false;

    let ret = {};
        ret.error_cd ='@';
        ret.error_msg ='@';

    let seq = '';

    logger.info(` ##### [${_FILE}] SCA001SERVICE START ##### `);
    
    // act1. 작업대상 가지고 오기 
    pro.act1 = await act1();
    seq = pro.act1.query1_result.SEQNO;

    // act2. 플래그변경 및 자료 다운로드
    if ( pro.act1.flag ){
      pro.act2 = await act2(pro.act1);
    } else {
      ret.error_cd = pro.act1.error_cd;
      ret.error_msg = pro.act1.error_msg;
    }

    //act3. 이메일 송신
    if ( pro.act2.flag ){
      pro.act3 = await act3(pro.act2);
    } else {
      ret.error_cd = pro.act2.error_cd;
      ret.error_msg = pro.act2.error_msg;
    }

    // act4. 상태 변경 
    if ( pro.act3.flag ){
      pro.act4 = await act4(pro.act3);
    } else {
      ret.error_cd = pro.act3.error_cd;
      ret.error_msg = pro.act3.error_msg;
    }

    if ( seq != '' ){
      if (ret.error_cd != '@' || ret.error_msg != '@' ){
        await updateStatus(seq, 'ERROR' ,ret.error_msg);
      }
    }
    

    logger.info(` ##### [${_FILE}] SCA001SERVICE END ##### `);

};

sca001service();

module.exports = {
  'sca001service': sca001service
}  
 // 1. 대상 테이블 조회 
 /*
    select 
    from DD 
    where 1 < ( select count(*) from DD where STATUS = 'START' AND  )
    AND STATUS = 'WAIT'
    AND 

CREATE TABLE DD (
	BATCH_ID varchar2(10) PRIMARY KEY,
	BATCH_NM varchar2(100), 
	DESCRIPT varchar2(500),
	MAIL varchar2(500),
	QUERY CLOB,
    P01NM varchar2(16),
    P02NM varchar2(16),
    P03NM varchar2(16),
    P04NM varchar2(16),
    P05NM varchar2(16),
    P06NM varchar2(16),
    P07NM varchar2(16),
    P08NM varchar2(16),
    P09NM varchar2(16),
    P10NM varchar2(16),
	REG_DATE DATE,
	REG_USERID varchar2(100),
	LAST_DATE DATE,
	LAST_USERID varchar2(100)
);	 

CREATE TABLE DWNGL_WMS.DD_JOB
   ( SEQNO NUMBER PRIMARY KEY, 
     BATCH_ID varchar2(10),
	"STATUS" VARCHAR2(10), 
	"PARAM01" VARCHAR2(16), 
	"PARAM02" VARCHAR2(16), 
	"PARAM03" VARCHAR2(16), 
	"PARAM04" VARCHAR2(16), 
	"PARAM05" VARCHAR2(16), 
	"PARAM06" VARCHAR2(16), 
	"PARAM07" VARCHAR2(16), 
	"PARAM08" VARCHAR2(16), 
	"PARAM09" VARCHAR2(16), 
	"PARAM10" VARCHAR2(16), 
	"RV_DATE" VARCHAR2(8), 
	"RV_TIME" VARCHAR2(5), 
	"REG_DATE" DATE, 
	"REG_USERID" VARCHAR2(100), 
	"LAST_DATE" DATE, 
	"LAST_USERID" VARCHAR2(100)
	 )

         1. SEQNO    : 0 ~ 999999999
         2. BATCH_ID : SR001, SR002, AK001 
         3. STATUS   : WAIT, START, END, ERROR
         4. PARAM01  : CENTER
         5. PARAM02  : FROM
         6. PARAM03  : TO
         7. PARAM04  : 
         8. PARAM05  : 
         9. PARAM06  : 
        10. PARAM07  : 
        11. PARAM08  : 
        12. PARAM09  : 
        13. PARAM10  : 
        14. RV_DATE
        15. RV_TIME
        16. REG_DATE    :
        17. REG_USERID  :
        18. LAST_DATE  :

        TABLE DD_LOG 


    // 2. 조회 
        select *
          from DATA_DOWNLOAD
         where 'Y' = ( select CASE WHEN Count(*) > 0 THEN 'N' ELSE 'Y' END ISGO FROM data_download where status = 'START' and regedit >= sysdate -1 )
           and STATUS = 'WAIT'
         order by regedit
    */
    // 3. 있으면 시작 없으면 종료 
