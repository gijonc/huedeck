import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'OptionValue';

export default Model.define(
	tableName,
	{
		value: {
			type: DataType.STRING,
			allowNull: false,
		},
	},
	{
		timestamps: false,
	},
);
