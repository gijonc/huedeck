/**
 *	Huedeck, Inc
 */

import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'CollectionTag';

export default Model.define(
	tableName,
	{
		CollectionID: {
			type: DataType.STRING,
			unique: 'composite',
		},

		tagContent: {
			type: DataType.STRING,
			allowNull: false,
			unique: 'composite',
		},

		tag: {
			type: DataType.STRING,
			allowNull: false,
		},

		// e.g., year
		option: {
			type: DataType.STRING,
			allowNull: true,
		},
	},
	{
		timestamps: false,
	},
);
