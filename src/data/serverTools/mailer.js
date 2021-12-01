import nodemailer from 'nodemailer';

const smtpTransport = nodemailer.createTransport({
	service: 'hotmail',
	auth: {
		user: 'hi@huedeck.com',
		pass: 'Mw&bTNP7Fl',
	},
});

export default smtpTransport;
