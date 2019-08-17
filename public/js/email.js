
exports.send = (fn) => { // email操作
	var nodemailer = require('nodemailer');

	
	var transporter = nodemailer.createTransport({
    //https://github.com/andris9/nodemailer-wellknown#supported-services 支持列表
    service: 'qq',
    port: 465, // SMTP 端口
    secureConnection: true, // 使用 SSL
    auth: {
        user: '768065158@qq.com',
        //这里密码不是qq密码，是你设置的smtp密码
        pass: '*****'
    }
	});
	
	var mailOptions = {
    from: '768065158@qq.com', // 发件地址
    to: '528779822@qq.com', // 收件列表
    subject: 'Hello sir', // 标题
    //text和html两者只支持一种
    text: 'Hello ! 我是阳志飞。这是测试邮件', // 标题
    html: '<b>Hello ! 请不要回复哦 !</b>' // html 内容
};
	
	transporter.sendMail(mailOptions, function(error, info){
//	    if(error){
//	        console.log(error);
//	    }else{
//	        console.log('Message sent: ' + info.response);
//	    }
		fn(error, info);
	});
	
}

