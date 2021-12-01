/**
 *	Huedeck, Inc
 */

import DataType from 'sequelize';
import Model from '../../sequelize';

const tableName = 'UserCart';

export default Model.define(
	tableName,
	{
		checkoutId: {
			type: DataType.STRING,
			primaryKey: true,
		},

		isGuest: {
			type: DataType.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
		updatedAt: false,
		deletedAt: 'completedAt',
		paranoid: true,
	},
);
