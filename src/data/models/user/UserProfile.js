import DataType from 'sequelize';
import Model from '../../sequelize';

const UserProfile = Model.define(
	'UserProfile',
	{
		UserID: {
			type: DataType.UUID,
			primaryKey: true,
		},

		displayName: {
			type: DataType.STRING,
		},

		picture: {
			type: DataType.STRING,
		},

		roleType: {
			type: DataType.STRING,
			defaultValue: 'guest',
			validate: {
				isIn: {
					args: [['invited', 'admin', 'guest']],
					msg: 'invalid field [roleType]',
				},
			},
		},
	},
	{
		createdAt: false,
	},
);

export default UserProfile;
