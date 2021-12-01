/**
 *	Huedeck, Inc
 */

import { User, UserLogin, UserProfile, UserVerificationCode } from 'data/models';
import cryptojs from 'crypto-js';
import smtpTransport from 'data/serverTools/mailer';
import config from '../../../../config';
import { isValidPasswordInput, to } from '../../utils';

export const schema = [
	`
  type MutatePasswordResult {
	  errMsg: String
  }

  type EmailVerifyResult {
	  email: String
	  errMsg: String
  }
`,
];

export const mutation = [
	`
  sendForgetPasswordReq(
	 emailAddress: String!
  ): MutatePasswordResult

  resetPassword(
	  id: String!
	  secret: String!
	  password: String!
	  confirmPassword: String!
  ): MutatePasswordResult

  verifyPasswordResetReq(
		id: String!
		secret: String!
  ): MutatePasswordResult

  verifyEmailConfirmReq(
		id: String!
		secret: String!
  ): EmailVerifyResult
`,
];

const USER_ID_ENCRIPT_KEY = 'R!Pm_nXv#1Uh^m0+gdR';

async function checkValidUrlToken(id, secret, type) {
	let validToken = false;
	const decryptedData = {};

	try {
		const bytes = cryptojs.AES.decrypt(id, USER_ID_ENCRIPT_KEY);
		Object.assign(decryptedData, await JSON.parse(bytes.toString(cryptojs.enc.Utf8)));
	} catch (e) {
		return null;
	}

	if (decryptedData.id) {
		const hash = cryptojs.HmacSHA256(secret, type).toString();
		validToken = await UserVerificationCode.findOne({
			raw: true,
			attributes: ['expiry', 'hash'],
			where: {
				UserID: decryptedData.id,
				hash,
			},
		}).then(async res => {
			// check hash exists
			if (!res) return false;

			// check expiration if exists, destroy it if expired
			if (res && res.expiry < new Date()) {
				await UserVerificationCode.destroy({
					where: {
						UserID: decryptedData.id,
						hash,
					},
				});
				return false;
			}
			Object.assign(decryptedData, { hash: res.hash });
			return true;
		});
	}
	return validToken ? decryptedData : null;
}

async function saveHashToDatabse(key, expiry, secret, UserID) {
	const hash = cryptojs.HmacSHA256(secret, key).toString();
	// may consider to use more naive way to store since upsert doesn't return a result for successfully updated
	const [sysErr, tokenCreated] = await to(
		UserVerificationCode.upsert({
			UserID,
			hash,
			expiry,
		}),
	);

	if (sysErr) {
		console.error(sysErr);
		return false;
	}
	return tokenCreated !== null;
}

