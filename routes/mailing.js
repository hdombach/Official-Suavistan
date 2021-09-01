const nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
	  user: process.env.EMAIL,
	  pass: process.env.EMAIL_PASSWORD
	}
});

function sendEmail(recipient, title, content) {
	var mailOptions = {
		from: process.env.EMAIL,
		to: recipient,
		subject: title,
		html: content
	  };
	  
	  transporter.sendMail(mailOptions, function(error, info){
		if (error) {
		  console.log(error);
		}
	  });
}

module.exports = { sendEmail }