function getfileName(prefix,param) {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD 형식으로 변환
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 랜덤 3자리 숫자
  
    return `${prefix}_${param}_${formattedDate}_${randomSuffix}.csv`;
  }

  module.exports = {
    'getfileName': getfileName,    
  }
