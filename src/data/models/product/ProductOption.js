import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'ProductOption';

export default Model.define(
	tableName,
	{
		OptionID: {
			type: DataType.BIGINT,
			primaryKey: true,
		},

		optionName: {
			type: DataType.STRING,
			allowNull: false,
		},

		optionPosition: {
			type: DataType.INTEGER,
		},
	},
	{
		timestamps: false,
	},
);
