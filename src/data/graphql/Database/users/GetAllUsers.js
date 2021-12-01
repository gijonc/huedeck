/**
 *	Huedeck, Inc
 */

import {
	User,
	UserClaim,
	UserLogin,
	UserProfile,
	// UserCart,
	// CartItem
} from 'data/models';
// import { to, ValidationError } from '../../utils';

export const schema = [
	`
  type DatabaseUser {
    id: String
    emailAddress: String
	 emailConfirmed: Boolean
    logins: [DatabaseUserLogin]
    claims: [DatabaseUserClaim]
    profile: DatabaseUserProfile
    updatedAt: String
	 createdAt: String
  }

  type DatabaseUserLogin {
    name: String
    key: String
  }

  type DatabaseUserClaim {
    type: String
    value: String
  }

  type DatabaseUserProfile {
    displayName: String
    roleType: String
	 updatedAt: String
	 picture: String
  }

  type DatabaseUserPreference {
	  room: String
	  budget: Int
	  style: [String!]
	  color: [String!]
	  colorMood: [String!]
  }
`,
];

export const queries = [
	`
  databaseGetAllUsers: [DatabaseUser]

`,
];

export const resolvers = {
	RootQuery: {
		async databaseGetAllUsers() {
			const users = await User.findAll({
				include: [
					{ model: UserLogin, as: 'logins' },
					{ model: UserClaim, as: 'claims' },
					{ model: UserProfile, as: 'profile' },
				],
			});
			return users;
		},
	},
};
