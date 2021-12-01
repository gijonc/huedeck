/**
 *	Huedeck, Inc
 */

import { User, UserProfile, UserLogin, UserPreference } from '../../../models';
import emailHelper from '../../../serverTools/emailHelper';
import { isValidPasswordInput, to } from '../../utils';

export const schema = [
	`
	type MutateUserPreferenceResult {
		success: Boolean!
	}
`,
];

export const mutation = [
	`
  updateUserPassword (
	 oldPassword: String!
	 newPassword: String!
	 newPasswordConfirm: String!
  ): MutateUserResult

  updateUserProfile (
	 content: UserProfileInput!
  ): MutateUserResult

  mutateUserPreference(
	 preference: UserPreferenceInput
  ): MutateUserPreferenceResult

  verifyUserEmail: MutateUserResult

`,
];

export const resolvers = {
	Mutation: {
		async updateUserPassword(parent, args, context) {
			// TODO:
			// if this user id is valid but has no password in database,
			// check for his/her third party login and prompt to enter new password!

			if (!context.user) {
				// this API requires logged in user
				return {
					error: {
						key: 'exceptional',
						message: 'Unauthorized request',
					},
				};
			}

			const { oldPassword, newPassword, newPasswordConfirm } = args;

			// check for valid old password
			const [systemError, updateError] = await to(
				User.findOne({
					where: {
						id: context.user.id,
					},
				}).then(async user => {
					if (user) {
						// change password required email confirmed
						if (!user.emailConfirmed) {
							return {
								key: 'email verify',
								message: 'please verify your email address before changing password',
							};
						}

						const pass = await user.verifyPassword(oldPassword);
						const comparePswError = isValidPasswordInput(newPassword, newPasswordConfirm);
						if (!pass) {
							return {
								key: 'old password',
								message: 'Your old password is incorrect!',
							};
						} else if (oldPassword === newPassword) {
							return {
								key: 'new password',
								message: 'Please use a password different than your old password!',
							};
						} else if (comparePswError) {
							return {
								key: 'new password',
								message: comparePswError,
							};
						}
						// valid input
						const updated = await User.update(
							{ passwordHash: newPassword },
							{
								where: {
									id: user.id,
								},
							},
						).then(res => res[0] === 1);

						if (updated) return null;
						return null;
					}

					// id not found in db
					return {
						key: 'exceptional',
						message: 'Unauthorized request',
					};
				}),
			);

			if (systemError) throw systemError;

			return {
				error: updateError,
			};
		},

		async updateUserProfile(parent, args, context) {
			if (!context.user) {
				// this API requires logged in user
				return {
					error: {
						key: 'exceptional',
						message: 'Unauthorized request',
					},
				};
			}

			const updateContent = {};
			const keyList = Object.keys(args.content);

			// validate input`
			for (let i = 0, len = keyList.length; i < len; i += 1) {
				const key = keyList[i];
				const str = args.content[key].trim();
				if (str && str !== '') {
					updateContent[key] = str.toLowerCase();
				} else {
					return {
						error: {
							key,
							message: 'cannot be empty.',
						},
					};
				}
			}

			const [systemError, updateError] = await to(
				UserProfile.update(updateContent, {
					where: {
						UserID: context.user.id,
					},
				}).then(res => {
					if (res && res[0] === 1) return null;
					return {
						key: 'exceptional',
						message: 'Unauthorized request',
					};
				}),
			);

			if (systemError) throw systemError;

			return {
				error: updateError,
			};
		},

		async verifyUserEmail(parent, args, context) {
			if (!context.user) {
				return {
					error: {
						key: 'exceptional',
						message: 'Unauthorized request',
					},
				};
			}

			const [systemError, updateError] = await to(
				User.findOne({
					where: { id: context.user.id },
					include: [
						{ model: UserProfile, as: 'profile' },
						{
							model: UserLogin,
							as: 'logins',
							attributes: ['key'],
						},
					],
				}).then(async user => {
					if (user) {
						const success = emailHelper.verfiyUserEmail(user);
						if (success) return null;
					}
					return {
						key: 'exceptional',
						message:
							'Failed to sent out the email! (This email address may have been verified, refresh your page to and try again).',
					};
				}),
			);

			if (systemError) throw systemError;

			return {
				error: updateError,
			};
		},

		async mutateUserPreference(parent, args, context) {
			if (!context.user) return null;

			let success = false;
			try {
				const where = { UserID: context.user.id };
				success = await UserPreference.findOrCreate({
					where,
					defaults: args.preference,
				}).spread((pref, created) => {
					if (!created) {
						// instance already exist
						const updated = UserPreference.update(args.preference, {
							where,
						}).then(res => res[0] === 1);
						return updated;
					}
					return pref.UserID === where.UserID;
				});
			} catch (err) {
				throw err.message;
			}
			return { success };
		},
	},
};
