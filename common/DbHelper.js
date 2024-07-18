const oracledb = require('oracledb');
const dbConfig = require('./DbConfig');
const logger =require('./Logger');

async function select(query) {
    let connection;
    let result;
    try {
      connection = await oracledb.getConnection(dbConfig.setting);
      
      //logger.info("[DbHelper] -------------QUERY------------\n " + query);
      //console.log(query);
      //const result = await connection.execute(query);
      result = await connection.execute(query, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      //return result.rows.map(row => JSON.stringify(row) + '\n');
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err.message);
        }
      }
    }

    return result.rows;
  }

  async function update(_query,_autoCommit) {
    let connection;
    let result;
    let autocommit;
    if ( _autoCommit ==" " ||  _autoCommit == 'NULL' ||_autoCommit == '' ){
      autocommit = true;
    } else {
      autocommit = _autoCommit;
    }

    try {
      connection = await oracledb.getConnection(dbConfig.setting);
      result = await connection.execute(_query,[],{ autoCommit: autocommit });
      
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err.message);
        }
      }
    }
    return result;
  }

  
module.exports = {
    'select': select,    
    'update': update
}
