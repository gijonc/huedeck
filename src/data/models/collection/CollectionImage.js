/**
 *	Huedeck, Inc
 */

import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'CollectionImage';

export default Model.define(
	tableName,
	{
		CollectionID: {
			type: DataType.STRING,
			unique: 'composite',
		},

		src: {
			type: DataType.STRING,
			allowNull: false,
			unique: true,
		},

		position: {
			type: DataType.INTEGER,
			unique: 'composite',
			defaultValue: 1,
			validate: {
				min: {
					args: [1],
					msg: 'min value of field [position] is 1',
				},
			},
		},
	},
	{
		timestamps: false,
	},
);
