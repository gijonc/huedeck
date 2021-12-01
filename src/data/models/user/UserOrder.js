import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'UserOrder';

export default Model.define(
	tableName,
	{
		id: {
			type: DataType.STRING,
			primaryKey: true,
		},

		orderNumber: {
			type: DataType.STRING,
			allowNull: false,
			unique: true,
		},

		orderStatusUrl: {
			type: DataType.STRING,
			allowNull: false,
			unique: true,
		},
	},
	{
		updatedAt: false,
	},
);
