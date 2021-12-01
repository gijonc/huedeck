import DataType from 'sequelize';
import Model from '../../sequelize';

const UserPreference = Model.define(
	'UserPreference',
	{
		UserID: {
			type: DataType.UUID,
			primaryKey: true,
		},

		roomType: {
			type: DataType.STRING,
			allowNull: true,
		},

		budget: {
			type: DataType.JSON,
			allowNull: true,
		},

		color: {
			type: DataType.JSON,
			allowNull: true,
		},

		style: {
			type: DataType.JSON,
			allowNull: true,
		},

		colorMood: {
			type: DataType.JSON,
			allowNull: true,
		},
	},
	{
		createdAt: false,
	},
);

export default UserPreference;
