/**
 * Huedeck, Inc
 */

import cryptojs from 'crypto-js';
import config from '../../config';
import smtpTransport from './mailer';

function verfiyUserEmail(user) {
	const { id, emailAddress, profile, emailConfirmed } = user;
	const key = user.passwordHash || user.logins[0].key;

	// skip sending verification if this email has already been confirmed
	if (!emailConfirmed) {
		const expiresIn = new Date().setHours(new Date().getHours() + 12);
		const content = {
			expiresIn,
			emailConfirmed,
		};

		const cipherId = cryptojs.AES.encrypt(
			JSON.stringify({
				id,
			}),
			'emailConfirm',
		).toString();
		const secret = cryptojs.AES.encrypt(JSON.stringify(content), key).toString();

		const verifyLink = `${config.api.clientUrl}/account/confirm-email?id=${encodeURIComponent(
			cipherId,
		)}&secret=${encodeURIComponent(secret)}`;

		const mailOptions = {
			to: emailAddress,
			subject: 'Confirm your Email',
			html: `
							Hi <span style="text-transform: capitalize">${profile.displayName}</span>,
							<br><br> 
							Welcome to Huedeck! 
							<br>
							At Huedeck, we strive to find the best matching furnishing items for your loving home with care of harmony.
							<br>
							Simply click on the link below to confirm your account.
							<br><br> 
							<a href="${verifyLink}">Confirm Account</a>
							<br><br> 
							Thanks,
							<br>
							The Huedeck Team
						`,
		};
		smtpTransport.sendMail(mailOptions, (err, info) => {
			if (err) {
				throw new Error(err);
			} else if (!info.accepted.length || info.rejected.length) {
				throw new Error(`failed to sent email: ${emailAddress}`);
			}
		});
		return true;
	}

	return false;
}

function updatePasswordNotice(user) {
	const mailOptions = {
		to: user.emailAddress,
		subject: 'Your Huedeck account password has been reset',
		html: `
					Hi <span style="text-transform: capitalize">${user.profile.displayName}</span>,
					<br><br> 
					Your password for your Huedeck account (<strong>${user.emailAddress}</strong>) 
					has been succesfully reset.
					<br><br>
					If you did not make this change, please contact <a href="mailto:hi@huedeck.com">hi@huedeck.com</a>.
					<br><br>
					Thanks,
					<br>
					The Huedeck Team
				`,
	};

	smtpTransport.sendMail(mailOptions, (err, info) => {
		if (err) {
			console.error(err);
		} else if (!info.accepted.length || info.rejected.length) {
			console.error(`failed to sent email: ${user.emailAddress}`);
		}
	});
}

export default {
	verfiyUserEmail,
	updatePasswordNotice,
};
