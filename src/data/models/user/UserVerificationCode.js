import DataType from 'sequelize';
import Model from '../../sequelize';

const UserVerificationCode = Model.define(
	'UserVerificationCode',
	{
		UserID: {
			type: DataType.UUID,
			primaryKey: true,
		},

		hash: {
			type: DataType.STRING,
			allowNull: false,
		},

		expiry: {
			type: DataType.DATE,
			allowNull: false,
		},
	},

	// only keep updated time
	{
		createdAt: false,
	},
);

export default UserVerificationCode;
