import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'RoomScene';

export default Model.define(
	tableName,
	{
		id: {
			autoIncrement: true,
			primaryKey: true,
			type: DataType.BIGINT,
		},

		originImage: {
			type: DataType.STRING,
			allowNull: false,
			unique: true,
		},

		resizedImage: {
			type: DataType.STRING,
			allowNull: false,
			unique: true,
		},

		productCount: {
			type: DataType.INTEGER,
			allowNull: false,
			defaultValue: 0,
		},

		name: {
			type: DataType.STRING,
			allowNull: false,
			unique: true,
		},
	},
	{
		timestamps: false,
	},
);
