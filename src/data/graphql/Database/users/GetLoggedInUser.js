import { User, UserProfile, UserLogin, UserPreference } from '../../../models';
import { to, ValidationError } from '../../utils';

export const queries = [
	`
  # Retrieves information about the currently logged-in user
  databaseGetLoggedInUser: DatabaseUser

  getUserPreference: DatabaseUserPreference
`,
];

export const resolvers = {
	RootQuery: {
		async databaseGetLoggedInUser(parent, args, context) {
			if (!context.user) {
				return null;
			}
			// Find logged in user from database
			const [sysError, dbUser] = await to(
				User.findOne({
					where: { id: context.user.id },
					include: [
						{
							model: UserProfile,
							as: 'profile',
						},
						{
							model: UserLogin,
							as: 'logins',
						},
						{
							model: UserPreference,
							as: 'preference',
							attributes: ['budget', 'color', 'roomType', 'style', 'colorMood'],
						},
					],
				}),
			);

			if (sysError) {
				console.error(sysError);
				throw new ValidationError([sysError]);
			}

			return dbUser;
		},

		async getUserPreference(parent, args, context) {
			if (!context.user) return null;

			const [sysError, result] = await to(
				UserPreference.findOne({
					where: { UserId: context.user.id },
				}),
			);

			if (sysError) {
				console.error(sysError);
				throw new ValidationError([sysError]);
			}

			return result;
		},
	},
};
