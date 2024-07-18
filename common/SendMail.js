const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'dw.helo.email@gmail.com', // 발신자 이메일
      pass: 'duff gtdb mdlq imsr', // 발신자 이메일 비밀번호
    },
  });

function SendMail(options){
    transporter.sendMail(options, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
  }

  module.exports = {
    'SendMail': SendMail,    
  }  