export const resolvers = {
	Mutation: {
		async sendForgetPasswordReq(parent, args) {
			let errMsg = null;

			const [sysError, user] = await to(
				User.findOne({
					attributes: ['id', 'passwordHash'],
					where: {
						emailAddress: args.emailAddress,
					},
					include: [
						{
							model: UserProfile,
							as: 'profile',
							attributes: ['displayName'],
						},
					],
				}),
			);

			if (user) {
				const expiry = new Date().setHours(new Date().getHours() + 12); // hours
				const secret = cryptojs.SHA256(args.emailAddress + expiry).toString();
				const cipherId = cryptojs.AES.encrypt(
					JSON.stringify({ id: user.id }),
					USER_ID_ENCRIPT_KEY,
				).toString();

				const hashedCreated = await saveHashToDatabse('passwordReset', expiry, secret, user.id);

				if (hashedCreated) {
					const verifyLink = `${
						config.api.clientUrl
					}/account/reset-password?id=${encodeURIComponent(
						cipherId,
					)}&secret=${encodeURIComponent(secret)}`;
					const mailOptions = {
						to: args.emailAddress,
						subject: 'Reset your password',
						html: `
							Hi <span style="text-transform: capitalize">${user.profile.displayName.split(' ')[0]}</span>,
							<br><br> 
							We have recently recevied a request to reset your password for your Huedeck account.
							You can now use the link below to reset it.
							<br><br>
							<a href="${verifyLink}">Reset Password</a>
							<br><br>
							If you did not make this request, please ignore this email or contact
							<a href="mailto:hi@huedeck.com">hi@huedeck.com</a> if you have any questions.
							<br><br>
							Thanks,
							<br>
							The Huedeck Team.
						`,
					};
					await smtpTransport.sendMail(mailOptions, (err, info) => {
						if (err) throw err;
						if (!info.accepted.length || info.rejected.length) {
							errMsg = 'Email sent failed, please try again';
						}
					});
				} else {
					errMsg = 'Email sent failed, please try again';
				}
			}

			if (sysError) {
				throw sysError;
			}

			return { errMsg };
		},

		async verifyPasswordResetReq(parent, args) {
			try {
				const verified = await checkValidUrlToken(args.id, args.secret, 'passwordReset');
				return { errMsg: verified ? null : 'Your request has been expired or invalid.' };
			} catch (err) {
				throw err;
			}
		},

		async resetPassword(parent, args) {
			let isReset = false;
			// check valid reset request and get id from request
			const [sysError, verified] = await to(
				checkValidUrlToken(args.id, args.secret, 'passwordReset'),
			);

			if (!verified) {
				return { errMsg: 'Your request has been expired or invalid.' };
			}
			const pswValidError = isValidPasswordInput(args.password, args.confirmPassword);
			if (pswValidError && typeof pswValidError === 'string') {
				return { errMsg: pswValidError };
			}

			if (
				Object.prototype.hasOwnProperty.call(verified, 'id') &&
				Object.prototype.hasOwnProperty.call(verified, 'hash')
			) {
				try {
					isReset = await User.update(
						{
							passwordHash: args.password,
						},
						{
							where: { id: verified.id },
						},
					).then(async res => {
						// only 1 record to be updated at once
						if (res[0] === 1) {
							const destroyed = await UserVerificationCode.destroy({
								where: {
									UserID: verified.id,
									hash: verified.hash,
								},
							});
							return destroyed;
						}
						return false;
					});
				} catch (err) {
					throw err;
				}
			}

			if (sysError) throw sysError;

			return {
				errMsg: isReset ? null : 'Reset password failed',
			};
		},

		async verifyEmailConfirmReq(parent, args) {
			let email = null;
			let sysError;
			let verified = false;
			const decryptedData = {};

			try {
				const bytes = cryptojs.AES.decrypt(args.id, 'emailConfirm');
				Object.assign(decryptedData, await JSON.parse(bytes.toString(cryptojs.enc.Utf8)));
				if (!decryptedData.id) throw new Error('invalid');
			} catch (e) {
				return { errMsg: 'Your request has been expired or invalid.' };
			}

			// find user by id
			[sysError, verified] = await to(
				User.findOne({
					attributes: ['emailAddress', 'emailConfirmed', 'passwordHash'],
					where: { id: decryptedData.id },
					include: [
						{
							model: UserLogin,
							as: 'logins',
							attributes: ['key'],
						},
					],
				}).then(async user => {
					// check if user exist and if its email is NOT been verified
					if (user && !user.emailConfirmed) {
						const key = user.passwordHash || user.logins[0].key;
						const secretContent = {};
						try {
							const bytes = cryptojs.AES.decrypt(args.secret, key);
							Object.assign(
								secretContent,
								await JSON.parse(bytes.toString(cryptojs.enc.Utf8)),
							);
						} catch (e) {
							// secret parse error
							return false;
						}

						// check valid secret
						if (
							Object.prototype.hasOwnProperty.call(secretContent, 'expiresIn') &&
							Object.prototype.hasOwnProperty.call(secretContent, 'emailConfirmed')
						) {
							// check if secret expired or reused
							if (
								secretContent.expiresIn > new Date().getTime() &&
								secretContent.emailConfirmed === false &&
								secretContent.emailConfirmed === user.emailConfirmed
							) {
								let updated = false;
								// valid secret, update user database
								[sysError, updated] = await to(
									User.update(
										{ emailConfirmed: true },
										{
											where: {
												emailAddress: user.emailAddress,
											},
										},
									),
								);
								if (updated[0] === 1) {
									email = user.emailAddress;
									return true;
								}
							}
						}
					}
					return false;
				}),
			);

			if (sysError) {
				console.error('verifyEmailConfirmReq->', sysError.message);
				throw sysError.message;
			}

			return {
				errMsg: verified ? null : 'Your request has been expired or invalid.',
				email,
			};
		},
	},
};
