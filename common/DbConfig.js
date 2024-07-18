const setting = {
  user: 'USERNAME',
  password: 'PASSWORD',
  connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=XXX.XXX.XXX.XXX)(PORT=YYYY))(CONNECT_DATA=(SERVER=DEDICATED)(SID=ZZZZZ) ))`
};


const realset = {
  user: 'USERNAME',
  password: 'PASSWORD',
  connectString: `(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=XXX.XXX.XXX.XXX)(PORT=YYYY))(CONNECT_DATA=(SERVER=DEDICATED)(SID=ZZZZZ) ))`
};  


module.exports = {
  'setting': setting,    
  'realset': realset,
}
